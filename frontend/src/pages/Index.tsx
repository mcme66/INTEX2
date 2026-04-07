import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Users, Shield } from "lucide-react";
import Layout from "@/components/Layout";
import heroImage from "@/assets/hero-colombia.jpg";

const Index = () => {
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
              Every child deserves a safe place to heal.
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              North Star provides refuge, restoration, and long-term care for children rescued from trafficking and abuse in Colombia.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/donors"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:bg-gold-dark transition-colors"
              >
                Support Our Work <ArrowRight size={16} />
              </Link>
              <a
                href="#mission"
                className="inline-flex items-center gap-2 border border-primary-foreground/30 text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
              >
                Learn More
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
                Our Mission
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold text-foreground mt-3 mb-6 leading-tight">
                Restoring childhood, one life at a time
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                In Colombia, thousands of children are victims of sexual trafficking and abuse each year. Many have nowhere to turn. North Star operates safe houses where rescued children receive trauma-informed care, education, and the stability they need to rebuild their lives.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We work alongside Colombian authorities, local communities, and international partners to identify at-risk children, provide immediate refuge, and support long-term recovery through counseling, education, and vocational training.
              </p>
            </div>
            <div className="space-y-8 pt-2">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-accent/20 flex items-center justify-center">
                  <Shield size={20} className="text-gold-dark" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-1">Safe Houses</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Secure residential facilities staffed 24/7 with trained caregivers, therapists, and educators in multiple Colombian cities.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-accent/20 flex items-center justify-center">
                  <Heart size={20} className="text-gold-dark" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-1">Trauma Recovery</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Licensed counselors provide individual and group therapy using evidence-based approaches tailored to each child's needs.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-accent/20 flex items-center justify-center">
                  <Users size={20} className="text-gold-dark" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-1">Reintegration</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Education, life skills, and vocational training to help older youth transition toward independence with dignity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="bg-primary text-primary-foreground py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "127", label: "Children in our care" },
              { value: "4", label: "Safe houses across Colombia" },
              { value: "89%", label: "Successful reintegration rate" },
              { value: "12", label: "Years of operation" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-3xl md:text-4xl font-bold text-gold mb-2">{stat.value}</div>
                <div className="text-sm text-primary-foreground/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ways to Help */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Get Involved
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-foreground mt-3 mb-12 leading-tight">
            How you can help
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Give Monthly",
                desc: "Consistent funding allows us to plan long-term care. $50/month covers a child's food and schooling for 30 days.",
                cta: "Start Giving",
                to: "/donors",
              },
              {
                title: "Volunteer Your Skills",
                desc: "We need therapists, teachers, translators, grant writers, and tech professionals. Remote and on-site roles available.",
                cta: "See Opportunities",
                to: "/donors",
              },
              {
                title: "Corporate Partnership",
                desc: "Align your organization with our mission. We offer sponsorship tiers, impact reports, and co-branded campaigns.",
                cta: "Partner With Us",
                to: "/donors",
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
            Be their North Star.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Every contribution—whether financial, professional, or personal—directly changes a child's life. Join us.
          </p>
          <Link
            to="/donors"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3 text-sm font-semibold hover:bg-gold-dark transition-colors"
          >
            Get Involved <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
