import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Heart, Clock, Wrench, Users, Building2, Share2 } from "lucide-react";

const WAYS = [
  {
    icon: Heart,
    title: "Make a Monetary Donation",
    description: "Fund safe housing, meals, counseling, and education for children in our care.",
  },
  {
    icon: Clock,
    title: "Volunteer Your Time",
    description: "Mentor, tutor, or lead activities in our safehouses. Consistent presence matters deeply.",
  },
  {
    icon: Wrench,
    title: "Contribute Skills & Services",
    description: "Medical, legal, counseling, education, and tech professionals can give their expertise directly.",
  },
  {
    icon: Users,
    title: "In-Kind Donations",
    description: "Clothing, school supplies, hygiene products, and food are always needed.",
  },
  {
    icon: Building2,
    title: "Become a Partner Organization",
    description: "Churches, businesses, and nonprofits can build sustained partnerships aligned with our mission.",
  },
  {
    icon: Share2,
    title: "Advocate on Social Media",
    description: "Share our mission and impact stories to grow awareness and bring in new supporters.",
  },
];

const WaysToHelp = () => {
  return (
    <Layout>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr] mb-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Get Involved
              </p>
              <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                There are many ways to stand with these children.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Whether you give financially, offer your time, contribute professional skills, or simply amplify our message — every form of support directly changes the trajectory of a child's life.
              </p>
            </div>

            <div className="border border-border bg-secondary/60 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Our commitment
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                North Star operates with full transparency. Every contribution — monetary, in-kind, or in service — is tracked, reported, and directed to the programs that need it most.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/impact"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium bg-accent text-accent-foreground hover:bg-gold-dark transition-colors"
                >
                  View our impact
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium border border-border hover:bg-secondary transition-colors"
                >
                  Get involved
                </Link>
              </div>
            </div>
          </div>

          {/* Ways grid */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-8">
              Six ways to make a difference
            </p>
            <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3 border border-border">
              {WAYS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-secondary/30 p-8 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-accent shrink-0" />
                    <h2 className="font-heading font-semibold text-foreground leading-snug">
                      {title}
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 border border-border p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="font-heading text-xl font-semibold text-foreground">
                Not sure where to start?
              </p>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                Create an account and our team will help you find the right fit for your capacity and interests.
              </p>
            </div>
            <Link
              to="/register"
              className="shrink-0 inline-flex items-center justify-center px-6 py-3 text-sm font-medium bg-accent text-accent-foreground hover:bg-gold-dark transition-colors"
            >
              Create an account
            </Link>
          </div>

        </div>
      </section>
    </Layout>
  );
};

export default WaysToHelp;
