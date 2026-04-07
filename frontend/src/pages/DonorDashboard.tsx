import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/state/auth";

const donorSummary = [
  {
    title: "Current giving focus",
    value: "Housing & essentials",
    note: "43% of active donor allocations are supporting immediate shelter and daily needs.",
  },
  {
    title: "Latest reporting cycle",
    value: "Q1 2026",
    note: "Anonymized care, education, and reintegration indicators are ready for review.",
  },
  {
    title: "Open stewardship actions",
    value: "2",
    note: "One quarterly update and one campaign acknowledgment are scheduled this week.",
  },
];

const DonorDashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <section className="px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Donor Dashboard
            </p>
            <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              This private area gives donor users a clean path into impact reporting and stewardship
              updates without exposing case-level information.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {donorSummary.map((item) => (
              <Card key={item.title} className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-heading text-3xl font-semibold text-foreground">{item.value}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DonorDashboard;
