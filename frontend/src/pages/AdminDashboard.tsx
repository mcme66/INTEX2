import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { apiGetImpactStats, type ImpactStats } from "@/utils/api";
import { BarChart2, ClipboardList, FileText, Home, RefreshCw, Heart, UserCog } from "lucide-react";
import { useLanguage } from "@/state/language";

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const ADMIN_LINKS = [
    {
      to: "/admin/caseloads",
      label: t("adminLinkCaseload"),
      description: t("adminLinkCaseloadDesc"),
      icon: ClipboardList,
    },
    {
      to: "/admin/visits",
      label: t("adminLinkVisits"),
      description: t("adminLinkVisitsDesc"),
      icon: Home,
    },
    {
      to: "/admin/process-recording",
      label: t("adminLinkProcessRecording"),
      description: t("adminLinkProcessRecordingDesc"),
      icon: FileText,
    },
    {
      to: "/admin/donors",
      label: t("adminLinkDonorMgmt"),
      description: t("adminLinkDonorMgmtDesc"),
      icon: Heart,
    },
    {
      to: "/admin/reports",
      label: t("adminLinkMlReports"),
      description: t("adminLinkMlReportsDesc"),
      icon: BarChart2,
    },
    {
      to: "/admin/staff",
      label: "Staff",
      description: "View, edit, and manage all registered users and admin accounts.",
      icon: UserCog,
    },
  ];

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await apiGetImpactStats(isRefresh);
      setStats(data);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const summaryCards = stats
    ? [
        { label: t("adminChildrenInCare"),           value: stats.activeResidents.toString() },
        { label: t("adminTotalContributions"),        value: `$${Math.round(stats.totalContributionsValue).toLocaleString()}` },
        { label: "Avg Donation per Individual",       value: `$${Math.round(stats.avgDonationPerIndividual).toLocaleString()}` },
        { label: "Avg Donation per Organization",     value: `$${Math.round(stats.avgDonationPerOrganization).toLocaleString()}` },
      ]
    : [];

  return (
    <Layout>
      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-10">
            <h1 className="font-heading text-4xl font-semibold text-foreground">
              {t("adminTitle")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t("adminDesc")}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="relative mb-12">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("adminKeyMetrics")}
              </p>
              <button
                onClick={() => fetchStats(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? t("adminRefreshing") : t("adminRefresh")}
              </button>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border border-border p-5 animate-pulse">
                    <div className="h-3 bg-secondary rounded w-2/3 mb-3" />
                    <div className="h-8 bg-secondary rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summaryCards.map((card) => (
                  <div key={card.label} className="border border-border p-5">
                    <div className="text-sm text-muted-foreground mb-2">{card.label}</div>
                    <div className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                      {card.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Two-column section */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* Left: Safehouse Occupancy */}
            <div className="border border-border p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
                {t("adminSafeHouseOccupancy")}
              </p>
              {loading ? (
                <div className="space-y-5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-3 bg-secondary rounded w-1/2 mb-2" />
                      <div className="h-2 bg-secondary rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : stats ? (
                <div className="space-y-5">
                  {stats.safehouseOccupancy.map((sh) => {
                    const pct = sh.capacity > 0 ? Math.round((sh.occupancy / sh.capacity) * 100) : 0;
                    return (
                      <div key={sh.name}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-foreground">{sh.name}</span>
                          <span className="text-muted-foreground">
                            {sh.occupancy}/{sh.capacity} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-secondary">
                          <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* Right: Admin nav links */}
            <div className="flex flex-col">
              {ADMIN_LINKS.map(({ to, label, description, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex-1 border border-border border-b-0 last:border-b p-5 hover:bg-secondary/40 transition-colors group flex items-start gap-4"
                >
                  <Icon size={16} className="text-muted-foreground group-hover:text-foreground transition-colors mt-0.5 shrink-0" />
                  <div>
                    <p className="font-heading font-semibold text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
                  </div>
                </Link>
              ))}
            </div>

          </div>

        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;
