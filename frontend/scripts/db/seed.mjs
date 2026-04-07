import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { parse } from 'csv-parse/sync'
import { withClient } from './_db.mjs'

const now = new Date()

const users = [
  {
    firstName: 'Test',
    email: 'test@example.com',
    username: 'testuser',
    password: 'Password123!',
    isDonor: true,
    isAdmin: false,
  },
  {
    firstName: 'Allen',
    email: 'allen@example.com',
    username: 'allen',
    password: 'Password123!',
    isDonor: true,
    isAdmin: true,
  },
]

const addCodes = ['NORTHSTAR2026', 'ADMIN123', 'INTERNAL-OPS']

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const csvRoot = path.resolve(__dirname, '..', '..', '..', 'lighthouse_csv_v7')

const tableOrder = [
  'safehouses',
  'partners',
  'partner_assignments',
  'supporters',
  'donations',
  'in_kind_donation_items',
  'donation_allocations',
  'residents',
  'process_recordings',
  'home_visitations',
  'education_records',
  'health_wellbeing_records',
  'intervention_plans',
  'incident_reports',
  'social_media_posts',
  'safehouse_monthly_metrics',
  'public_impact_snapshots',
]

/** @type {Record<string, Record<string, 'int'|'decimal'|'bool'|'date'|'timestamptz'|'text'>>} */
const columnTypes = {
  safehouses: {
    safehouse_id: 'int',
    open_date: 'date',
    capacity_girls: 'int',
    capacity_staff: 'int',
    current_occupancy: 'int',
  },
  partners: {
    partner_id: 'int',
    start_date: 'date',
    end_date: 'date',
  },
  partner_assignments: {
    assignment_id: 'int',
    partner_id: 'int',
    safehouse_id: 'int',
    assignment_start: 'date',
    assignment_end: 'date',
    is_primary: 'bool',
  },
  supporters: {
    supporter_id: 'int',
    created_at: 'timestamptz',
    first_donation_date: 'date',
  },
  donations: {
    donation_id: 'int',
    supporter_id: 'int',
    donation_date: 'date',
    is_recurring: 'bool',
    amount: 'decimal',
    estimated_value: 'decimal',
    referral_post_id: 'int',
  },
  in_kind_donation_items: {
    item_id: 'int',
    donation_id: 'int',
    quantity: 'int',
    estimated_unit_value: 'decimal',
  },
  donation_allocations: {
    allocation_id: 'int',
    donation_id: 'int',
    safehouse_id: 'int',
    amount_allocated: 'decimal',
    allocation_date: 'date',
  },
  residents: {
    resident_id: 'int',
    safehouse_id: 'int',
    date_of_birth: 'date',
    sub_cat_orphaned: 'bool',
    sub_cat_trafficked: 'bool',
    sub_cat_child_labor: 'bool',
    sub_cat_physical_abuse: 'bool',
    sub_cat_sexual_abuse: 'bool',
    sub_cat_osaec: 'bool',
    sub_cat_cicl: 'bool',
    sub_cat_at_risk: 'bool',
    sub_cat_street_child: 'bool',
    sub_cat_child_with_hiv: 'bool',
    is_pwd: 'bool',
    has_special_needs: 'bool',
    family_is_4ps: 'bool',
    family_solo_parent: 'bool',
    family_indigenous: 'bool',
    family_parent_pwd: 'bool',
    family_informal_settler: 'bool',
    date_of_admission: 'date',
    date_colb_registered: 'date',
    date_colb_obtained: 'date',
    date_case_study_prepared: 'date',
    date_enrolled: 'date',
    date_closed: 'date',
    created_at: 'timestamptz',
  },
  process_recordings: {
    recording_id: 'int',
    resident_id: 'int',
    session_date: 'date',
    session_duration_minutes: 'int',
    progress_noted: 'bool',
    concerns_flagged: 'bool',
    referral_made: 'bool',
  },
  home_visitations: {
    visitation_id: 'int',
    resident_id: 'int',
    visit_date: 'date',
    safety_concerns_noted: 'bool',
    follow_up_needed: 'bool',
  },
  education_records: {
    education_record_id: 'int',
    resident_id: 'int',
    record_date: 'date',
    attendance_rate: 'decimal',
    progress_percent: 'decimal',
  },
  health_wellbeing_records: {
    health_record_id: 'int',
    resident_id: 'int',
    record_date: 'date',
    general_health_score: 'decimal',
    nutrition_score: 'decimal',
    sleep_quality_score: 'decimal',
    energy_level_score: 'decimal',
    height_cm: 'decimal',
    weight_kg: 'decimal',
    bmi: 'decimal',
    medical_checkup_done: 'bool',
    dental_checkup_done: 'bool',
    psychological_checkup_done: 'bool',
  },
  intervention_plans: {
    plan_id: 'int',
    resident_id: 'int',
    target_value: 'decimal',
    target_date: 'date',
    case_conference_date: 'date',
    created_at: 'timestamptz',
    updated_at: 'timestamptz',
  },
  incident_reports: {
    incident_id: 'int',
    resident_id: 'int',
    safehouse_id: 'int',
    incident_date: 'date',
    resolved: 'bool',
    resolution_date: 'date',
    follow_up_required: 'bool',
  },
  social_media_posts: {
    post_id: 'int',
    created_at: 'timestamptz',
    post_hour: 'int',
    num_hashtags: 'int',
    mentions_count: 'int',
    has_call_to_action: 'bool',
    caption_length: 'int',
    features_resident_story: 'bool',
    is_boosted: 'bool',
    boost_budget_php: 'decimal',
    impressions: 'int',
    reach: 'int',
    likes: 'int',
    comments: 'int',
    shares: 'int',
    saves: 'int',
    click_throughs: 'int',
    video_views: 'int',
    engagement_rate: 'decimal',
    profile_visits: 'int',
    donation_referrals: 'int',
    estimated_donation_value_php: 'decimal',
    follower_count_at_post: 'int',
    watch_time_seconds: 'int',
    avg_view_duration_seconds: 'int',
    subscriber_count_at_post: 'int',
    forwards: 'int',
  },
  safehouse_monthly_metrics: {
    metric_id: 'int',
    safehouse_id: 'int',
    month_start: 'date',
    month_end: 'date',
    active_residents: 'int',
    avg_education_progress: 'decimal',
    avg_health_score: 'decimal',
    process_recording_count: 'int',
    home_visitation_count: 'int',
    incident_count: 'int',
  },
  public_impact_snapshots: {
    snapshot_id: 'int',
    snapshot_date: 'date',
    metric_payload_json: 'text',
    is_published: 'bool',
    published_at: 'date',
  },
}

function coerceValue(table, column, raw) {
  if (raw === undefined || raw === null) return null
  const value = String(raw).trim()
  if (value === '') return null

  const t = columnTypes[table]?.[column] ?? 'text'
  if (t === 'bool') {
    if (/^(true|t|1|yes)$/i.test(value)) return true
    if (/^(false|f|0|no)$/i.test(value)) return false
    // Fall back to null if malformed
    return null
  }
  if (t === 'int') {
    // handle values like "8.0"
    const n = Number(value)
    if (!Number.isFinite(n)) return null
    return Math.trunc(n)
  }
  if (t === 'decimal') {
    const n = Number(value)
    if (!Number.isFinite(n)) return null
    return value
  }
  // dates/timestamps/text: let Postgres cast/accept the string
  return value
}

async function loadCsvIntoTable(client, tableName) {
  const filePath = path.join(csvRoot, `${tableName}.csv`)
  const csv = await readFile(filePath, 'utf8')
  const records = parse(csv, { columns: true, skip_empty_lines: true, relax_quotes: true })

  if (!Array.isArray(records) || records.length === 0) {
    console.log(`Seed: ${tableName}: 0 rows (empty file).`)
    return
  }

  const columns = Object.keys(records[0])
  const quotedCols = columns.map((c) => `"${c.replaceAll('"', '""')}"`).join(',')
  const batchSize = 1000

  let inserted = 0
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    const values = []
    const placeholders = []
    let p = 1

    for (const row of batch) {
      const rowPlaceholders = []
      for (const col of columns) {
        values.push(coerceValue(tableName, col, row[col]))
        rowPlaceholders.push(`$${p++}`)
      }
      placeholders.push(`(${rowPlaceholders.join(',')})`)
    }

    // Use ON CONFLICT DO NOTHING to make reseeding idempotent on PK.
    const sql = `INSERT INTO ${tableName} (${quotedCols}) VALUES ${placeholders.join(
      ',',
    )} ON CONFLICT DO NOTHING;`
    const res = await client.query(sql, values)
    inserted += res.rowCount ?? 0
  }

  console.log(`Seed: ${tableName}: inserted ${inserted} rows.`)
}

await withClient(async (client) => {
  for (const code of addCodes) {
    await client.query(
      `
      INSERT INTO add_codes ("Code","CreatedAtUtc")
      VALUES ($1,$2)
      ON CONFLICT ("Code") DO NOTHING;
      `,
      [code, now],
    )
  }

  for (const u of users) {
    const id = randomUUID()
    const passwordHash = await bcrypt.hash(u.password, 10)
    await client.query(
      `
      INSERT INTO users ("Id","FirstName","Email","Username","PasswordHash","IsDonor","IsAdmin","CreatedAtUtc")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT ("Username") DO NOTHING;
      `,
      [id, u.firstName, u.email.toLowerCase(), u.username, passwordHash, u.isDonor, u.isAdmin, now],
    )
  }

  console.log(`Seed: ensured ${addCodes.length} admin codes and ${users.length} test users.`)

  for (const tableName of tableOrder) {
    await loadCsvIntoTable(client, tableName)
  }

  console.log('Seed complete: CSV tables loaded.')
})

