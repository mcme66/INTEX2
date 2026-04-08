import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "csv-parse/sync";
import { createPool, csvRoot } from "./db-utils.mjs";

/** FK-safe load order (Lighthouse CSVs). */
const SEED_ORDER = [
  ["safehouses", "safehouses.csv"],
  ["partners", "partners.csv"],
  ["supporters", "supporters.csv"],
  ["residents", "residents.csv"],
  ["social_media_posts", "social_media_posts.csv"],
  ["donations", "donations.csv"],
  ["donation_allocations", "donation_allocations.csv"],
  ["in_kind_donation_items", "in_kind_donation_items.csv"],
  ["partner_assignments", "partner_assignments.csv"],
  ["education_records", "education_records.csv"],
  ["health_wellbeing_records", "health_wellbeing_records.csv"],
  ["home_visitations", "home_visitations.csv"],
  ["incident_reports", "incident_reports.csv"],
  ["intervention_plans", "intervention_plans.csv"],
  ["process_recordings", "process_recordings.csv"],
  ["public_impact_snapshots", "public_impact_snapshots.csv"],
  ["safehouse_monthly_metrics", "safehouse_monthly_metrics.csv"],
];

function parseCell(column, raw) {
  const v = raw === undefined || raw === null ? "" : String(raw).trim();
  if (v === "") return null;
  const c = column.toLowerCase();
  if (v === "True") return true;
  if (v === "False") return false;
  if (/^-?\d+$/.test(v)) {
    if (
      c.includes("code") ||
      c === "case_control_no" ||
      c === "internal_code" ||
      c === "platform_post_id" ||
      c.includes("phone") ||
      c === "caption" ||
      c === "hashtags"
    ) {
      return v;
    }
    return parseInt(v, 10);
  }
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(v)) return v.replace(" ", "T");
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return v;
}

function loadCsvRecords(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Missing CSV: ${filePath}`);
  }
  const buf = readFileSync(filePath, "utf8");
  return parse(buf, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });
}

async function insertBatch(client, table, columns, rows) {
  if (rows.length === 0) return;
  const batchSize = 75;
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const valueGroups = [];
    const flat = [];
    let p = 1;
    for (const row of chunk) {
      const cells = columns.map((col) => {
        flat.push(parseCell(col, row[col]));
        return `$${p++}`;
      });
      valueGroups.push(`(${cells.join(", ")})`);
    }
    const sql = `INSERT INTO ${table} (${columns.map((c) => `"${c}"`).join(", ")}) VALUES ${valueGroups.join(", ")}`;
    await client.query(sql, flat);
  }
}

async function seedTable(client, table, csvName) {
  const filePath = join(csvRoot, csvName);
  const records = loadCsvRecords(filePath);
  if (records.length === 0) {
    console.warn(`  (skip empty ${table})`);
    return;
  }
  const columns = Object.keys(records[0]).filter((c) => c && c.length > 0);
  await insertBatch(client, table, columns, records);
  console.log(`  ${table}: ${records.length} rows`);
}

async function linkSupportersToUsers(client) {
  const r = await client.query(`
    UPDATE supporters s
    SET app_user_id = u."Id"
    FROM users u
    WHERE s.app_user_id IS NULL
      AND s.email IS NOT NULL
      AND TRIM(s.email) <> ''
      AND LOWER(TRIM(s.email)) = LOWER(TRIM(u."Email"))
  `);
  console.log(`  supporters ↔ users email link: ${r.rowCount} row(s) updated.`);
}

async function seedDefaultAddCodes(client) {
  await client.query(`
    INSERT INTO add_codes ("Code", "CreatedAtUtc")
    VALUES ('dev-admin', NOW() AT TIME ZONE 'utc')
    ON CONFLICT ("Code") DO NOTHING
  `);
  console.log("  add_codes: dev-admin (if missing)");
}

async function main() {
  const pool = createPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("db:seed — loading lighthouse_csv_v7…");
    for (const [table, file] of SEED_ORDER) {
      await seedTable(client, table, file);
    }
    await seedDefaultAddCodes(client);
    await linkSupportersToUsers(client);
    await client.query("COMMIT");
    console.log("db:seed — done.");
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
