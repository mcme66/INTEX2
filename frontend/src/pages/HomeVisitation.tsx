import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/state/auth";
import { useLanguage } from "@/state/language";
import {
  apiListHomeVisitations,
  apiGetHomeVisitationFilters,
  apiCreateHomeVisitation,
  apiUpdateHomeVisitation,
  apiDeleteHomeVisitation,
  apiListInterventionPlans,
  apiGetInterventionPlanFilters,
  apiCreateInterventionPlan,
  apiUpdateInterventionPlan,
  apiDeleteInterventionPlan,
  type HomeVisitationDto,
  type HomeVisitationFilterOptions,
  type HomeVisitationUpsertRequest,
  type InterventionPlanDto,
  type InterventionPlanFilterOptions,
  type InterventionPlanUpsertRequest,
} from "@/utils/api";
import {
  Search, X, ChevronLeft, ChevronRight, Plus, Pencil,
  ArrowLeft, AlertTriangle, CalendarCheck, Trash2,
  ChevronsUpDown, ChevronUp, ChevronDown, ClipboardList,
} from "lucide-react";

// ── constants ─────────────────────────────────────────────────────────────────

const VISIT_TYPES = [
  "Initial Assessment",
  "Routine Follow-Up",
  "Reintegration Assessment",
  "Post-Placement Monitoring",
  "Emergency",
];

const COOPERATION_LEVELS = ["Cooperative", "Neutral", "Uncooperative", "Resistant"];
const OUTCOMES = ["Favorable", "Needs Follow-Up", "Concerning", "Inconclusive"];

const VISIT_TYPE_COLOR: Record<string, string> = {
  "Initial Assessment": "bg-blue-100 text-blue-800",
  "Routine Follow-Up": "bg-green-100 text-green-800",
  "Reintegration Assessment": "bg-purple-100 text-purple-800",
  "Post-Placement Monitoring": "bg-yellow-100 text-yellow-800",
  "Emergency": "bg-red-100 text-red-800",
};

const COOPERATION_COLOR: Record<string, string> = {
  Cooperative: "bg-green-100 text-green-800",
  Neutral: "bg-secondary text-muted-foreground",
  Uncooperative: "bg-orange-100 text-orange-800",
  Resistant: "bg-red-100 text-red-800",
};

const OUTCOME_COLOR: Record<string, string> = {
  Favorable: "bg-green-100 text-green-800",
  "Needs Follow-Up": "bg-yellow-100 text-yellow-800",
  Concerning: "bg-orange-100 text-orange-800",
  Inconclusive: "bg-secondary text-muted-foreground",
};

function Badge({ value, colorMap }: { value: string | null; colorMap: Record<string, string> }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>;
  const cls = colorMap[value] ?? "bg-secondary text-muted-foreground";
  return <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${cls}`}>{value}</span>;
}

// ── blank form ────────────────────────────────────────────────────────────────

const BLANK: HomeVisitationUpsertRequest = {
  residentId: 0,
  visitDate: null,
  socialWorker: "",
  visitType: "Routine Follow-Up",
  locationVisited: "",
  familyMembersPresent: "",
  purpose: "",
  observations: "",
  familyCooperationLevel: "Neutral",
  safetyConcernsNoted: false,
  followUpNeeded: false,
  followUpNotes: "",
  visitOutcome: "",
};

function visitToForm(v: HomeVisitationDto): HomeVisitationUpsertRequest {
  return {
    residentId: v.residentId,
    visitDate: v.visitDate,
    socialWorker: v.socialWorker ?? "",
    visitType: v.visitType ?? "Routine Follow-Up",
    locationVisited: v.locationVisited ?? "",
    familyMembersPresent: v.familyMembersPresent ?? "",
    purpose: v.purpose ?? "",
    observations: v.observations ?? "",
    familyCooperationLevel: v.familyCooperationLevel ?? "Neutral",
    safetyConcernsNoted: v.safetyConcernsNoted,
    followUpNeeded: v.followUpNeeded,
    followUpNotes: v.followUpNotes ?? "",
    visitOutcome: v.visitOutcome ?? "",
  };
}

// ── modal ─────────────────────────────────────────────────────────────────────

type ModalProps = {
  token: string;
  editing: HomeVisitationDto | null;
  filters: HomeVisitationFilterOptions | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
};

function VisitModal({ token, editing, filters, onClose, onSaved, onDeleted }: ModalProps) {
  const [form, setForm] = useState<HomeVisitationUpsertRequest>(
    editing ? visitToForm(editing) : { ...BLANK }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = (field: keyof HomeVisitationUpsertRequest, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.residentId) { setError("Please select a resident."); return; }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await apiUpdateHomeVisitation(token, editing.visitationId, form);
      } else {
        await apiCreateHomeVisitation(token, form);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    setDeleting(true);
    try {
      await apiDeleteHomeVisitation(token, editing.visitationId);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const inputCls = "w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent";
  const labelCls = "block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide";
  const sectionCls = "pt-6 pb-2";
  const sectionTitle = "text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b border-border";

  const allVisitTypes = filters?.visitTypes.length ? filters.visitTypes : VISIT_TYPES;
  const allCoopLevels = filters?.cooperationLevels.length ? filters.cooperationLevels : COOPERATION_LEVELS;
  const allOutcomes = filters?.outcomes.length ? filters.outcomes : OUTCOMES;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
      <div className="bg-background w-full max-w-2xl border border-border shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-foreground">
            {editing ? `Edit Visit — ${editing.visitDate ?? ""}` : "Log New Visit"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-2 divide-y divide-border">

          {/* Visit Details */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Visit Details</p>
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <div className="col-span-2">
                <label className={labelCls}>Resident</label>
                <select
                  className={inputCls}
                  value={form.residentId || ""}
                  onChange={e => set("residentId", Number(e.target.value))}
                  disabled={!!editing}
                >
                  <option value="">— select resident —</option>
                  {(filters?.residents ?? []).map(r => (
                    <option key={r.residentId} value={r.residentId}>{r.label} (ID {r.residentId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Visit Date</label>
                <input type="date" className={inputCls} value={form.visitDate ?? ""} onChange={e => set("visitDate", e.target.value || null)} />
              </div>
              <div>
                <label className={labelCls}>Visit Type</label>
                <select className={inputCls} value={form.visitType ?? ""} onChange={e => set("visitType", e.target.value)}>
                  <option value="">— select —</option>
                  {allVisitTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Social Worker</label>
                <input className={inputCls} value={form.socialWorker ?? ""} onChange={e => set("socialWorker", e.target.value)} list="sw-list" />
                <datalist id="sw-list">
                  {(filters?.socialWorkers ?? []).map(sw => <option key={sw} value={sw} />)}
                </datalist>
              </div>
              <div>
                <label className={labelCls}>Location Visited</label>
                <input className={inputCls} value={form.locationVisited ?? ""} onChange={e => set("locationVisited", e.target.value)} placeholder="e.g. Family Home, Church" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Family Members Present</label>
                <input className={inputCls} value={form.familyMembersPresent ?? ""} onChange={e => set("familyMembersPresent", e.target.value)} placeholder="e.g. Lopez (Parent); Diaz (Sibling)" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Purpose of Visit</label>
                <input className={inputCls} value={form.purpose ?? ""} onChange={e => set("purpose", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Observations */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Observations &amp; Environment</p>
            <textarea
              className={inputCls + " min-h-[90px] resize-y"}
              value={form.observations ?? ""}
              onChange={e => set("observations", e.target.value)}
              placeholder="Describe the home environment, child's condition, and any notable observations…"
            />
          </div>

          {/* Assessment */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Assessment</p>
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <div>
                <label className={labelCls}>Family Cooperation Level</label>
                <select className={inputCls} value={form.familyCooperationLevel ?? ""} onChange={e => set("familyCooperationLevel", e.target.value)}>
                  <option value="">— select —</option>
                  {allCoopLevels.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Visit Outcome</label>
                <select className={inputCls} value={form.visitOutcome ?? ""} onChange={e => set("visitOutcome", e.target.value)}>
                  <option value="">— select —</option>
                  {allOutcomes.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.safetyConcernsNoted} onChange={e => set("safetyConcernsNoted", e.target.checked)} className="accent-accent" />
                Safety Concerns Noted
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.followUpNeeded} onChange={e => set("followUpNeeded", e.target.checked)} className="accent-accent" />
                Follow-up Needed
              </label>
            </div>
          </div>

          {/* Follow-up */}
          {form.followUpNeeded && (
            <div className={sectionCls}>
              <p className={sectionTitle}>Follow-up Notes</p>
              <textarea
                className={inputCls + " min-h-[70px] resize-y"}
                value={form.followUpNotes ?? ""}
                onChange={e => set("followUpNotes", e.target.value)}
                placeholder="Describe required follow-up actions…"
              />
            </div>
          )}

          {error && <p className="text-destructive text-sm mb-4">{error}</p>}

          <div className="flex items-center justify-between gap-3 pt-5 pb-2">
            <div>
              {editing && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete Record
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="text-sm font-medium px-5 py-2 bg-accent text-accent-foreground hover:bg-gold-dark transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : editing ? "Save Changes" : "Log Visit"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-heading font-semibold text-foreground mb-2">Delete Record</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Deleting record <span className="font-medium text-foreground">{editing.visitDate ?? `#${editing.visitationId}`}</span> for resident <span className="font-medium text-foreground">{editing.residentCode ?? `ID ${editing.residentId}`}</span>. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm px-4 py-2 border border-border hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm font-medium px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── conference modal ──────────────────────────────────────────────────────────

const PLAN_STATUSES = ["Active", "Completed", "On Hold", "Cancelled"];
const PLAN_CATEGORIES = ["Education", "Health", "Psychosocial", "Legal", "Economic", "Family Reunification", "Life Skills"];

const CONF_BLANK: InterventionPlanUpsertRequest = {
  residentId: 0,
  planCategory: "",
  planDescription: "",
  servicesProvided: "",
  targetValue: undefined,
  targetDate: undefined,
  status: "Active",
  caseConferenceDate: undefined,
};

function confToForm(c: InterventionPlanDto): InterventionPlanUpsertRequest {
  return {
    residentId: c.residentId,
    planCategory: c.planCategory ?? "",
    planDescription: c.planDescription ?? "",
    servicesProvided: c.servicesProvided ?? "",
    targetValue: c.targetValue,
    targetDate: c.targetDate,
    status: c.status ?? "Active",
    caseConferenceDate: c.caseConferenceDate,
  };
}

type ConfModalProps = {
  token: string;
  editing: InterventionPlanDto | null;
  filters: InterventionPlanFilterOptions | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
};

function ConferenceModal({ token, editing, filters, onClose, onSaved, onDeleted }: ConfModalProps) {
  const [form, setForm] = useState<InterventionPlanUpsertRequest>(
    editing ? confToForm(editing) : { ...CONF_BLANK }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = (field: keyof InterventionPlanUpsertRequest, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.residentId) { setError("Please select a resident."); return; }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await apiUpdateInterventionPlan(token, editing.planId, form);
      } else {
        await apiCreateInterventionPlan(token, form);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    setDeleting(true);
    try {
      await apiDeleteInterventionPlan(token, editing.planId);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const inputCls = "w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent";
  const labelCls = "block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide";
  const sectionCls = "pt-6 pb-2";
  const sectionTitle = "text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b border-border";

  const allCategories = filters?.categories.length ? filters.categories : PLAN_CATEGORIES;
  const allStatuses = filters?.statuses.length ? filters.statuses : PLAN_STATUSES;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
      <div className="bg-background w-full max-w-2xl border border-border shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-foreground">
            {editing ? `Edit Conference Plan — ${editing.caseConferenceDate ?? ""}` : "New Case Conference"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-2 divide-y divide-border">

          <div className={sectionCls}>
            <p className={sectionTitle}>Conference Details</p>
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <div className="col-span-2">
                <label className={labelCls}>Resident</label>
                <select
                  className={inputCls}
                  value={form.residentId || ""}
                  onChange={e => set("residentId", Number(e.target.value))}
                  disabled={!!editing}
                >
                  <option value="">— select resident —</option>
                  {(filters?.residents ?? []).map(r => (
                    <option key={r.residentId} value={r.residentId}>{r.label} (ID {r.residentId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Conference Date</label>
                <input type="date" className={inputCls} value={form.caseConferenceDate ?? ""} onChange={e => set("caseConferenceDate", e.target.value || null)} />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={form.status ?? ""} onChange={e => set("status", e.target.value)}>
                  <option value="">— select —</option>
                  {allStatuses.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Plan Category</label>
                <select className={inputCls} value={form.planCategory ?? ""} onChange={e => set("planCategory", e.target.value)}>
                  <option value="">— select —</option>
                  {allCategories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Target Date</label>
                <input type="date" className={inputCls} value={form.targetDate ?? ""} onChange={e => set("targetDate", e.target.value || null)} />
              </div>
            </div>
          </div>

          <div className={sectionCls}>
            <p className={sectionTitle}>Plan Details</p>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Plan Description</label>
                <textarea
                  className={inputCls + " min-h-[80px] resize-y"}
                  value={form.planDescription ?? ""}
                  onChange={e => set("planDescription", e.target.value)}
                  placeholder="Describe the intervention plan discussed in the conference…"
                />
              </div>
              <div>
                <label className={labelCls}>Services Provided</label>
                <input className={inputCls} value={form.servicesProvided ?? ""} onChange={e => set("servicesProvided", e.target.value)} placeholder="e.g. Counseling, Legal Aid, Educational Support" />
              </div>
            </div>
          </div>

          {error && <p className="text-destructive text-sm mb-4">{error}</p>}

          <div className="flex items-center justify-between gap-3 pt-5 pb-2">
            <div>
              {editing && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete Record
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="text-sm font-medium px-5 py-2 bg-accent text-accent-foreground hover:bg-gold-dark transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Conference"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {confirmDelete && editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-heading font-semibold text-foreground mb-2">Delete Record</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Deleting conference plan for resident <span className="font-medium text-foreground">{editing.residentCode ?? `ID ${editing.residentId}`}</span> on <span className="font-medium text-foreground">{editing.caseConferenceDate ?? `#${editing.planId}`}</span>. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm px-4 py-2 border border-border hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm font-medium px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

const HomeVisitationPage = () => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [visits, setVisits] = useState<HomeVisitationDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HomeVisitationFilterOptions | null>(null);

  const [search, setSearch] = useState("");
  const [filterResident, setFilterResident] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSW, setFilterSW] = useState("");
  const [filterSafety, setFilterSafety] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HomeVisitationDto | null>(null);
  const [sort, setSort] = useState<{ key: keyof HomeVisitationDto | null; dir: "asc" | "desc" | "none" }>({ key: null, dir: "none" });

  // Conference state
  const [activeTab, setActiveTab] = useState<"visits" | "conferences">("visits");
  const [conferences, setConferences] = useState<InterventionPlanDto[]>([]);
  const [confTotal, setConfTotal] = useState(0);
  const [confPage, setConfPage] = useState(1);
  const [confLoading, setConfLoading] = useState(false);
  const [confError, setConfError] = useState<string | null>(null);
  const [confFilters, setConfFilters] = useState<InterventionPlanFilterOptions | null>(null);
  const [confSearch, setConfSearch] = useState("");
  const [confFilterResident, setConfFilterResident] = useState("");
  const [confFilterStatus, setConfFilterStatus] = useState("");
  const [confFilterCategory, setConfFilterCategory] = useState("");
  const [confShowUpcoming, setConfShowUpcoming] = useState(false);
  const [confModalOpen, setConfModalOpen] = useState(false);
  const [confEditing, setConfEditing] = useState<InterventionPlanDto | null>(null);
  const [confSort, setConfSort] = useState<{ key: keyof InterventionPlanDto | null; dir: "asc" | "desc" | "none" }>({ key: null, dir: "none" });
  const confSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchVisits = useCallback(async (pg = 1) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiListHomeVisitations(token, {
        search: search || undefined,
        residentId: filterResident ? Number(filterResident) : undefined,
        visitType: filterType || undefined,
        socialWorker: filterSW || undefined,
        safetyConcerns: filterSafety === "" ? undefined : filterSafety === "true",
        page: pg,
        pageSize: PAGE_SIZE,
      });
      setVisits(data.items);
      setTotal(data.total);
      setPage(pg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load visits");
    } finally {
      setLoading(false);
    }
  }, [token, search, filterResident, filterType, filterSW, filterSafety]);

  useEffect(() => {
    if (!token) return;
    apiGetHomeVisitationFilters(token).then(setFilters).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchVisits(1), 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [fetchVisits]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSaved = () => {
    setModalOpen(false);
    setEditing(null);
    fetchVisits(page);
  };

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (v: HomeVisitationDto) => { setEditing(v); setModalOpen(true); };

  const clearFilters = () => {
    setSearch(""); setFilterResident(""); setFilterType(""); setFilterSW(""); setFilterSafety("");
  };

  const hasFilters = search || filterResident || filterType || filterSW || filterSafety;

  // ── conference fetch & helpers ──
  const fetchConferences = useCallback(async (pg = 1) => {
    if (!token) return;
    setConfLoading(true);
    setConfError(null);
    try {
      const data = await apiListInterventionPlans(token, {
        search: confSearch || undefined,
        residentId: confFilterResident ? Number(confFilterResident) : undefined,
        status: confFilterStatus || undefined,
        category: confFilterCategory || undefined,
        upcoming: confShowUpcoming || undefined,
        page: pg,
        pageSize: PAGE_SIZE,
      });
      setConferences(data.items);
      setConfTotal(data.total);
      setConfPage(pg);
    } catch (e) {
      setConfError(e instanceof Error ? e.message : "Failed to load conferences");
    } finally {
      setConfLoading(false);
    }
  }, [token, confSearch, confFilterResident, confFilterStatus, confFilterCategory, confShowUpcoming]);

  useEffect(() => {
    if (!token) return;
    apiGetInterventionPlanFilters(token).then(setConfFilters).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (activeTab !== "conferences") return;
    if (confSearchTimeout.current) clearTimeout(confSearchTimeout.current);
    confSearchTimeout.current = setTimeout(() => fetchConferences(1), 300);
    return () => { if (confSearchTimeout.current) clearTimeout(confSearchTimeout.current); };
  }, [fetchConferences, activeTab]);

  const confTotalPages = Math.max(1, Math.ceil(confTotal / PAGE_SIZE));

  const confHandleSaved = () => { setConfModalOpen(false); setConfEditing(null); fetchConferences(confPage); };
  const confOpenNew = () => { setConfEditing(null); setConfModalOpen(true); };
  const confOpenEdit = (c: InterventionPlanDto) => { setConfEditing(c); setConfModalOpen(true); };
  const confClearFilters = () => { setConfSearch(""); setConfFilterResident(""); setConfFilterStatus(""); setConfFilterCategory(""); setConfShowUpcoming(false); };
  const confHasFilters = confSearch || confFilterResident || confFilterStatus || confFilterCategory || confShowUpcoming;

  const confCycleSort = (key: keyof InterventionPlanDto) => {
    setConfSort(prev => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      if (prev.dir === "desc") return { key: null, dir: "none" };
      return { key, dir: "asc" };
    });
  };

  const sortedConferences = confSort.key && confSort.dir !== "none"
    ? [...conferences].sort((a, b) => {
        const av = a[confSort.key!] ?? "";
        const bv = b[confSort.key!] ?? "";
        const n = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
        return confSort.dir === "asc" ? n : -n;
      })
    : conferences;

  const ConfSortIcon = ({ col }: { col: keyof InterventionPlanDto }) => {
    if (confSort.key !== col) return <ChevronsUpDown size={11} className="inline ml-1 opacity-40" />;
    if (confSort.dir === "asc") return <ChevronUp size={11} className="inline ml-1" />;
    return <ChevronDown size={11} className="inline ml-1" />;
  };

  const today = new Date().toISOString().split("T")[0];

  const cycleSort = (key: keyof HomeVisitationDto) => {
    setSort(prev => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      if (prev.dir === "desc") return { key: null, dir: "none" };
      return { key, dir: "asc" };
    });
  };

  const sortedVisits = sort.key && sort.dir !== "none"
    ? [...visits].sort((a, b) => {
        const av = a[sort.key!] ?? "";
        const bv = b[sort.key!] ?? "";
        const n = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sort.dir === "asc" ? n : -n;
      })
    : visits;

  const SortIcon = ({ col }: { col: keyof HomeVisitationDto }) => {
    if (sort.key !== col) return <ChevronsUpDown size={11} className="inline ml-1 opacity-40" />;
    if (sort.dir === "asc") return <ChevronUp size={11} className="inline ml-1" />;
    return <ChevronDown size={11} className="inline ml-1" />;
  };

  const thCls = "text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors";

  const selectCls = "border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-6 py-12 relative">
        {/* Alternating background strips */}
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen -z-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom," +
              "transparent 0," +
              "transparent 24rem," +
              "hsl(var(--accent) / 0.16) 24rem," +
              "hsl(var(--accent) / 0.16) 44rem," +
              "transparent 44rem," +
              "transparent 68rem," +
              "hsl(199 80% 92% / 0.35) 68rem," +
              "hsl(199 80% 92% / 0.35) 88rem," +
              "transparent 88rem," +
              "transparent 112rem" +
              ")",
          }}
        />

        {/* Back button */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={13} />
          {t("navAdminDashboard")}
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-4xl font-semibold text-foreground">{t("visitFullTitle")}</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              {t("visitSubtitle")}
            </p>
          </div>
          <button
            onClick={activeTab === "visits" ? openNew : confOpenNew}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-accent text-accent-foreground hover:bg-gold-dark transition-colors shrink-0"
          >
            <Plus size={14} />
            {activeTab === "visits" ? t("visitLogVisit") : t("visitNewConference")}
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex gap-0 border-b border-border mb-8">
          <button
            onClick={() => setActiveTab("visits")}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "visits"
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Home Visits
          </button>
          <button
            onClick={() => setActiveTab("conferences")}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === "conferences"
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardList size={14} />
            Case Conferences
          </button>
        </div>

        {activeTab === "visits" && <>
        {/* Visit Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="border border-border bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent w-56"
              placeholder="Search resident, location, worker…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className={selectCls} value={filterResident} onChange={e => setFilterResident(e.target.value)}>
            <option value="">All residents</option>
            {(filters?.residents ?? []).map(r => (
              <option key={r.residentId} value={r.residentId}>{r.label}</option>
            ))}
          </select>

          <select className={selectCls} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All visit types</option>
            {(filters?.visitTypes ?? VISIT_TYPES).map(t => <option key={t}>{t}</option>)}
          </select>

          <select className={selectCls} value={filterSW} onChange={e => setFilterSW(e.target.value)}>
            <option value="">All social workers</option>
            {(filters?.socialWorkers ?? []).map(sw => <option key={sw}>{sw}</option>)}
          </select>

          <select className={selectCls} value={filterSafety} onChange={e => setFilterSafety(e.target.value)}>
            <option value="">All safety flags</option>
            <option value="true">Safety concerns only</option>
            <option value="false">No safety concerns</option>
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* Count + top pagination */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading…" : `${total.toLocaleString()} visit${total !== 1 ? "s" : ""}`}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button onClick={() => fetchVisits(page - 1)} disabled={page <= 1 || loading} className="p-1 hover:text-foreground disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => fetchVisits(page + 1)} disabled={page >= totalPages || loading} className="p-1 hover:text-foreground disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {error && <div className="text-destructive text-sm py-8 text-center">{error}</div>}

        {/* Table */}
        {!error && (
          <div className="border border-border bg-background">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className={`${thCls} w-[9%]`} onClick={() => cycleSort("residentCode")}>Resident<SortIcon col="residentCode" /></th>
                  <th className={`${thCls} w-[8%]`} onClick={() => cycleSort("visitDate")}>Date<SortIcon col="visitDate" /></th>
                  <th className={`${thCls} w-[14%]`} onClick={() => cycleSort("visitType")}>Visit Type<SortIcon col="visitType" /></th>
                  <th className={`${thCls} w-[9%]`} onClick={() => cycleSort("socialWorker")}>Worker<SortIcon col="socialWorker" /></th>
                  <th className={`${thCls} w-[9%]`} onClick={() => cycleSort("locationVisited")}>Location<SortIcon col="locationVisited" /></th>
                  <th className={`${thCls} w-[20%]`} onClick={() => cycleSort("observations")}>Observations<SortIcon col="observations" /></th>
                  <th className={`${thCls} w-[10%]`} onClick={() => cycleSort("familyCooperationLevel")}>Cooperation<SortIcon col="familyCooperationLevel" /></th>
                  <th className={`${thCls} w-[9%]`} onClick={() => cycleSort("visitOutcome")}>Outcome<SortIcon col="visitOutcome" /></th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-[5%]">Flags</th>
                  <th className="w-[7%] px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {loading && visits.length === 0 && (
                  <tr><td colSpan={10} className="text-center text-muted-foreground py-16">Loading…</td></tr>
                )}
                {!loading && visits.length === 0 && (
                  <tr><td colSpan={10} className="text-center text-muted-foreground py-16">No visits found</td></tr>
                )}
                {sortedVisits.map((v) => (
                  <tr key={v.visitationId} className="border-b border-border hover:bg-secondary transition-colors align-top">
                    <td className="px-3 py-2.5 font-mono text-xs text-foreground">{v.residentCode ?? `ID ${v.residentId}`}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{v.visitDate ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <Badge value={v.visitType} colorMap={VISIT_TYPE_COLOR} />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground truncate">{v.socialWorker ?? "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground truncate">{v.locationVisited ?? "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      <p className="line-clamp-2">{v.observations ?? "—"}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge value={v.familyCooperationLevel} colorMap={COOPERATION_COLOR} />
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge value={v.visitOutcome} colorMap={OUTCOME_COLOR} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        {v.safetyConcernsNoted && (
                          <span title="Safety concerns" className="text-red-600">
                            <AlertTriangle size={13} />
                          </span>
                        )}
                        {v.followUpNeeded && (
                          <span title="Follow-up needed" className="text-yellow-600">
                            <CalendarCheck size={13} />
                          </span>
                        )}
                        {!v.safetyConcernsNoted && !v.followUpNeeded && (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => openEdit(v)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-3 mt-6 text-xs text-muted-foreground">
            <button onClick={() => fetchVisits(page - 1)} disabled={page <= 1} className="p-1.5 border border-border hover:bg-secondary disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => fetchVisits(page + 1)} disabled={page >= totalPages} className="p-1.5 border border-border hover:bg-secondary disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        )}
        </>}

        {/* ═══════════════════════════ CONFERENCES TAB ═══════════════════════════ */}
        {activeTab === "conferences" && <>

        {/* Conference Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="border border-border bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent w-56"
              placeholder="Search resident, description…"
              value={confSearch}
              onChange={e => setConfSearch(e.target.value)}
            />
          </div>

          <select className={selectCls} value={confFilterResident} onChange={e => setConfFilterResident(e.target.value)}>
            <option value="">All residents</option>
            {(confFilters?.residents ?? []).map(r => (
              <option key={r.residentId} value={r.residentId}>{r.label}</option>
            ))}
          </select>

          <select className={selectCls} value={confFilterStatus} onChange={e => setConfFilterStatus(e.target.value)}>
            <option value="">All statuses</option>
            {(confFilters?.statuses ?? PLAN_STATUSES).map(s => <option key={s}>{s}</option>)}
          </select>

          <select className={selectCls} value={confFilterCategory} onChange={e => setConfFilterCategory(e.target.value)}>
            <option value="">All categories</option>
            {(confFilters?.categories ?? PLAN_CATEGORIES).map(c => <option key={c}>{c}</option>)}
          </select>

          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="checkbox" checked={confShowUpcoming} onChange={e => setConfShowUpcoming(e.target.checked)} className="accent-accent" />
            Upcoming only
          </label>

          {confHasFilters && (
            <button onClick={confClearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* Conference count + pagination */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {confLoading ? "Loading…" : `${confTotal.toLocaleString()} conference${confTotal !== 1 ? "s" : ""}`}
          </p>
          {confTotalPages > 1 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button onClick={() => fetchConferences(confPage - 1)} disabled={confPage <= 1 || confLoading} className="p-1 hover:text-foreground disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              <span>Page {confPage} of {confTotalPages}</span>
              <button onClick={() => fetchConferences(confPage + 1)} disabled={confPage >= confTotalPages || confLoading} className="p-1 hover:text-foreground disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {confError && <div className="text-destructive text-sm py-8 text-center">{confError}</div>}

        {/* Conference Table */}
        {!confError && (
          <div className="border border-border bg-background">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className={`${thCls} w-[10%]`} onClick={() => confCycleSort("residentCode")}>Resident<ConfSortIcon col="residentCode" /></th>
                  <th className={`${thCls} w-[11%]`} onClick={() => confCycleSort("caseConferenceDate")}>Conference Date<ConfSortIcon col="caseConferenceDate" /></th>
                  <th className={`${thCls} w-[11%]`} onClick={() => confCycleSort("planCategory")}>Category<ConfSortIcon col="planCategory" /></th>
                  <th className={`${thCls} w-[28%]`} onClick={() => confCycleSort("planDescription")}>Description<ConfSortIcon col="planDescription" /></th>
                  <th className={`${thCls} w-[15%]`} onClick={() => confCycleSort("servicesProvided")}>Services<ConfSortIcon col="servicesProvided" /></th>
                  <th className={`${thCls} w-[9%]`} onClick={() => confCycleSort("targetDate")}>Target Date<ConfSortIcon col="targetDate" /></th>
                  <th className={`${thCls} w-[8%]`} onClick={() => confCycleSort("status")}>Status<ConfSortIcon col="status" /></th>
                  <th className="w-[4%] px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {confLoading && conferences.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-muted-foreground py-16">Loading…</td></tr>
                )}
                {!confLoading && conferences.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-muted-foreground py-16">No conferences found</td></tr>
                )}
                {sortedConferences.map((c) => {
                  const isUpcoming = c.caseConferenceDate != null && c.caseConferenceDate >= today;
                  return (
                    <tr key={c.planId} className={`border-b border-border hover:bg-secondary transition-colors align-top ${isUpcoming ? "bg-blue-50" : ""}`}>
                      <td className="px-3 py-2.5 font-mono text-xs text-foreground">{c.residentCode ?? `ID ${c.residentId}`}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                        {c.caseConferenceDate ?? "—"}
                        {isUpcoming && <span className="ml-1.5 text-blue-600 text-[10px] font-medium uppercase">upcoming</span>}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{c.planCategory ?? "—"}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        <p className="line-clamp-2">{c.planDescription ?? "—"}</p>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground truncate">{c.servicesProvided ?? "—"}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{c.targetDate ?? "—"}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                          c.status === "Active" ? "bg-green-100 text-green-800" :
                          c.status === "Completed" ? "bg-blue-100 text-blue-800" :
                          c.status === "On Hold" ? "bg-yellow-100 text-yellow-800" :
                          c.status === "Cancelled" ? "bg-red-100 text-red-800" :
                          "bg-secondary text-muted-foreground"
                        }`}>{c.status ?? "—"}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => confOpenEdit(c)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Conference bottom pagination */}
        {confTotalPages > 1 && !confLoading && (
          <div className="flex items-center justify-center gap-3 mt-6 text-xs text-muted-foreground">
            <button onClick={() => fetchConferences(confPage - 1)} disabled={confPage <= 1} className="p-1.5 border border-border hover:bg-secondary disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            <span>Page {confPage} of {confTotalPages}</span>
            <button onClick={() => fetchConferences(confPage + 1)} disabled={confPage >= confTotalPages} className="p-1.5 border border-border hover:bg-secondary disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        )}
        </>}

      </div>

      {modalOpen && token && (
        <VisitModal
          token={token}
          editing={editing}
          filters={filters}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSaved={handleSaved}
          onDeleted={() => { setModalOpen(false); setEditing(null); fetchVisits(page); }}
        />
      )}

      {confModalOpen && token && (
        <ConferenceModal
          token={token}
          editing={confEditing}
          filters={confFilters}
          onClose={() => { setConfModalOpen(false); setConfEditing(null); }}
          onSaved={confHandleSaved}
          onDeleted={() => { setConfModalOpen(false); setConfEditing(null); fetchConferences(confPage); }}
        />
      )}
    </Layout>
  );
};

export default HomeVisitationPage;
