import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

const Volunteer = () => {
  return (
    <Layout>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Volunteer
              </p>
              <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Offer time, skill, or sustained partnership.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                The previous frontend had a placeholder volunteer route. This keeps that route live
                inside the lovable frontend and gives it a stronger entry point for future intake.
              </p>
            </div>

            <div className="border border-border bg-secondary/60 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Current status
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                Volunteer intake is still being finalized. For now, use the registration flow for
                internal access or contact the team directly to discuss service opportunities.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link to="/register">Create an account</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/impact">View impact reporting</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Volunteer;
