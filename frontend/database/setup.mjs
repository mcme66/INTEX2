import { createPool } from "./db-utils.mjs";

/**
 * Schema aligned with lighthouse_csv_v7 CSVs + Intex API tables.
 * supporters.app_user_id links to users("Id") for donor dashboard.
 */
const DDL = `
CREATE TABLE users (
  "Id" uuid NOT NULL,
  "FirstName" character varying(64) NOT NULL,
  "Email" character varying(256) NOT NULL,
  "Username" character varying(64) NOT NULL,
  "PasswordHash" text NOT NULL,
  "MfaEnabled" boolean NOT NULL DEFAULT false,
  "MfaSecretProtected" text,
  "MfaPendingSecretProtected" text,
  "MfaRecoveryCodesJson" text,
  "IsDonor" boolean NOT NULL DEFAULT false,
  "IsAdmin" boolean NOT NULL DEFAULT false,
  "CreatedAtUtc" timestamp with time zone NOT NULL,
  CONSTRAINT "PK_users" PRIMARY KEY ("Id")
);
CREATE UNIQUE INDEX "IX_users_Email" ON users ("Email");
CREATE UNIQUE INDEX "IX_users_Username" ON users ("Username");

CREATE TABLE add_codes (
  "Code" character varying(64) NOT NULL,
  "CreatedAtUtc" timestamp with time zone NOT NULL,
  CONSTRAINT "PK_add_codes" PRIMARY KEY ("Code")
);

-- ML status + predictions tables used by backend background services
CREATE TABLE IF NOT EXISTS ml_notebook_status (
  notebook      character varying(64) PRIMARY KEY,
  status        character varying(16) NOT NULL DEFAULT 'idle',
  started_at    timestamp with time zone,
  completed_at  timestamp with time zone,
  error_message text
);

CREATE TABLE IF NOT EXISTS ml_predictions (
  id            serial PRIMARY KEY,
  notebook      character varying(64) NOT NULL,
  record_id     character varying(64) NOT NULL,
  record_type   character varying(32) NOT NULL,
  label         text NOT NULL,
  score         numeric,
  tier          character varying(32),
  meta_json     text,
  refreshed_at  timestamp with time zone NOT NULL DEFAULT NOW(),
  UNIQUE(notebook, record_id)
);
CREATE INDEX IF NOT EXISTS ix_ml_predictions_notebook ON ml_predictions (notebook, score DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS ml_domain_summaries (
  domain        character varying(64) PRIMARY KEY,
  summary       text NOT NULL,
  refreshed_at  timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS impact_stats_cache (
  id integer PRIMARY KEY,
  computed_at_utc timestamp with time zone NOT NULL,
  payload_json text NOT NULL
);

CREATE TABLE safehouses (
  safehouse_id integer NOT NULL,
  safehouse_code text,
  name text,
  region text,
  city text,
  province text,
  country text,
  open_date date,
  status text,
  capacity_girls integer,
  capacity_staff integer,
  current_occupancy integer,
  notes text,
  CONSTRAINT pk_safehouses PRIMARY KEY (safehouse_id)
);

CREATE TABLE partners (
  partner_id integer NOT NULL,
  partner_name text,
  partner_type text,
  role_type text,
  contact_name text,
  email text,
  phone text,
  region text,
  status text,
  start_date date,
  end_date date,
  notes text,
  CONSTRAINT pk_partners PRIMARY KEY (partner_id)
);

CREATE TABLE supporters (
  supporter_id integer NOT NULL,
  supporter_type text,
  display_name text,
  organization_name text,
  first_name text,
  last_name text,
  relationship_type text,
  region text,
  country text,
  email text,
  phone text,
  status text,
  created_at timestamp without time zone,
  first_donation_date date,
  acquisition_channel text,
  app_user_id uuid NULL,
  CONSTRAINT pk_supporters PRIMARY KEY (supporter_id),
  CONSTRAINT fk_supporters_app_user FOREIGN KEY (app_user_id) REFERENCES users ("Id") ON DELETE SET NULL
);
CREATE UNIQUE INDEX ix_supporters_app_user_id_unique ON supporters (app_user_id) WHERE app_user_id IS NOT NULL;

CREATE TABLE residents (
  resident_id integer NOT NULL,
  case_control_no text,
  internal_code text,
  safehouse_id integer NOT NULL,
  case_status text,
  sex text,
  date_of_birth date,
  birth_status text,
  place_of_birth text,
  religion text,
  case_category text,
  sub_cat_orphaned boolean,
  sub_cat_trafficked boolean,
  sub_cat_child_labor boolean,
  sub_cat_physical_abuse boolean,
  sub_cat_sexual_abuse boolean,
  sub_cat_osaec boolean,
  sub_cat_cicl boolean,
  sub_cat_at_risk boolean,
  sub_cat_street_child boolean,
  sub_cat_child_with_hiv boolean,
  is_pwd boolean,
  pwd_type text,
  has_special_needs boolean,
  special_needs_diagnosis text,
  family_is_4ps boolean,
  family_solo_parent boolean,
  family_indigenous boolean,
  family_parent_pwd boolean,
  family_informal_settler boolean,
  date_of_admission date,
  age_upon_admission text,
  present_age text,
  length_of_stay text,
  referral_source text,
  referring_agency_person text,
  date_colb_registered date,
  date_colb_obtained date,
  assigned_social_worker text,
  initial_case_assessment text,
  date_case_study_prepared date,
  reintegration_type text,
  reintegration_status text,
  initial_risk_level text,
  current_risk_level text,
  date_enrolled date,
  date_closed date,
  created_at timestamp without time zone,
  notes_restricted text,
  CONSTRAINT pk_residents PRIMARY KEY (resident_id),
  CONSTRAINT fk_residents_safehouse FOREIGN KEY (safehouse_id) REFERENCES safehouses (safehouse_id)
);

CREATE TABLE social_media_posts (
  post_id integer NOT NULL,
  platform text,
  platform_post_id text,
  post_url text,
  created_at timestamp without time zone,
  day_of_week text,
  post_hour integer,
  post_type text,
  media_type text,
  caption text,
  hashtags text,
  num_hashtags integer,
  mentions_count integer,
  has_call_to_action boolean,
  call_to_action_type text,
  content_topic text,
  sentiment_tone text,
  caption_length integer,
  features_resident_story boolean,
  campaign_name text,
  is_boosted boolean,
  boost_budget_php numeric,
  impressions bigint,
  reach bigint,
  likes bigint,
  comments bigint,
  shares bigint,
  saves bigint,
  click_throughs bigint,
  video_views bigint,
  engagement_rate numeric,
  profile_visits bigint,
  donation_referrals bigint,
  estimated_donation_value_php numeric,
  follower_count_at_post bigint,
  watch_time_seconds bigint,
  avg_view_duration_seconds numeric,
  subscriber_count_at_post bigint,
  forwards numeric,
  CONSTRAINT pk_social_media_posts PRIMARY KEY (post_id)
);

CREATE TABLE donations (
  donation_id integer NOT NULL,
  supporter_id integer NOT NULL,
  donation_type text,
  donation_date date,
  is_recurring boolean,
  campaign_name text,
  channel_source text,
  currency_code text,
  amount numeric,
  estimated_value numeric,
  impact_unit text,
  notes text,
  referral_post_id integer,
  CONSTRAINT pk_donations PRIMARY KEY (donation_id),
  CONSTRAINT fk_donations_supporter FOREIGN KEY (supporter_id) REFERENCES supporters (supporter_id)
);

CREATE TABLE donation_allocations (
  allocation_id integer NOT NULL,
  donation_id integer NOT NULL,
  safehouse_id integer NOT NULL,
  program_area text,
  amount_allocated numeric,
  allocation_date date,
  allocation_notes text,
  CONSTRAINT pk_donation_allocations PRIMARY KEY (allocation_id),
  CONSTRAINT fk_da_donation FOREIGN KEY (donation_id) REFERENCES donations (donation_id) ON DELETE CASCADE,
  CONSTRAINT fk_da_safehouse FOREIGN KEY (safehouse_id) REFERENCES safehouses (safehouse_id)
);

CREATE TABLE in_kind_donation_items (
  item_id integer NOT NULL,
  donation_id integer NOT NULL,
  item_name text,
  item_category text,
  quantity integer,
  unit_of_measure text,
  estimated_unit_value numeric,
  intended_use text,
  received_condition text,
  CONSTRAINT pk_in_kind_donation_items PRIMARY KEY (item_id),
  CONSTRAINT fk_iki_donation FOREIGN KEY (donation_id) REFERENCES donations (donation_id) ON DELETE CASCADE
);

CREATE TABLE partner_assignments (
  assignment_id integer NOT NULL,
  partner_id integer NOT NULL,
  safehouse_id integer,
  program_area text,
  assignment_start date,
  assignment_end date,
  responsibility_notes text,
  is_primary boolean,
  status text,
  CONSTRAINT pk_partner_assignments PRIMARY KEY (assignment_id),
  CONSTRAINT fk_pa_partner FOREIGN KEY (partner_id) REFERENCES partners (partner_id),
  CONSTRAINT fk_pa_safehouse FOREIGN KEY (safehouse_id) REFERENCES safehouses (safehouse_id)
);

CREATE TABLE education_records (
  education_record_id integer NOT NULL,
  resident_id integer NOT NULL,
  record_date date,
  education_level text,
  school_name text,
  enrollment_status text,
  attendance_rate numeric,
  progress_percent numeric,
  completion_status text,
  notes text,
  CONSTRAINT pk_education_records PRIMARY KEY (education_record_id),
  CONSTRAINT fk_edu_resident FOREIGN KEY (resident_id) REFERENCES residents (resident_id) ON DELETE CASCADE
);

CREATE TABLE health_wellbeing_records (
  health_record_id integer NOT NULL,
  resident_id integer NOT NULL,
  record_date date,
  general_health_score numeric,
  nutrition_score numeric,
  sleep_quality_score numeric,
  energy_level_score numeric,
  height_cm numeric,
  weight_kg numeric,
  bmi numeric,
  medical_checkup_done boolean,
  dental_checkup_done boolean,
  psychological_checkup_done boolean,
  notes text,
  CONSTRAINT pk_health_wellbeing_records PRIMARY KEY (health_record_id),
  CONSTRAINT fk_health_resident FOREIGN KEY (resident_id) REFERENCES residents (resident_id) ON DELETE CASCADE
);

CREATE TABLE home_visitations (
  visitation_id integer NOT NULL,
  resident_id integer NOT NULL,
  visit_date date,
  social_worker text,
  visit_type text,
  location_visited text,
  family_members_present text,
  purpose text,
  observations text,
  family_cooperation_level text,
  safety_concerns_noted boolean,
  follow_up_needed boolean,
  follow_up_notes text,
  visit_outcome text,
  CONSTRAINT pk_home_visitations PRIMARY KEY (visitation_id),
  CONSTRAINT fk_hv_resident FOREIGN KEY (resident_id) REFERENCES residents (resident_id) ON DELETE CASCADE
);

CREATE TABLE incident_reports (
  incident_id integer NOT NULL,
  resident_id integer NOT NULL,
  safehouse_id integer NOT NULL,
  incident_date date,
  incident_type text,
  severity text,
  description text,
  response_taken text,
  resolved boolean,
  resolution_date date,
  reported_by text,
  follow_up_required boolean,
  CONSTRAINT pk_incident_reports PRIMARY KEY (incident_id),
  CONSTRAINT fk_ir_resident FOREIGN KEY (resident_id) REFERENCES residents (resident_id) ON DELETE CASCADE,
  CONSTRAINT fk_ir_safehouse FOREIGN KEY (safehouse_id) REFERENCES safehouses (safehouse_id)
);

CREATE TABLE intervention_plans (
  plan_id integer NOT NULL,
  resident_id integer NOT NULL,
  plan_category text,
  plan_description text,
  services_provided text,
  target_value numeric,
  target_date date,
  status text,
  case_conference_date date,
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  CONSTRAINT pk_intervention_plans PRIMARY KEY (plan_id),
  CONSTRAINT fk_ip_resident FOREIGN KEY (resident_id) REFERENCES residents (resident_id) ON DELETE CASCADE
);

CREATE TABLE process_recordings (
  recording_id integer NOT NULL,
  resident_id integer NOT NULL,
  session_date date,
  social_worker text,
  session_type text,
  session_duration_minutes integer,
  emotional_state_observed text,
  emotional_state_end text,
  session_narrative text,
  interventions_applied text,
  follow_up_actions text,
  progress_noted boolean,
  concerns_flagged boolean,
  referral_made boolean,
  notes_restricted text,
  CONSTRAINT pk_process_recordings PRIMARY KEY (recording_id),
  CONSTRAINT fk_pr_resident FOREIGN KEY (resident_id) REFERENCES residents (resident_id) ON DELETE CASCADE
);

CREATE TABLE public_impact_snapshots (
  snapshot_id integer NOT NULL,
  snapshot_date date,
  headline text,
  summary_text text,
  metric_payload_json text,
  is_published boolean,
  published_at date,
  CONSTRAINT pk_public_impact_snapshots PRIMARY KEY (snapshot_id)
);

CREATE TABLE safehouse_monthly_metrics (
  metric_id integer NOT NULL,
  safehouse_id integer NOT NULL,
  month_start date,
  month_end date,
  active_residents integer,
  avg_education_progress numeric,
  avg_health_score numeric,
  process_recording_count integer,
  home_visitation_count integer,
  incident_count integer,
  notes text,
  CONSTRAINT pk_safehouse_monthly_metrics PRIMARY KEY (metric_id),
  CONSTRAINT fk_smm_safehouse FOREIGN KEY (safehouse_id) REFERENCES safehouses (safehouse_id)
);
`;

async function main() {
  const pool = createPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const stmt of DDL.split(";").map((s) => s.trim()).filter(Boolean)) {
      await client.query(stmt);
    }

    // Seed the known notebooks with idle status so status endpoints always have rows.
    const notebooks = [
      "donor-acquisition-prediction",
      "donor-acquisition-explanatory",
      "donor-churn-prediction",
      "donor-churn-explanatory",
      "incident-prediction",
      "incident-explanatory",
      "reintegration-prediction",
      "reintegration-explanatory",
      "social-media-prediction",
      "social-media-explanatory",
      "volunteer-prediction",
      "volunteer-explanatory",
    ];
    for (const nb of notebooks) {
      await client.query(
        `INSERT INTO ml_notebook_status (notebook, status)
         VALUES ($1, 'idle')
         ON CONFLICT (notebook) DO NOTHING`,
        [nb],
      );
    }

    await client.query("COMMIT");
    console.log("db:setup — created tables (Lighthouse + users/add_codes + supporters.app_user_id).");
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
