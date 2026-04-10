import { withClient } from './_db.mjs'

// Initial schema for current app needs (matches EF migration: Users table).
await withClient(async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      "Id" uuid PRIMARY KEY,
      "FirstName" varchar(64) NOT NULL,
      "Email" varchar(256) NOT NULL,
      "Username" varchar(64) NOT NULL,
      "PasswordHash" text NOT NULL,
      "MfaEnabled" boolean NOT NULL DEFAULT false,
      "MfaSecretProtected" text,
      "MfaPendingSecretProtected" text,
      "MfaRecoveryCodesJson" text,
      "IsDonor" boolean NOT NULL DEFAULT false,
      "IsAdmin" boolean NOT NULL DEFAULT false,
      "CreatedAtUtc" timestamptz NOT NULL
    );
  `)

  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IX_users_Username" ON users ("Username");`)
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IX_users_Email" ON users ("Email");`)

  await client.query(`
    CREATE TABLE IF NOT EXISTS add_codes (
      "Code" varchar(64) PRIMARY KEY,
      "CreatedAtUtc" timestamptz NOT NULL
    );
  `)

  // CSV-backed tables (lighthouse_csv_v7). Column names intentionally match CSV headers exactly.
  // Types are aligned to the INTEX data dictionary when possible.

  await client.query(`
    CREATE TABLE IF NOT EXISTS safehouses (
      "safehouse_id" integer PRIMARY KEY,
      "safehouse_code" text,
      "name" text,
      "region" text,
      "city" text,
      "province" text,
      "country" text,
      "open_date" date,
      "status" text,
      "capacity_girls" integer,
      "capacity_staff" integer,
      "current_occupancy" integer,
      "notes" text
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS partners (
      "partner_id" integer PRIMARY KEY,
      "partner_name" text,
      "partner_type" text,
      "role_type" text,
      "contact_name" text,
      "email" text,
      "phone" text,
      "region" text,
      "status" text,
      "start_date" date,
      "end_date" date,
      "notes" text
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS partner_assignments (
      "assignment_id" integer PRIMARY KEY,
      "partner_id" integer,
      "safehouse_id" integer,
      "program_area" text,
      "assignment_start" date,
      "assignment_end" date,
      "responsibility_notes" text,
      "is_primary" boolean,
      "status" text
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS supporters (
      "supporter_id" integer PRIMARY KEY,
      "supporter_type" text,
      "display_name" text,
      "organization_name" text,
      "first_name" text,
      "last_name" text,
      "relationship_type" text,
      "region" text,
      "country" text,
      "email" text,
      "phone" text,
      "status" text,
      "created_at" timestamptz,
      "first_donation_date" date,
      "acquisition_channel" text
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS donations (
      "donation_id" integer PRIMARY KEY,
      "supporter_id" integer,
      "donation_type" text,
      "donation_date" date,
      "is_recurring" boolean,
      "campaign_name" text,
      "channel_source" text,
      "currency_code" text,
      "amount" decimal,
      "estimated_value" decimal,
      "impact_unit" text,
      "notes" text,
      "referral_post_id" integer
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS in_kind_donation_items (
      "item_id" integer PRIMARY KEY,
      "donation_id" integer,
      "item_name" text,
      "item_category" text,
      "quantity" integer,
      "unit_of_measure" text,
      "estimated_unit_value" decimal,
      "intended_use" text,
      "received_condition" text
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS donation_allocations (
      "allocation_id" integer PRIMARY KEY,
      "donation_id" integer,
      "safehouse_id" integer,
      "program_area" text,
      "amount_allocated" decimal,
      "allocation_date" date,
      "allocation_notes" text
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS residents (
      "resident_id" integer PRIMARY KEY,
      "case_control_no" text,
      "internal_code" text,
      "safehouse_id" integer,
      "case_status" text,
      "sex" text,
      "date_of_birth" date,
      "birth_status" text,
      "place_of_birth" text,
      "religion" text,
      "case_category" text,
      "sub_cat_orphaned" boolean,
      "sub_cat_trafficked" boolean,
      "sub_cat_child_labor" boolean,
      "sub_cat_physical_abuse" boolean,
      "sub_cat_sexual_abuse" boolean,
      "sub_cat_osaec" boolean,
      "sub_cat_cicl" boolean,
      "sub_cat_at_risk" boolean,
      "sub_cat_street_child" boolean,
      "sub_cat_child_with_hiv" boolean,
      "is_pwd" boolean,
      "pwd_type" text,
      "has_special_needs" boolean,
      "special_needs_diagnosis" text,
      "family_is_4ps" boolean,
      "family_solo_parent" boolean,
      "family_indigenous" boolean,
      "family_parent_pwd" boolean,
      "family_informal_settler" boolean,
      "date_of_admission" date,
      "age_upon_admission" text,
      "present_age" text,
      "length_of_stay" text,
      "referral_source" text,
      "referring_agency_person" text,
      "date_colb_registered" date,
      "date_colb_obtained" date,
      "assigned_social_worker" text,
      "initial_case_assessment" text,
      "date_case_study_prepared" date,
      "reintegration_type" text,
      "reintegration_status" text,
      "initial_risk_level" text,
      "current_risk_level" text,
      "date_enrolled" date,
      "date_closed" date,
      "created_at" timestamptz,
      "notes_restricted" text
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS process_recordings (
      "recording_id" integer PRIMARY KEY,
      "resident_id" integer,
      "session_date" date,
      "social_worker" text,
      "session_type" text,
      "session_duration_minutes" integer,
      "emotional_state_observed" text,
      "emotional_state_end" text,
      "session_narrative" text,
      "interventions_applied" text,
      "follow_up_actions" text,
      "progress_noted" boolean,
      "concerns_flagged" boolean,
      "referral_made" boolean,
      "notes_restricted" text
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS home_visitations (
      "visitation_id" integer PRIMARY KEY,
      "resident_id" integer,
      "visit_date" date,
      "social_worker" text,
      "visit_type" text,
      "location_visited" text,
      "family_members_present" text,
      "purpose" text,
      "observations" text,
      "family_cooperation_level" text,
      "safety_concerns_noted" boolean,
      "follow_up_needed" boolean,
      "follow_up_notes" text,
      "visit_outcome" text
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS education_records (
      "education_record_id" integer PRIMARY KEY,
      "resident_id" integer,
      "record_date" date,
      "education_level" text,
      "school_name" text,
      "enrollment_status" text,
      "attendance_rate" decimal,
      "progress_percent" decimal,
      "completion_status" text,
      "notes" text
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS health_wellbeing_records (
      "health_record_id" integer PRIMARY KEY,
      "resident_id" integer,
      "record_date" date,
      "general_health_score" decimal,
      "nutrition_score" decimal,
      "sleep_quality_score" decimal,
      "energy_level_score" decimal,
      "height_cm" decimal,
      "weight_kg" decimal,
      "bmi" decimal,
      "medical_checkup_done" boolean,
      "dental_checkup_done" boolean,
      "psychological_checkup_done" boolean,
      "notes" text
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS intervention_plans (
      "plan_id" integer PRIMARY KEY,
      "resident_id" integer,
      "plan_category" text,
      "plan_description" text,
      "services_provided" text,
      "target_value" decimal,
      "target_date" date,
      "status" text,
      "case_conference_date" date,
      "created_at" timestamptz,
      "updated_at" timestamptz
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS incident_reports (
      "incident_id" integer PRIMARY KEY,
      "resident_id" integer,
      "safehouse_id" integer,
      "incident_date" date,
      "incident_type" text,
      "severity" text,
      "description" text,
      "response_taken" text,
      "resolved" boolean,
      "resolution_date" date,
      "reported_by" text,
      "follow_up_required" boolean
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS social_media_posts (
      "post_id" integer PRIMARY KEY,
      "platform" text,
      "platform_post_id" text,
      "post_url" text,
      "created_at" timestamptz,
      "day_of_week" text,
      "post_hour" integer,
      "post_type" text,
      "media_type" text,
      "caption" text,
      "hashtags" text,
      "num_hashtags" integer,
      "mentions_count" integer,
      "has_call_to_action" boolean,
      "call_to_action_type" text,
      "content_topic" text,
      "sentiment_tone" text,
      "caption_length" integer,
      "features_resident_story" boolean,
      "campaign_name" text,
      "is_boosted" boolean,
      "boost_budget_php" decimal,
      "impressions" integer,
      "reach" integer,
      "likes" integer,
      "comments" integer,
      "shares" integer,
      "saves" integer,
      "click_throughs" integer,
      "video_views" integer,
      "engagement_rate" decimal,
      "profile_visits" integer,
      "donation_referrals" integer,
      "estimated_donation_value_php" decimal,
      "follower_count_at_post" integer,
      "watch_time_seconds" integer,
      "avg_view_duration_seconds" integer,
      "subscriber_count_at_post" integer,
      "forwards" integer
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS safehouse_monthly_metrics (
      "metric_id" integer PRIMARY KEY,
      "safehouse_id" integer,
      "month_start" date,
      "month_end" date,
      "active_residents" integer,
      "avg_education_progress" decimal,
      "avg_health_score" decimal,
      "process_recording_count" integer,
      "home_visitation_count" integer,
      "incident_count" integer,
      "notes" text
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS public_impact_snapshots (
      "snapshot_id" integer PRIMARY KEY,
      "snapshot_date" date,
      "headline" text,
      "summary_text" text,
      "metric_payload_json" text,
      "is_published" boolean,
      "published_at" date
    );
  `)

  // Helpful indexes for common lookups/joins.
  await client.query(`CREATE INDEX IF NOT EXISTS "IX_donations_supporter_id" ON donations ("supporter_id");`)
  await client.query(`CREATE INDEX IF NOT EXISTS "IX_donations_donation_date" ON donations ("donation_date");`)
  await client.query(`CREATE INDEX IF NOT EXISTS "IX_donation_allocations_donation_id" ON donation_allocations ("donation_id");`)
  await client.query(`CREATE INDEX IF NOT EXISTS "IX_donation_allocations_safehouse_id" ON donation_allocations ("safehouse_id");`)
  await client.query(`CREATE INDEX IF NOT EXISTS "IX_residents_safehouse_id" ON residents ("safehouse_id");`)
  await client.query(`CREATE INDEX IF NOT EXISTS "IX_process_recordings_resident_id" ON process_recordings ("resident_id");`)
  await client.query(`CREATE INDEX IF NOT EXISTS "IX_home_visitations_resident_id" ON home_visitations ("resident_id");`)
  await client.query(`CREATE INDEX IF NOT EXISTS "IX_education_records_resident_id" ON education_records ("resident_id");`)
  await client.query(`CREATE INDEX IF NOT EXISTS "IX_health_wellbeing_records_resident_id" ON health_wellbeing_records ("resident_id");`)
  await client.query(`CREATE INDEX IF NOT EXISTS "IX_intervention_plans_resident_id" ON intervention_plans ("resident_id");`)
  await client.query(`CREATE INDEX IF NOT EXISTS "IX_incident_reports_resident_id" ON incident_reports ("resident_id");`)
  await client.query(`CREATE INDEX IF NOT EXISTS "IX_social_media_posts_created_at" ON social_media_posts ("created_at");`)
  await client.query(`CREATE INDEX IF NOT EXISTS "IX_safehouse_monthly_metrics_safehouse_id" ON safehouse_monthly_metrics ("safehouse_id");`)

  await client.query(`
    CREATE TABLE IF NOT EXISTS ml_notebook_status (
      notebook      varchar(64) PRIMARY KEY,
      status        varchar(16) NOT NULL DEFAULT 'idle',
      started_at    timestamptz,
      completed_at  timestamptz,
      error_message text
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS ml_predictions (
      id            serial PRIMARY KEY,
      notebook      varchar(64) NOT NULL,
      record_id     varchar(64) NOT NULL,
      record_type   varchar(32) NOT NULL,
      label         text NOT NULL,
      score         decimal,
      tier          varchar(32),
      meta_json     text,
      refreshed_at  timestamptz NOT NULL DEFAULT NOW(),
      UNIQUE(notebook, record_id)
    );
  `)

  await client.query(`CREATE INDEX IF NOT EXISTS ix_ml_predictions_notebook ON ml_predictions (notebook, score DESC NULLS LAST);`)

  await client.query(`
    CREATE TABLE IF NOT EXISTS ml_domain_summaries (
      domain        varchar(64) PRIMARY KEY,
      summary       text NOT NULL,
      refreshed_at  timestamptz NOT NULL DEFAULT NOW()
    );
  `)

  // Seed the 12 known notebooks with idle status so the status endpoint always returns all rows
  const notebooks = [
    'donor-acquisition-prediction', 'donor-acquisition-explanatory',
    'donor-churn-prediction',       'donor-churn-explanatory',
    'incident-prediction',          'incident-explanatory',
    'reintegration-prediction',     'reintegration-explanatory',
    'social-media-prediction',      'social-media-explanatory',
    'volunteer-prediction',         'volunteer-explanatory',
  ]
  for (const nb of notebooks) {
    await client.query(`
      INSERT INTO ml_notebook_status (notebook, status)
      VALUES ($1, 'idle')
      ON CONFLICT (notebook) DO NOTHING
    `, [nb])
  }

  await client.query(`
    CREATE TABLE IF NOT EXISTS impact_stats_cache (
      id integer PRIMARY KEY,
      computed_at_utc timestamptz NOT NULL,
      payload_json text NOT NULL
    );
  `)

  console.log('Database setup complete: tables/indexes ensured.')
})
