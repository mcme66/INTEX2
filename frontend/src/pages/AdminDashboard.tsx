import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const residentStats = [
  { label: "Active residents", value: "28" },
  { label: "Partner safehouses", value: "4" },
  { label: "Open care plans", value: "19" },
  { label: "Urgent placement requests", value: "3" },
];

const conferences = [
  {
    title: "Case review · Bogota House",
    date: "Apr 7 · 9:00 AM",
    detail: "Clinical lead, education liaison, housing coordinator",
  },
  {
    title: "Transition planning · Medellin",
    date: "Apr 8 · 2:30 PM",
    detail: "Reintegration plan and school enrollment review",
  },
  {
    title: "Legal coordination huddle",
    date: "Apr 10 · 11:00 AM",
    detail: "Protective order updates and documentation status",
  },
];

const recentDonations = [
  { source: "Camino Foundation", amount: "$24,000", note: "Restricted housing support" },
  { source: "Cali Community Drive", amount: "84 kits", note: "Emergency essentials delivered" },
  { source: "Dr. Sofia Rojas", amount: "16 hrs", note: "Clinical consultation donated" },
];

const quickLinks = [
  { to: "/donors", label: "Donor records" },
  { to: "/admin/caseloads", label: "Caseload inventory" },
  { to: "/admin/process-recording", label: "Process recording" },
  { to: "/admin/visits", label: "Case conferences" },
  { to: "/admin/reports", label: "Reports & analytics" },
];

const AdminDashboard = () => {
  return (
    <Layout>
      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Operations Dashboard
              </p>
              <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground">
                Command center for current activity
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                A staff view focused on resident load, giving activity, and the decisions requiring
                attention this week.
              </p>
            </div>
            <Button asChild>
              <Link to="/donors">Review donor management</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {residentStats.map((stat) => (
              <Card key={stat.label} className="shadow-none">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-3 font-heading text-4xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Upcoming case conferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {conferences.map((conference) => (
                  <div
                    key={conference.title}
                    className="flex flex-col gap-2 border-t border-border pt-4 first:border-t-0 first:pt-0 md:flex-row md:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{conference.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{conference.detail}</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">{conference.date}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Workspace links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block border border-border bg-background px-4 py-3 text-sm text-foreground transition-colors hover:bg-secondary"
                  >
                    {link.label}
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-10 shadow-none">
            <CardHeader>
              <CardTitle>Recent donations</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {recentDonations.map((donation) => (
                <div key={donation.source} className="border border-border bg-background p-5">
                  <p className="text-sm text-muted-foreground">{donation.note}</p>
                  <p className="mt-3 font-heading text-2xl font-semibold text-foreground">
                    {donation.amount}
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">{donation.source}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;
