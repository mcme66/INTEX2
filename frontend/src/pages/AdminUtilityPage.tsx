import Layout from "@/components/Layout";

type AdminUtilityPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

const AdminUtilityPage = ({ eyebrow, title, description }: AdminUtilityPageProps) => {
  return (
    <Layout>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground">{title}</h1>
          <div className="mt-8 rounded-lg border border-border bg-card p-8">
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminUtilityPage;
