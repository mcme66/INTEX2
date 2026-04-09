import Layout from "@/components/Layout";
import { useLanguage } from "@/state/language";

const Privacy = () => {
  const { t } = useLanguage();

  const policySections = [
    { title: t("privacySection1Title"), text: t("privacySection1Text") },
    { title: t("privacySection2Title"), text: t("privacySection2Text") },
    { title: t("privacySection3Title"), text: t("privacySection3Text") },
    { title: t("privacySection4Title"), text: t("privacySection4Text") },
  ];

  return (
    <Layout>
      <section className="px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {t("privacyLabel")}
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground">
            {t("privacyTitle")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t("privacySub")}
          </p>

          <div className="mt-10 rounded-lg border border-border bg-secondary/60 p-5 text-sm leading-relaxed text-foreground">
            {(() => {
              const text = t("privacyCookieText");
              const key = "cookie_consent";
              const idx = text.indexOf(key);
              if (idx === -1) return text;
              return (
                <>
                  {text.slice(0, idx)}
                  <code>{key}</code>
                  {text.slice(idx + key.length)}
                </>
              );
            })()}
          </div>

          <div className="mt-8 space-y-4">
            {policySections.map((section) => (
              <article key={section.title} className="rounded-lg border border-border bg-card p-6 shadow-none">
                <h2 className="font-heading text-2xl font-semibold text-foreground">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{section.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;
