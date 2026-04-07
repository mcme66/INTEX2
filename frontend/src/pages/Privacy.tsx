import Layout from "@/components/Layout";

const policySections = [
  {
    title: "What data we collect",
    text: "North Star may collect contact details submitted by staff users, account login credentials, donor records entered by administrators, and site usage information through optional analytics cookies.",
  },
  {
    title: "How data is used",
    text: "We use data to manage staff access, maintain donor and contribution records, understand which parts of the site are useful, and communicate with users who request updates or support.",
  },
  {
    title: "How data is stored",
    text: "Account and supporter records are stored in protected application databases with access limited to authorized staff. Analytics preferences are stored locally in your browser.",
  },
  {
    title: "Your rights",
    text: "Users may request access to personal data, correction of inaccurate information, deletion where appropriate, and withdrawal of consent for non-essential cookies.",
  },
];

const Privacy = () => {
  return (
    <Layout>
      <section className="px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Privacy Policy
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground">
            Privacy and cookie use
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            This project keeps the original policy intent from the previous frontend while fitting
            it into the current visual system.
          </p>

          <div className="mt-10 rounded-lg border border-border bg-secondary/60 p-5 text-sm leading-relaxed text-foreground">
            Essential cookies support login state and site function. Optional analytics cookies may
            be accepted or declined through future consent tooling.
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
