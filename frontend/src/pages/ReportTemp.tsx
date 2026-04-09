import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  ArrowLeft, RefreshCw, Loader2, CheckCircle, Clock,
  ChevronDown, ChevronUp, TrendingUp, Users, DollarSign,
  Heart, Building2, BarChart3, Brain, Search as SearchIcon,
  ArrowUpDown, BookOpen, Activity, HandHeart, GraduationCap, Stethoscope,
} from "lucide-react";
import { useAuth } from "@/state/auth";
import { useLanguage } from "@/state/language";
import { useMlRefresh } from "@/state/mlRefresh";
import type { Translations } from "@/i18n/translations";
import {
  apiGetMlPredictions, apiGetMlArtifact,
  apiGetImpactStats, apiGetMonthlyDonations,
  apiGetSafehousePerformance, apiGetMonthlyResidents,
  apiGetServicesProvided, apiGetBeneficiarySummary,
  apiGetEducationOutcomes, apiGetHealthOutcomes,
  type MlPrediction, type MlPredictionsResponse,
  type ImpactStats, type MonthlyDonation,
  type SafehousePerformance, type MonthlyResident,
  type ServicesProvidedResponse, type BeneficiarySummary,
  type EducationOutcomesResponse, type HealthOutcomesResponse,
} from "@/utils/api";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ── Constants ─────────────────────────────────────────────────────────────────

const COLORS = ["#d4a439", "#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c"];

type DomainConfig = {
  key: string;
  label: string;
  summaryDomainKey: string;
  predictionNotebook: string;
  explanatoryNotebook: string;
  scoreLabel: string;
  tierLabel: string;
  artifacts: { prediction: string[]; explanatory: string[] };
  insightDescription: string;
  recommendations: string[];
};

function getDomains(t: (k: keyof Translations) => string): DomainConfig[] {
  return [
    {
      key: "donor-acquisition",
      label: t("domainDonorAcqLabel"),
      summaryDomainKey: "donor",
      predictionNotebook: "donor-acquisition-prediction",
      explanatoryNotebook: "donor-acquisition-explanatory",
      scoreLabel: t("domainDonorAcqScoreLabel"),
      tierLabel: t("domainDonorAcqTierLabel"),
      artifacts: { prediction: [], explanatory: ["domain_summary.json"] },
      insightDescription: t("domainDonorAcqDesc"),
      recommendations: [t("domainDonorAcqRec1"), t("domainDonorAcqRec2")],
    },
    {
      key: "donor-churn",
      label: t("domainDonorChurnLabel"),
      summaryDomainKey: "donor-churn",
      predictionNotebook: "donor-churn-prediction",
      explanatoryNotebook: "donor-churn-explanatory",
      scoreLabel: t("domainDonorChurnScoreLabel"),
      tierLabel: t("domainDonorChurnTierLabel"),
      artifacts: { prediction: [], explanatory: ["domain_summary.json"] },
      insightDescription: t("domainDonorChurnDesc"),
      recommendations: [t("domainDonorChurnRec1"), t("domainDonorChurnRec2")],
    },
    {
      key: "incident",
      label: t("domainIncidentLabel"),
      summaryDomainKey: "incident",
      predictionNotebook: "incident-prediction",
      explanatoryNotebook: "incident-explanatory",
      scoreLabel: t("domainIncidentScoreLabel"),
      tierLabel: t("domainIncidentTierLabel"),
      artifacts: { prediction: [], explanatory: ["domain_summary.json"] },
      insightDescription: t("domainIncidentDesc"),
      recommendations: [t("domainIncidentRec1"), t("domainIncidentRec2")],
    },
    {
      key: "reintegration",
      label: t("domainReintLabel"),
      summaryDomainKey: "reintegration",
      predictionNotebook: "reintegration-prediction",
      explanatoryNotebook: "reintegration-explanatory",
      scoreLabel: t("domainReintScoreLabel"),
      tierLabel: t("domainReintTierLabel"),
      artifacts: { prediction: [], explanatory: ["domain_summary.json"] },
      insightDescription: t("domainReintDesc"),
      recommendations: [t("domainReintRec1"), t("domainReintRec2")],
    },
    {
      key: "social-media",
      label: t("domainSocialMediaLabel"),
      summaryDomainKey: "social-media",
      predictionNotebook: "social-media-prediction",
      explanatoryNotebook: "social-media-explanatory",
      scoreLabel: t("domainSocialMediaScoreLabel"),
      tierLabel: t("domainSocialMediaTierLabel"),
      artifacts: { prediction: [], explanatory: ["domain_summary.json"] },
      insightDescription: t("domainSocialMediaDesc"),
      recommendations: [t("domainSocialMediaRec1"), t("domainSocialMediaRec2")],
    },
    {
      key: "volunteer",
      label: t("domainVolunteerLabel"),
      summaryDomainKey: "volunteer",
      predictionNotebook: "volunteer-prediction",
      explanatoryNotebook: "volunteer-explanatory",
      scoreLabel: t("domainVolunteerScoreLabel"),
      tierLabel: t("domainVolunteerTierLabel"),
      artifacts: { prediction: [], explanatory: ["domain_summary.json"] },
      insightDescription: t("domainVolunteerDesc"),
      recommendations: [t("domainVolunteerRec1"), t("domainVolunteerRec2")],
    },
  ];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function tierColor(tier: string | null) {
  if (!tier) return "";
  const t = tier.toLowerCase();
  if (t.includes("high") || t.includes("red") || t.includes("critical")) return "text-red-600 font-semibold";
  if (t.includes("medium") || t.includes("amber") || t.includes("moderate")) return "text-amber-600 font-semibold";
  if (t.includes("low") || t.includes("green")) return "text-green-600 font-semibold";
  return "text-foreground";
}

function notebookStatusIcon(status: string, isRefreshing: boolean, hasRun: boolean) {
  if (status === "running") return <Loader2 size={14} className="text-amber-500 animate-spin" />;
  if (status === "complete" && (!isRefreshing || hasRun)) return <CheckCircle size={14} className="text-green-600" />;
  return <Clock size={14} className="text-muted-foreground" />;
}

function SectionHeader({ title }: { title: string }) {
  return <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{title}</h3>;
}

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string; sub?: string }) {
  return (
    <div className="border border-border p-5 bg-background">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="font-heading text-2xl font-semibold text-foreground">{value}</div>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function humanizeSummary(raw: string): string {
  const replacements: [RegExp, string][] = [
    [/\bIs Organization\b/gi, "whether the donor is an organization"],
    [/\bCreated By Partner Id\b/gi, "whether the donor was referred by a partner"],
    [/\bfirst channel source PartnerReferral\b/gi, "whether their first donation came through a partner referral"],
    [/\bComposite Health Trend\b/gi, "overall health improvement trajectory"],
    [/\bAttendance Slope 3M\b/gi, "3-month education attendance trend"],
    [/\bConsistency Score\b/gi, "how consistently they volunteer"],
    [/\bIs One Time Contributor\b/gi, "whether they only contributed once"],
    [/\bYouTube posts\b/gi, "YouTube content"],
    [/\bImpactStory content\b/gi, "impact story posts"],
    [/\btenure_days\b/gi, "length of time in care"],
    [/\bdays_since_last_case_conference\b/gi, "days since last case conference"],
    [/\bhow long since their last gift\b/gi, "how recently they last donated"],
  ];
  let result = raw;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────

function AnalyticsTab({ token }: { token: string }) {
  const { t } = useLanguage();
  const [impact, setImpact] = useState<ImpactStats | null>(null);
  const [monthly, setMonthly] = useState<MonthlyDonation[]>([]);
  const [safehouses, setSafehouses] = useState<SafehousePerformance[]>([]);
  const [residents, setResidents] = useState<MonthlyResident[]>([]);
  const [services, setServices] = useState<ServicesProvidedResponse | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiarySummary | null>(null);
  const [education, setEducation] = useState<EducationOutcomesResponse | null>(null);
  const [health, setHealth] = useState<HealthOutcomesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGetImpactStats(true),
      apiGetMonthlyDonations(token),
      apiGetSafehousePerformance(token),
      apiGetMonthlyResidents(token),
      apiGetServicesProvided(token),
      apiGetBeneficiarySummary(token),
      apiGetEducationOutcomes(token),
      apiGetHealthOutcomes(token),
    ]).then(([imp, mon, sh, res, svc, ben, edu, hlt]) => {
      setImpact(imp);
      setMonthly(mon);
      setSafehouses(sh);
      setResidents(res);
      setServices(svc);
      setBeneficiaries(ben);
      setEducation(edu);
      setHealth(hlt);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const donationChartData = useMemo(() => {
    const byMonth: Record<string, Record<string, number>> = {};
    monthly.forEach(d => {
      if (!byMonth[d.month]) byMonth[d.month] = {};
      byMonth[d.month][d.donationType] = (byMonth[d.month][d.donationType] || 0) + d.totalValue;
    });
    return Object.entries(byMonth)
      .map(([month, types]) => ({ month: month.slice(2), ...types }))
      .slice(-24);
  }, [monthly]);

  const donationTypes = useMemo(() => {
    const s = new Set<string>();
    monthly.forEach(d => s.add(d.donationType));
    return Array.from(s);
  }, [monthly]);

  const reintPieData = useMemo(() => {
    if (!impact) return [];
    return impact.reintegrationBreakdown
      .filter(r => r.status)
      .map(r => ({ name: r.status, value: r.count }));
  }, [impact]);

  if (loading) return <div className="py-20 text-center text-muted-foreground"><Loader2 className="inline animate-spin mr-2" size={20} />{t("reportsLoadingAnalytics")}</div>;
  if (!impact) return <div className="py-20 text-center text-muted-foreground">{t("reportsCouldNotLoad")}</div>;

  const reintRate = impact.totalResidents > 0
    ? ((impact.reintegrationBreakdown.find(r => r.status === "Completed")?.count ?? 0) / impact.totalResidents * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* ── Top-level KPIs ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label={t("reportsActiveResidents")} value={impact.activeResidents.toLocaleString()} sub={`${impact.totalResidents} ${t("reportsKpiTotal")}`} />
        <StatCard icon={DollarSign} label={t("donorsContributions")} value={`$${Math.round(impact.totalContributionsValue).toLocaleString()}`} sub={`${impact.uniqueSuporters} ${t("reportsKpiSupporters")}`} />
        <StatCard icon={Heart} label={t("reportsReintegrationStatus")} value={`${reintRate}%`} sub={`${impact.reintegrationProgressCount} ${t("reportsKpiInProgress")}`} />
        <StatCard icon={TrendingUp} label={t("reportsVolunteerHours")} value={Math.round(impact.totalVolunteerHours).toLocaleString()} />
      </div>

      {/* ── Services Provided + Beneficiary Counts (side-by-side) ──────── */}
      <div className="grid md:grid-cols-2 gap-4">
        {services && (
          <div className="border border-border p-5 bg-background">
            <SectionHeader title={t("reportsServicesProvided")} />
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <HandHeart size={16} className="mx-auto text-muted-foreground mb-1" />
                <p className="font-heading text-xl font-semibold text-foreground">{services.totals.totalCaring.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("reportsCaring")}</p>
              </div>
              <div className="text-center">
                <Heart size={16} className="mx-auto text-muted-foreground mb-1" />
                <p className="font-heading text-xl font-semibold text-foreground">{services.totals.totalHealing.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("reportsHealing")}</p>
              </div>
              <div className="text-center">
                <GraduationCap size={16} className="mx-auto text-muted-foreground mb-1" />
                <p className="font-heading text-xl font-semibold text-foreground">{services.totals.totalTeaching.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("reportsTeaching")}</p>
              </div>
            </div>
            {services.monthly.length > 0 && (
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={services.monthly.slice(-24).map(d => ({ ...d, month: d.month.slice(2) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} width={30} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="caring" stackId="1" stroke="#d4a439" fill="#d4a439" fillOpacity={0.4} name="Caring" />
                    <Area type="monotone" dataKey="healing" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.4} name="Healing" />
                    <Area type="monotone" dataKey="teaching" stackId="1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} name="Teaching" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {beneficiaries && (
          <div className="border border-border p-5 bg-background">
            <SectionHeader title={t("reportsBeneficiaryCounts")} />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="border border-border p-3 text-center bg-background">
                <p className="font-heading text-xl font-semibold text-foreground">{beneficiaries.totalServed.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("reportsTotalServed")}</p>
              </div>
              <div className="border border-border p-3 text-center bg-background">
                <p className="font-heading text-xl font-semibold text-foreground">{beneficiaries.currentlyActive.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("reportsActiveLabel")}</p>
              </div>
              <div className="border border-border p-3 text-center bg-background">
                <p className="font-heading text-xl font-semibold text-foreground">{beneficiaries.closedCases.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("reportsClosed")}</p>
              </div>
              <div className="border border-border p-3 text-center bg-background">
                <p className="font-heading text-xl font-semibold text-foreground">{beneficiaries.reintegrated.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("reportsReintegrated")}</p>
              </div>
            </div>
            {beneficiaries.byCategory.length > 0 && (
              <ResponsiveContainer width="100%" height={Math.min(180, Math.max(100, beneficiaries.byCategory.length * 28))}>
                <BarChart data={beneficiaries.byCategory} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 9 }} />
                  <YAxis dataKey="category" type="category" width={120} tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="count" fill="#2563eb" name="Residents" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* ── Program Outcomes (Education + Health side-by-side) ──────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        {education && (
          <div className="border border-border p-5 bg-background">
            <SectionHeader title={t("reportsEducationOutcomes")} />
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-border p-3 text-center bg-background">
                <BookOpen size={14} className="mx-auto text-muted-foreground mb-1" />
                <p className="font-heading text-xl font-semibold text-foreground">{education.overallAvgAttendance}%</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("reportsAvgAttendance")}</p>
              </div>
              <div className="border border-border p-3 text-center bg-background">
                <GraduationCap size={14} className="mx-auto text-muted-foreground mb-1" />
                <p className="font-heading text-xl font-semibold text-foreground">{education.overallAvgProgress}%</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("reportsAvgProgress")}</p>
              </div>
            </div>
            {education.enrollment.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {education.enrollment.map(e => (
                  <span key={e.status} className="text-xs border border-border px-2 py-1 text-muted-foreground">
                    {e.status}: <span className="font-medium text-foreground">{e.count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {health && (
          <div className="border border-border p-5 bg-background">
            <SectionHeader title={t("reportsHealthWellbeing")} />
            <div className="grid grid-cols-3 gap-3 mb-3">
              {([
                { icon: Stethoscope, val: health.overallAvgHealth, labelKey: "reportsGeneralHealth" as const },
                { icon: Activity, val: health.overallAvgNutrition, labelKey: "reportsNutrition" as const },
                { icon: Heart, val: health.overallAvgSleep, labelKey: "reportsSleepQuality" as const },
              ]).map(h => {
                const pct = Math.round((h.val / 5) * 100);
                const rating = pct >= 80 ? t("reportsExcellent") : pct >= 60 ? t("reportsGood") : pct >= 40 ? t("reportsFair") : t("reportsNeedsImprovement");
                const color = pct >= 80 ? "text-green-600" : pct >= 60 ? "text-green-600" : pct >= 40 ? "text-amber-600" : "text-red-600";
                const barColor = pct >= 60 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
                return (
                  <div key={h.labelKey} className="border border-border p-3 text-center bg-background">
                    <h.icon size={14} className="mx-auto text-muted-foreground mb-1" />
                    <p className="font-heading text-xl font-semibold text-foreground">{pct}%</p>
                    <p className={`text-[10px] font-medium ${color}`}>{rating}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5 mb-1.5">{t(h.labelKey)}</p>
                    <div className="w-full bg-secondary h-1.5 rounded-full">
                      <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t("reportsCheckupCompletion")}</h4>
            <div className="grid grid-cols-3 gap-3">
              {([
                { labelKey: "reportsMedical" as const, pct: health.medicalCheckupPct },
                { labelKey: "reportsDental" as const, pct: health.dentalCheckupPct },
                { labelKey: "reportsPsychological" as const, pct: health.psychCheckupPct },
              ]).map(c => (
                <div key={c.labelKey}>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{t(c.labelKey)}</span>
                    <span className="font-medium text-foreground">{c.pct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full">
                    <div className="bg-accent h-1.5 rounded-full" style={{ width: `${Math.min(100, c.pct)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Donation Trends + Contributions by Type (side-by-side) ──────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-border p-5 bg-background">
          <SectionHeader title={t("reportsDonationTrends")} />
          {donationChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={donationChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} width={40} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {donationTypes.map((t, i) => (
                  <Area key={t} type="monotone" dataKey={t} stackId="1" stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.4} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground">{t("reportsNoDonationData")}</p>}
        </div>

        <div className="border border-border p-5 bg-background">
          <SectionHeader title={t("reportsContributionsByType")} />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={impact.donationBreakdown.filter(d => d.type)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis dataKey="type" type="category" width={90} tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => `$${Math.round(v).toLocaleString()}`} />
              <Bar dataKey="totalValue" fill="#d4a439" name="Total Value ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Safehouse Performance ──────────────────────────────────────── */}
      <div className="border border-border p-5 bg-background">
        <SectionHeader title={t("reportsSafehousePerf")} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {safehouses.map(sh => (
            <div key={sh.safehouseId} className="border border-border p-3 bg-background">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-medium text-foreground text-sm">{sh.name}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${sh.occupancy >= sh.capacity ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                  {Math.round(sh.occupancy / sh.capacity * 100)}{t("reportsPercentFull")}
                </span>
              </div>
              <div className="w-full bg-secondary h-1.5 rounded-full mb-2">
                <div className="bg-accent h-1.5 rounded-full" style={{ width: `${Math.min(100, sh.occupancy / sh.capacity * 100)}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                <div><span className="font-medium text-foreground">{sh.activeResidents}</span> {t("reportsActiveSmall")}</div>
                <div><span className="font-medium text-foreground">{sh.reintegratedCount}</span> {t("reportsReintegSmall")}</div>
                <div><span className="font-medium text-foreground">{sh.incidentCount}</span> {t("reportsIncidents")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reintegration Status + Resident Flow (side-by-side) ─────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-border p-5 bg-background">
          <SectionHeader title={t("reportsReintegrationStatus")} />
          {reintPieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={reintPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={70} paddingAngle={2} dataKey="value">
                      {reintPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`${value} residents`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-2">
                {impact.reintegrationBreakdown.filter(r => r.status).map((r, i) => {
                  const pct = impact.totalResidents > 0 ? Math.round(r.count / impact.totalResidents * 100) : 0;
                  return (
                    <div key={r.status} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-foreground font-medium">{r.status}</span>
                          <span className="text-muted-foreground">{r.count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-secondary h-1 rounded-full mt-0.5">
                          <div className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : <p className="text-sm text-muted-foreground">No data.</p>}
        </div>

        {residents.length > 0 && (
          <div className="border border-border p-5 bg-background">
            <SectionHeader title={t("reportsAdmissionsClosures")} />
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={residents.slice(-24)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} tickFormatter={v => v.slice(2)} />
                <YAxis tick={{ fontSize: 9 }} width={30} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="admissions" fill="#2563eb" name={t("reportsAdmissionsLegend")} />
                <Bar dataKey="closures" fill="#16a34a" name={t("reportsClosuresLegend")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
}

// ── Domain Accordion (simplified) ─────────────────────────────────────────────

type DomainAccordionProps = {
  domain: DomainConfig;
  token: string;
  notebookStatuses: Record<string, string>;
  completedThisRun: Set<string>;
  pendingAtCycleStart: Set<string>;
  isRefreshing: boolean;
  summary: string | null;
  predRefreshKey: number;
};

function DomainAccordion({ domain, token, notebookStatuses, completedThisRun, pendingAtCycleStart, isRefreshing, summary, predRefreshKey }: DomainAccordionProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [domainSummaryText, setDomainSummaryText] = useState<string | null>(null);
  const summaryLoaded = useRef(false);

  const predStatus = notebookStatuses[domain.predictionNotebook] ?? "idle";
  const explStatus = notebookStatuses[domain.explanatoryNotebook] ?? "idle";
  const explPending = isRefreshing && pendingAtCycleStart.has(domain.explanatoryNotebook);
  const explHasRun = !explPending || completedThisRun.has(domain.explanatoryNotebook);
  const predPending = isRefreshing && pendingAtCycleStart.has(domain.predictionNotebook);
  const predHasRun = !predPending || completedThisRun.has(domain.predictionNotebook);

  useEffect(() => {
    if (!open || summaryLoaded.current) return;
    summaryLoaded.current = true;
    apiGetMlArtifact<{ summary?: string }>(token, `${domain.key}-explanatory`, "domain_summary.json")
      .then(data => { if (data?.summary) setDomainSummaryText(data.summary); })
      .catch(() => {});
  }, [open, domain, token]);

  const displaySummary = summary || domainSummaryText || null;

  return (
    <>
      {viewAll && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-y-auto">
          <div className="w-full max-w-5xl bg-background border border-border p-8 mt-4 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-semibold text-foreground">{domain.label} — {t("reportsAllRecords")}</h2>
              <button onClick={() => setViewAll(false)} className="text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1">{t("reportsClose")}</button>
            </div>
            <PredictionsTable notebook={domain.predictionNotebook} scoreLabel={domain.scoreLabel} tierLabel={domain.tierLabel} token={token} modal refreshKey={predRefreshKey} />
          </div>
        </div>
      )}

      <div className="border border-border bg-background">
        <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-secondary transition-colors text-left bg-background">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-heading font-semibold text-foreground">{domain.label}</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">{notebookStatusIcon(explStatus, isRefreshing, explHasRun)} {t("reportsAnalysisLabel")}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">{notebookStatusIcon(predStatus, isRefreshing, predHasRun)} {t("reportsPredictionLabel")}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{domain.insightDescription}</p>
          </div>
          {open ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
        </button>

        {open && (
          <div className="px-6 pb-6 border-t border-border pt-5 space-y-6">
            {displaySummary && (
              <div className="bg-background border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t("reportsAnalysisSummary")}</p>
                <p className="text-sm text-foreground leading-relaxed">{humanizeSummary(displaySummary)}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{t("reportsActionableRecs")}</p>
              <div className="space-y-2">
                {domain.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-background border border-border text-sm">
                    <span className="text-accent font-bold shrink-0">{i + 1}.</span>
                    <p className="text-foreground">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("reportsPredictionRecords")}</p>
                <button onClick={() => setViewAll(true)} className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1">{t("reportsViewAll")}</button>
              </div>
              <PredictionsTable notebook={domain.predictionNotebook} scoreLabel={domain.scoreLabel} tierLabel={domain.tierLabel} token={token} refreshKey={predRefreshKey} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Predictions Table ─────────────────────────────────────────────────────────

function PredictionsTable({ notebook, scoreLabel, tierLabel, token, modal = false, refreshKey }: { notebook: string; scoreLabel: string; tierLabel: string; token: string; modal?: boolean; refreshKey: number }) {
  const { t } = useLanguage();
  const SORT_OPTIONS = [
    { key: "score_desc", label: "Score: High → Low" },
    { key: "score_asc",  label: "Score: Low → High" },
    { key: "label_asc",  label: "Name: A → Z" },
    { key: "label_desc", label: "Name: Z → A" },
  ] as const;
  const [data, setData] = useState<MlPredictionsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sortIdx, setSortIdx] = useState(0);
  const pageSize = modal ? 9999 : 10;

  const sort = SORT_OPTIONS[sortIdx].key;

  const load = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try { setData(await apiGetMlPredictions(token, notebook, p, pageSize, modal, s)); } catch {} finally { setLoading(false); }
  }, [token, notebook, pageSize, modal]);

  useEffect(() => { setPage(1); }, [sort]);
  useEffect(() => { void load(page, sort); }, [page, sort, load, refreshKey]);

  const cycleSort = () => setSortIdx(i => (i + 1) % SORT_OPTIONS.length);

  if (loading) return <div className="py-8 text-center text-sm text-muted-foreground"><Loader2 size={16} className="inline animate-spin mr-2" />{t("reportsLoadingDots")}</div>;
  if (!data || data.records.length === 0) return <div className="py-8 text-center text-sm text-muted-foreground">{t("reportsNoPredictions")}</div>;

  const totalPages = Math.ceil(data.totalCount / pageSize);

  return (
    <div>
      {!modal && (
        <div className="flex justify-end mb-2">
          <button onClick={cycleSort} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1">
            <ArrowUpDown size={12} />
            {SORT_OPTIONS[sortIdx].label}
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("reportsRecordCol")}</th>
              <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("reportsTypeCol")}</th>
              <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{scoreLabel}</th>
              <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{tierLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.records.map((r: MlPrediction) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary transition-colors">
                <td className="py-2.5 px-3 font-medium text-foreground">{r.label}</td>
                <td className="py-2.5 px-3 text-muted-foreground capitalize">{r.recordType}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{r.score != null ? (r.score > 1 ? r.score.toFixed(1) : `${(r.score * 100).toFixed(1)}%`) : "—"}</td>
                <td className={`py-2.5 px-3 ${tierColor(r.tier)}`}>{r.tier ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!modal && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-muted-foreground">{data.totalCount} {t("reportsTotal")} · {t("reportsPage")} {page} {t("reportsOf")} {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border border-border hover:bg-secondary disabled:opacity-40">{t("reportsPrevious")}</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border border-border hover:bg-secondary disabled:opacity-40">{t("reportsNextPage")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Record Lookup (Interactive Prediction) ────────────────────────────────────

function RecordLookup({ token, domains }: { token: string; domains: DomainConfig[] }) {
  const { t } = useLanguage();
  const [selectedDomain, setSelectedDomain] = useState(domains[0]?.key ?? "");
  const [searchTerm, setSearchTerm] = useState("");
  const [allRecords, setAllRecords] = useState<MlPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MlPrediction | null>(null);

  const domain = domains.find(d => d.key === selectedDomain) ?? domains[0];

  useEffect(() => {
    setLoading(true);
    setSelected(null);
    setSearchTerm("");
    apiGetMlPredictions(token, domain.predictionNotebook, 1, 9999, true)
      .then(r => setAllRecords(r.records))
      .catch(() => setAllRecords([]))
      .finally(() => setLoading(false));
  }, [token, domain.predictionNotebook]);

  const filtered = useMemo(() => {
    if (!searchTerm) return allRecords.slice(0, 20);
    const s = searchTerm.toLowerCase();
    return allRecords.filter(r => r.label.toLowerCase().includes(s) || r.recordId.includes(s)).slice(0, 20);
  }, [allRecords, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-secondary/30 border border-border p-5">
        <p className="text-sm text-foreground leading-relaxed">
          {t("reportsSelectDomainDesc")}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {domains.map(d => (
          <button key={d.key} onClick={() => setSelectedDomain(d.key)} className={`px-4 py-2 text-sm border transition-colors ${d.key === selectedDomain ? "border-accent bg-accent/10 text-foreground font-medium" : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
            {d.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input className="w-full border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent" placeholder={t("reportsSearchByName")} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {loading && <div className="py-8 text-center text-muted-foreground"><Loader2 className="inline animate-spin mr-2" size={16} />{t("reportsLoadingRecords")}</div>}

      {!loading && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-border max-h-[400px] overflow-y-auto bg-background">
            {filtered.length === 0 && <p className="p-4 text-sm text-muted-foreground">{t("reportsNoRecordsFound")}</p>}
            {filtered.map(r => (
              <button key={r.id} onClick={() => setSelected(r)} className={`w-full text-left px-4 py-3 border-b border-border bg-background hover:bg-secondary transition-colors ${selected?.id === r.id ? "bg-secondary" : ""}`}>
                <div className="flex justify-between">
                  <span className="font-medium text-foreground text-sm">{r.label}</span>
                  <span className={`text-xs ${tierColor(r.tier)}`}>{r.tier}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.recordType} · Score: {r.score != null ? (r.score > 1 ? r.score.toFixed(2) : `${(r.score * 100).toFixed(1)}%`) : "—"}</div>
              </button>
            ))}
          </div>

          <div className="border border-border p-6 bg-background">
            {!selected ? (
              <div className="text-center text-muted-foreground py-12">
                <SearchIcon size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">{t("reportsSelectRecord")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-heading text-lg font-semibold text-foreground">{selected.label}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("reportsRecordType")}</p>
                    <p className="text-sm font-medium text-foreground capitalize">{selected.recordType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("reportsRecordId")}</p>
                    <p className="text-sm font-medium text-foreground">{selected.recordId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{domain.scoreLabel}</p>
                    <p className="text-lg font-heading font-semibold text-foreground">{selected.score != null ? (selected.score > 1 ? selected.score.toFixed(2) : `${(selected.score * 100).toFixed(1)}%`) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{domain.tierLabel}</p>
                    <p className={`text-lg font-heading font-semibold ${tierColor(selected.tier)}`}>{selected.tier ?? "—"}</p>
                  </div>
                </div>
                {selected.score != null && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{t("reportsScoreGauge")}</p>
                    <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                      <div className={`h-3 rounded-full transition-all ${selected.score > 0.7 ? "bg-red-500" : selected.score > 0.4 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${Math.min(100, (selected.score > 1 ? selected.score : selected.score * 100))}%` }} />
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  {t("reportsLastScored")} {new Date(selected.refreshedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const ReportTemp = () => {
  const { token } = useAuth();
  const { lang, t } = useLanguage();
  const { status, summaries, isRefreshing, startRefresh, startRetrain, error } = useMlRefresh();
  const domains = useMemo(() => getDomains(t), [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const [activeTab, setActiveTab] = useState<"analytics" | "insights" | "lookup">("analytics");

  const [pendingAtCycleStart, setPendingAtCycleStart] = useState<Set<string>>(new Set());
  const [completedThisRun, setCompletedThisRun] = useState<Set<string>>(new Set());
  const prevStatusRef = useRef<Record<string, string>>({});
  const [refreshKeys, setRefreshKeys] = useState<Record<string, number>>({});

  const notebookStatuses: Record<string, string> = {};
  status?.notebooks.forEach(n => { notebookStatuses[n.notebook] = n.status; });

  // Optimistically mark notebooks as pending immediately on button click so icons
  // flip to clocks before the API round-trip completes.
  const handleRetrain = () => {
    // Full retrain: all prediction + analysis notebooks become clocks instantly.
    const pending = new Set<string>();
    domains.forEach(d => { pending.add(d.predictionNotebook); pending.add(d.explanatoryNotebook); });
    setPendingAtCycleStart(pending);
    setCompletedThisRun(new Set());
    void startRetrain();
  };

  const handleRefresh = () => {
    // Refresh predictions only: only prediction notebooks become clocks (not analysis).
    const pending = new Set<string>();
    domains.forEach(d => { pending.add(d.predictionNotebook); });
    setPendingAtCycleStart(pending);
    setCompletedThisRun(new Set());
    void startRefresh();
  };

  const prevRefreshingRef = useRef(false);
  useEffect(() => {
    // Fallback: if isRefreshing flips on without a button click (e.g. page load
    // while a run is already in progress), populate pendingAtCycleStart from
    // actual notebook statuses as before.
    if (isRefreshing && !prevRefreshingRef.current && pendingAtCycleStart.size === 0) {
      const pending = new Set(
        Object.entries(notebookStatuses).filter(([, st]) => st !== "complete").map(([nb]) => nb)
      );
      if (Object.keys(notebookStatuses).length === 0) {
        domains.forEach(d => { pending.add(d.predictionNotebook); pending.add(d.explanatoryNotebook); });
      }
      setPendingAtCycleStart(pending);
      setCompletedThisRun(new Set());
    }
    prevRefreshingRef.current = isRefreshing;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefreshing]);

  useEffect(() => {
    const prev = prevStatusRef.current;
    const newlyCompleted: string[] = [];
    for (const [nb, st] of Object.entries(notebookStatuses)) {
      if (st === "complete" && prev[nb] !== "complete") newlyCompleted.push(nb);
    }
    if (newlyCompleted.length > 0) {
      setCompletedThisRun(s => { const n = new Set(s); newlyCompleted.forEach(nb => n.add(nb)); return n; });
      setRefreshKeys(k => { const n = { ...k }; newlyCompleted.forEach(nb => { n[nb] = (n[nb] ?? 0) + 1; }); return n; });
    }
    prevStatusRef.current = { ...notebookStatuses };
  });

  const lastUpdated = status?.notebooks.map(n => n.completedAt).filter(Boolean).sort().at(-1);

  return (
    <Layout>
      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl relative">
          {/* Alternating background strips */}
          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen -z-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom," +
                "transparent 0," +
                "transparent 24rem," +
                "hsl(var(--accent) / 0.16) 24rem," +
                "hsl(var(--accent) / 0.16) 44rem," +
                "transparent 44rem," +
                "transparent 68rem," +
                "hsl(199 80% 92% / 0.35) 68rem," +
                "hsl(199 80% 92% / 0.35) 88rem," +
                "transparent 88rem," +
                "transparent 112rem" +
                ")",
            }}
          />

          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft size={13} />
            {t("navAdminDashboard")}
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-semibold text-foreground">{t("reportsFullTitle")}</h1>
            <p className="mt-2 text-muted-foreground">{t("reportsSubtitleText")}</p>
            {lastUpdated && <p className="mt-1 text-xs text-muted-foreground">{t("reportsMlLastUpdated")} {new Date(lastUpdated).toLocaleString()}</p>}
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-border mb-8">
            {([
              { key: "analytics", label: t("reportsTabAnalytics"), icon: BarChart3 },
              { key: "lookup", label: t("reportsTabLookup"), icon: SearchIcon },
              { key: "insights", label: t("reportsTabInsights"), icon: Brain },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${activeTab === tab.key ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "analytics" && token && <AnalyticsTab token={token} />}

          {activeTab === "lookup" && token && <RecordLookup token={token} domains={domains} />}

          {activeTab === "insights" && (
            <div className="space-y-3">
              <div className="flex items-center justify-end gap-2 mb-1">
                <button onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-2 border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50">
                  <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                  {isRefreshing ? t("reportsRunning") : t("reportsRefreshPredictions")}
                </button>
                <button onClick={handleRetrain} disabled={isRefreshing} className="flex items-center gap-2 border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary disabled:opacity-50">
                  {t("reportsFullRetrain")}
                </button>
                {error && <p className="text-xs text-red-500 ml-2">{error}</p>}
              </div>
              {domains.map(domain => (
                <DomainAccordion
                  key={domain.key}
                  domain={domain}
                  token={token ?? ""}
                  notebookStatuses={notebookStatuses}
                  completedThisRun={completedThisRun}
                  pendingAtCycleStart={pendingAtCycleStart}
                  isRefreshing={isRefreshing}
                  summary={summaries[domain.summaryDomainKey] ?? null}
                  predRefreshKey={refreshKeys[domain.predictionNotebook] ?? 0}
                />
              ))}
            </div>
          )}

        </div>
      </section>
    </Layout>
  );
};

export default ReportTemp;
