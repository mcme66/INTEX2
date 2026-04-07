import Layout from "@/components/Layout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";

const COLORS = ["hsl(213,30%,16%)", "hsl(43,52%,55%)", "hsl(213,20%,28%)", "hsl(43,45%,72%)", "hsl(30,8%,62%)"];

const beneficiaryData = [
  { year: "2019", children: 42 },
  { year: "2020", children: 58 },
  { year: "2021", children: 73 },
  { year: "2022", children: 95 },
  { year: "2023", children: 112 },
  { year: "2024", children: 127 },
];

const fundAllocation = [
  { name: "Safe Houses", value: 42 },
  { name: "Education", value: 22 },
  { name: "Trauma Recovery", value: 18 },
  { name: "Vocational Training", value: 10 },
  { name: "Operations", value: 8 },
];

const monthlyDonations = [
  { month: "Jan", amount: 28400 },
  { month: "Feb", amount: 31200 },
  { month: "Mar", amount: 27800 },
  { month: "Apr", amount: 35600 },
  { month: "May", amount: 42100 },
  { month: "Jun", amount: 38900 },
  { month: "Jul", amount: 33200 },
  { month: "Aug", amount: 36500 },
  { month: "Sep", amount: 41800 },
  { month: "Oct", amount: 39400 },
  { month: "Nov", amount: 45200 },
  { month: "Dec", amount: 52300 },
];

const safehouseData = [
  { name: "Bogotá", children: 38, capacity: 45 },
  { name: "Medellín", children: 32, capacity: 35 },
  { name: "Cali", children: 29, capacity: 30 },
  { name: "Cartagena", children: 28, capacity: 30 },
];

const Impact = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="font-heading text-3xl font-semibold text-foreground">Impact Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Aggregated, anonymized data showing how your contributions make a difference.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {[
            { label: "Children Currently in Care", value: "127" },
            { label: "Total Funds Raised (2024)", value: "$452,600" },
            { label: "Reintegration Rate", value: "89%" },
            { label: "Active Volunteers", value: "34" },
          ].map((card) => (
            <div key={card.label} className="border border-border p-5">
              <div className="text-sm text-muted-foreground mb-2">{card.label}</div>
              <div className="font-heading text-2xl md:text-3xl font-bold text-foreground">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-8 mb-14">
          {/* Beneficiaries over time */}
          <div className="border border-border p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
              Children Served by Year
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={beneficiaryData}>
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: "hsl(213,12%,48%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(213,12%,48%)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ border: "1px solid hsl(40,15%,87%)", background: "hsl(40,33%,97%)", fontSize: 13 }}
                />
                <Bar dataKey="children" fill="hsl(43,52%,55%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fund Allocation */}
          <div className="border border-border p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
              Fund Allocation
            </h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={fundAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {fundAllocation.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ border: "1px solid hsl(40,15%,87%)", background: "hsl(40,33%,97%)", fontSize: 13 }}
                    formatter={(value: number) => `${value}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {fundAllocation.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium text-foreground ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid md:grid-cols-2 gap-8 mb-14">
          {/* Monthly Donations */}
          <div className="border border-border p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
              Monthly Donations (2024)
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyDonations}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,87%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(213,12%,48%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(213,12%,48%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ border: "1px solid hsl(40,15%,87%)", background: "hsl(40,33%,97%)", fontSize: 13 }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Line type="monotone" dataKey="amount" stroke="hsl(213,30%,16%)" strokeWidth={2} dot={{ fill: "hsl(43,52%,55%)", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Safe House Capacity */}
          <div className="border border-border p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
              Safe House Occupancy
            </h3>
            <div className="space-y-5 mt-2">
              {safehouseData.map((sh) => {
                const pct = Math.round((sh.children / sh.capacity) * 100);
                return (
                  <div key={sh.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-foreground">{sh.name}</span>
                      <span className="text-muted-foreground">{sh.children}/{sh.capacity} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-secondary">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="border border-border p-6 mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Key Milestones
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { milestone: "4th safe house opened in Cartagena", date: "March 2024" },
              { milestone: "100th child successfully reintegrated", date: "January 2024" },
              { milestone: "Vocational program expanded to include tech skills", date: "November 2023" },
            ].map((m) => (
              <div key={m.milestone}>
                <div className="text-xs text-muted-foreground mb-1">{m.date}</div>
                <div className="text-sm font-medium text-foreground">{m.milestone}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          All data is aggregated and anonymized to protect the privacy and safety of the children in our care.
        </p>
      </div>
    </Layout>
  );
};

export default Impact;
