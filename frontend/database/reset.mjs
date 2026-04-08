import { createPool } from "./db-utils.mjs";

/** Drop order: children before parents (matches FK graph). */
const TABLES = [
  "social_media_posts",
  "safehouse_monthly_metrics",
  "public_impact_snapshots",
  "process_recordings",
  "intervention_plans",
  "incident_reports",
  "home_visitations",
  "health_wellbeing_records",
  "education_records",
  "partner_assignments",
  "in_kind_donation_items",
  "donation_allocations",
  "donations",
  "residents",
  "supporters",
  "partners",
  "safehouses",
  "add_codes",
  "users",
];

async function main() {
  const pool = createPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const t of TABLES) {
      await client.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
    }
    await client.query('DROP TABLE IF EXISTS "__EFMigrationsHistory" CASCADE');
    await client.query("COMMIT");
    console.log("db:reset — dropped application tables.");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
