import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Users, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import heroImage from "@/assets/hero-colombia.jpg";
import { apiGetImpactStats, type ImpactStats } from "@/utils/api";
import { useLanguage } from "@/state/language";
import { useAuth } from "@/state/auth";

const Index = () => {
  const { user } = useAuth();
  const ctaTarget = user ? "/donor" : "/register";
  const { t } = useLanguage();

  const [stats, setStats] = useState<ImpactStats | null>(null);

  useEffect(() => {
    apiGetImpactStats().then(setStats).catch(() => {});
  }, []);

  const reintegrationRate = stats && stats.totalResidents > 0
    ? Math.round((stats.reintegrationProgressCount / stats.totalResidents) * 100)
    : null;

  const metrics = stats
    ? [
        { value: stats.activeResidents.toString(), label: t("homeStatChildren") },
        { value: stats.safehouseOccupancy.length.toString(), label: t("homeStatSafehouses") },
        { value: reintegrationRate != null ? `${reintegrationRate}%` : "—", label: t("homeStatReintegration") },
        { value: `$${Math.round(stats.totalContributionsValue / 1000)}k+`, label: t("homeStatRaised") },
      ]
    : [
        { value: "—", label: t("homeStatChildren") },
        { value: "—", label: t("homeStatSafehouses") },
        { value: "—", label: t("homeStatReintegration") },
        { value: "—", label: t("homeStatRaised") },
      ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <img
          src={heroImage}
          alt="Mountains of Colombia at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <h1 className="font-heading text-4xl md:text-6xl font-semibold text-primary-foreground leading-[1.1] mb-6">
              {t("homeHeroHeadline")}
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              {t("homeHeroSub")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/volunteer"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:bg-gold-dark transition-colors"
              >
                {t("homeWaysToHelp")} <ArrowRight size={16} />
              </Link>
              <a
                href="#mission"
                className="inline-flex items-center gap-2 border border-primary-foreground/30 text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
              >
                {t("homeLearnMore")}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("homeMissionLabel")}
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold text-foreground mt-3 mb-6 leading-tight">
                {t("homeMissionHeadline")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("homeMissionP1")}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t("homeMissionP2")}
              </p>
            </div>
            <div className="space-y-8 pt-2">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-accent/20 flex items-center justify-center">
                  <Shield size={20} className="text-gold-dark" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{t("homeSafeHousesTitle")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("homeSafeHousesDesc")}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-accent/20 flex items-center justify-center">
                  <Heart size={20} className="text-gold-dark" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{t("homeTraumaTitle")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("homeTraumaDesc")}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-accent/20 flex items-center justify-center">
                  <Users size={20} className="text-gold-dark" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{t("homeReintegrationTitle")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("homeReintegrationDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers — live from database */}
      <section className="bg-primary text-primary-foreground py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {metrics.map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-3xl md:text-4xl font-bold text-gold mb-2">{stat.value}</div>
                <div className="text-sm text-primary-foreground/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ways to Help */}
      <section id="get-involved" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("homeGetInvolved")}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-foreground mt-3 mb-12 leading-tight">
            {t("homeHowHelp")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: t("homeGiveMonthly"),
                desc: t("homeGiveMonthlyDesc"),
                cta: t("homeStartGiving"),
                to: "/register",
              },
              {
                title: t("homeVolunteerSkills"),
                desc: t("homeVolunteerSkillsDesc"),
                cta: t("homeSeeOpportunities"),
                to: "/volunteer",
              },
              {
                title: t("homeCorporatePartnership"),
                desc: t("homeCorporatePartnershipDesc"),
                cta: t("homePartnerWithUs"),
                to: "/register",
              },
            ].map((card) => (
              <div key={card.title} className="border border-border p-8 flex flex-col">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">{card.desc}</p>
                <Link
                  to={card.to}
                  className="text-sm font-semibold text-accent-foreground hover:text-gold-dark transition-colors inline-flex items-center gap-1"
                >
                  {card.cta} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-secondary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-foreground mb-6">
            {t("homeCtaHeadline")}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            {t("homeCtaSub")}
          </p>
          <Link
            to={ctaTarget}
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3 text-sm font-semibold hover:bg-gold-dark transition-colors"
          >
            {t("homeCtaBtn")} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
