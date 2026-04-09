import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Heart, Clock, Wrench, Users, Building2, Share2 } from "lucide-react";
import { useLanguage } from "@/state/language";

const WaysToHelp = () => {
  const { t } = useLanguage();

  const WAYS = [
    { icon: Heart,     title: t("volunteerWay1Title"), description: t("volunteerWay1Desc") },
    { icon: Clock,     title: t("volunteerWay2Title"), description: t("volunteerWay2Desc") },
    { icon: Wrench,    title: t("volunteerWay3Title"), description: t("volunteerWay3Desc") },
    { icon: Users,     title: t("volunteerWay4Title"), description: t("volunteerWay4Desc") },
    { icon: Building2, title: t("volunteerWay5Title"), description: t("volunteerWay5Desc") },
    { icon: Share2,    title: t("volunteerWay6Title"), description: t("volunteerWay6Desc") },
  ];

  return (
    <Layout>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr] mb-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {t("volunteerLabel")}
              </p>
              <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                {t("volunteerHeadline")}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {t("volunteerSub")}
              </p>
            </div>

            <div className="border border-border bg-secondary/60 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {t("volunteerCommitmentLabel")}
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                {t("volunteerCommitmentText")}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/impact"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium bg-accent text-accent-foreground hover:bg-gold-dark transition-colors"
                >
                  {t("volunteerViewImpact")}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium border border-border hover:bg-secondary transition-colors"
                >
                  {t("volunteerGetInvolved")}
                </Link>
              </div>
            </div>
          </div>

          {/* Ways grid */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-8">
              {t("volunteerSixWays")}
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
                {t("volunteerNotSure")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                {t("volunteerNotSureDesc")}
              </p>
            </div>
            <Link
              to="/register"
              className="shrink-0 inline-flex items-center justify-center px-6 py-3 text-sm font-medium bg-accent text-accent-foreground hover:bg-gold-dark transition-colors"
            >
              {t("volunteerCreateAccount")}
            </Link>
          </div>

        </div>
      </section>
    </Layout>
  );
};

export default WaysToHelp;
