import { useCallback, useEffect, useState } from "react";
import Layout from "@/components/Layout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { apiGetImpactStats, type ImpactStats } from "@/utils/api";

const COLORS = [
  "hsl(213,30%,16%)",
  "hsl(43,52%,55%)",
  "hsl(213,20%,28%)",
  "hsl(43,45%,72%)",
  "hsl(30,8%,62%)",
];

const TOOLTIP_STYLE = {
  border: "1px solid hsl(40,15%,87%)",
  background: "hsl(40,33%,97%)",
  fontSize: 13,
};

const Impact = () => {
  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await apiGetImpactStats(isRefresh);
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const reintegrationRate = stats
    ? Math.round((stats.reintegrationProgressCount / stats.totalResidents) * 100)
    : 0;

  const summaryCards = stats
    ? [
        { label: "Children Currently in Care", value: stats.activeResidents.toString() },
        { label: "Children Supported in Total", value: stats.totalResidents.toString() },
        { label: "Reintegration Rate", value: `~${reintegrationRate}%` },
        { label: "Active Supporters", value: stats.uniqueSuporters.toString() },
      ]
    : [];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Transparency & Accountability
            </p>
            <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground">Our Impact</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Aggregated, anonymized data showing outcomes, progress, and resource use across all program areas.
            </p>
          </div>
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 shrink-0 mb-1"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {loading && (
          <div className="text-muted-foreground text-sm py-24 text-center">Loading stats…</div>
        )}
        {error && (
          <div className="text-destructive text-sm py-8 text-center">{error}</div>
        )}

        {!loading && !error && stats && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
              {summaryCards.map((card) => (
                <div key={card.label} className="border border-border p-5">
                  <div className="text-sm text-muted-foreground mb-2">{card.label}</div>
                  <div className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                    {card.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Outcomes */}
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Outcomes
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mb-14">

              {/* Reintegration Progress */}
              <div className="border border-border p-6">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  Reintegration Progress
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  How children are progressing toward returning to a safe family environment.
                </p>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.reintegrationBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="status"
                      >
                        {stats.reintegrationBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value: number, _: string, entry: { payload?: { status?: string } }) =>
                          [`${value} children`, entry.payload?.status ?? ""]
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {stats.reintegrationBreakdown.map((item, i) => (
                      <div key={item.status} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground">{item.status}</span>
                        <span className="font-medium text-foreground ml-auto">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Children Admitted by Year */}
              <div className="border border-border p-6">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  Children Admitted by Year
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Growth in the number of children reached through our program over time.
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.residentsByYear}>
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12, fill: "hsl(213,12%,48%)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "hsl(213,12%,48%)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="hsl(43,52%,55%)" radius={[2, 2, 0, 0]} name="Children" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* Resources */}
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Resources
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mb-14">

              {/* Contributions by Type */}
              <div className="border border-border p-6">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  Contributions by Type
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  How supporters contribute — including monetary gifts, in-kind donations, and volunteered time.
                </p>
                {(() => {
                  const OTHER_TYPES = ["Time", "Skills", "SocialMedia"];
                  const grouped = stats.donationBreakdown.reduce<{ type: string; totalValue: number }[]>(
                    (acc, item) => {
                      if (OTHER_TYPES.includes(item.type)) {
                        const other = acc.find((x) => x.type === "Other");
                        if (other) other.totalValue += item.totalValue;
                        else acc.push({ type: "Other", totalValue: item.totalValue });
                      } else {
                        acc.push(item);
                      }
                      return acc;
                    },
                    []
                  );
                  return (
                    <div className="flex items-center gap-6">
                      <ResponsiveContainer width="50%" height={200}>
                        <PieChart>
                          <Pie
                            data={grouped}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={85}
                            paddingAngle={2}
                            dataKey="totalValue"
                            nameKey="type"
                          >
                            {grouped.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            formatter={(value: number, _: string, entry: { payload?: { type?: string } }) =>
                              [`$${Math.round(value).toLocaleString()}`, entry.payload?.type ?? ""]
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 flex-1">
                        {grouped.map((item, i) => (
                          <div key={item.type} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-muted-foreground">{item.type}</span>
                            <span className="font-medium text-foreground ml-auto">
                              ${Math.round(item.totalValue).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Donations over time + volunteer hours */}
              <div className="flex flex-col gap-6">
                <div className="border border-border p-6">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                    Contributions Over Time
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Total estimated value of all contributions received each year.
                  </p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={stats.donationsByYear}>
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 12, fill: "hsl(213,12%,48%)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "hsl(213,12%,48%)" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(v: number) => [`$${Math.round(v).toLocaleString()}`, "Contributions"]}
                      />
                      <Bar dataKey="totalValue" fill="hsl(43,52%,55%)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="border border-border p-6 flex items-center gap-6">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                      Volunteer Hours Contributed
                    </h3>
                    <p className="font-heading text-4xl font-bold text-foreground">
                      {Math.round(stats.totalVolunteerHours).toLocaleString()}
                      <span className="text-lg font-normal text-muted-foreground ml-2">hrs</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Combined hours donated by volunteers and skilled contributors.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground text-center">
          All data is aggregated and anonymized to protect the privacy and safety of the children in our care.
        </p>
      </div>
    </Layout>
  );
};

export default Impact;
