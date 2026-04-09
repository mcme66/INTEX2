import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/state/auth";
import { useLanguage } from "@/state/language";
import {
  apiListProcessRecordings,
  apiGetProcessRecordingFilters,
  apiCreateProcessRecording,
  apiUpdateProcessRecording,
  apiDeleteProcessRecording,
  type ProcessRecordingDto,
  type ProcessRecordingFilterOptions,
  type ProcessRecordingUpsertRequest,
} from "@/utils/api";
import { Search, X, ChevronLeft, ChevronRight, Plus, Pencil, ArrowLeft, CheckCircle2, AlertCircle, UserCheck, Trash2, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────

const SESSION_TYPE_COLOR: Record<string, string> = {
  Individual: "bg-blue-100 text-blue-800",
  Group: "bg-purple-100 text-purple-800",
};

const EMOTIONAL_STATES = [
  "Calm", "Happy", "Hopeful", "Neutral", "Anxious", "Sad",
  "Angry", "Distressed", "Withdrawn", "Engaged",
];

const INTERVENTION_OPTIONS = [
  "Cognitive Behavioral Therapy", "Play Therapy", "Trauma-Focused CBT",
  "Art Therapy", "Group Discussion", "Legal Services",
  "Medical Referral", "Caring", "Referral to specialist", "Life Skills Training",
];

function Badge({ value, colorMap }: { value: string | null; colorMap: Record<string, string> }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  const cls = colorMap[value] ?? "bg-secondary text-muted-foreground";
  return <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${cls}`}>{value}</span>;
}

// ── blank form ────────────────────────────────────────────────────────────────

const BLANK: ProcessRecordingUpsertRequest = {
  residentId: 0,
  sessionDate: null,
  socialWorker: "",
  sessionType: "Individual",
  sessionDurationMinutes: null,
  emotionalStateObserved: "",
  emotionalStateEnd: "",
  sessionNarrative: "",
  interventionsApplied: "",
  followUpActions: "",
  progressNoted: false,
  concernsFlagged: false,
  referralMade: false,
  notesRestricted: "",
};

function recordingToForm(r: ProcessRecordingDto): ProcessRecordingUpsertRequest {
  return {
    residentId: r.residentId,
    sessionDate: r.sessionDate,
    socialWorker: r.socialWorker ?? "",
    sessionType: r.sessionType ?? "Individual",
    sessionDurationMinutes: r.sessionDurationMinutes,
    emotionalStateObserved: r.emotionalStateObserved ?? "",
    emotionalStateEnd: r.emotionalStateEnd ?? "",
    sessionNarrative: r.sessionNarrative ?? "",
    interventionsApplied: r.interventionsApplied ?? "",
    followUpActions: r.followUpActions ?? "",
    progressNoted: r.progressNoted,
    concernsFlagged: r.concernsFlagged,
    referralMade: r.referralMade,
    notesRestricted: "",
  };
}

// ── modal ─────────────────────────────────────────────────────────────────────

type ModalProps = {
  token: string;
  editing: ProcessRecordingDto | null;
  filters: ProcessRecordingFilterOptions | null;
  defaultResidentId?: number;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
};

function RecordingModal({ token, editing, filters, defaultResidentId, onClose, onSaved, onDeleted }: ModalProps) {
  const [form, setForm] = useState<ProcessRecordingUpsertRequest>(() => {
    if (editing) return recordingToForm(editing);
    return { ...BLANK, residentId: defaultResidentId ?? 0 };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = (field: keyof ProcessRecordingUpsertRequest, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.residentId) { setError("Please select a resident."); return; }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await apiUpdateProcessRecording(token, editing.recordingId, form);
      } else {
        await apiCreateProcessRecording(token, form);
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
      await apiDeleteProcessRecording(token, editing.recordingId);
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
      <div className="bg-background w-full max-w-2xl border border-border shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-foreground">
            {editing ? `Edit Session — ${editing.sessionDate ?? ""}` : "New Process Recording"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-2 divide-y divide-border">

          {/* Session Info */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Session Details</p>
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
                <label className={labelCls}>Session Date</label>
                <input type="date" className={inputCls} value={form.sessionDate ?? ""} onChange={e => set("sessionDate", e.target.value || null)} />
              </div>
              <div>
                <label className={labelCls}>Duration (minutes)</label>
                <input type="number" className={inputCls} value={form.sessionDurationMinutes ?? ""} onChange={e => set("sessionDurationMinutes", e.target.value ? Number(e.target.value) : null)} min={1} />
              </div>
              <div>
                <label className={labelCls}>Social Worker</label>
                <input className={inputCls} value={form.socialWorker ?? ""} onChange={e => set("socialWorker", e.target.value)} list="sw-list" />
                <datalist id="sw-list">
                  {(filters?.socialWorkers ?? []).map(sw => <option key={sw} value={sw} />)}
                </datalist>
              </div>
              <div>
                <label className={labelCls}>Session Type</label>
                <select className={inputCls} value={form.sessionType ?? ""} onChange={e => set("sessionType", e.target.value)}>
                  <option value="">— select —</option>
                  {(filters?.sessionTypes.length ? filters.sessionTypes : ["Individual", "Group"]).map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Emotional State */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Emotional State</p>
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <div>
                <label className={labelCls}>At Start of Session</label>
                <select className={inputCls} value={form.emotionalStateObserved ?? ""} onChange={e => set("emotionalStateObserved", e.target.value)}>
                  <option value="">— select —</option>
                  {EMOTIONAL_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>At End of Session</label>
                <select className={inputCls} value={form.emotionalStateEnd ?? ""} onChange={e => set("emotionalStateEnd", e.target.value)}>
                  <option value="">— select —</option>
                  {EMOTIONAL_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Narrative */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Session Narrative</p>
            <textarea
              className={inputCls + " min-h-[100px] resize-y"}
              value={form.sessionNarrative ?? ""}
              onChange={e => set("sessionNarrative", e.target.value)}
              placeholder="Describe what occurred during the session…"
            />
          </div>

          {/* Interventions & Follow-up */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Interventions &amp; Follow-up</p>
            <div className="grid grid-cols-1 gap-y-4">
              <div>
                <label className={labelCls}>Interventions Applied</label>
                <input className={inputCls} value={form.interventionsApplied ?? ""} onChange={e => set("interventionsApplied", e.target.value)} list="int-list" placeholder="e.g. Cognitive Behavioral Therapy" />
                <datalist id="int-list">
                  {INTERVENTION_OPTIONS.map(o => <option key={o} value={o} />)}
                </datalist>
              </div>
              <div>
                <label className={labelCls}>Follow-up Actions</label>
                <input className={inputCls} value={form.followUpActions ?? ""} onChange={e => set("followUpActions", e.target.value)} placeholder="e.g. Referral to specialist" />
              </div>
            </div>
          </div>

          {/* Flags */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Flags</p>
            <div className="flex flex-wrap gap-6">
              {([ ["progressNoted", "Progress Noted"], ["concernsFlagged", "Concerns Flagged"], ["referralMade", "Referral Made"] ] as [keyof ProcessRecordingUpsertRequest, string][]).map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={!!form[field]} onChange={e => set(field, e.target.checked)} className="accent-accent" />
                  {label}
                </label>
              ))}
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
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Record"}
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
              Deleting record <span className="font-medium text-foreground">{editing.sessionDate ?? `#${editing.recordingId}`}</span> for resident <span className="font-medium text-foreground">{editing.residentCode ?? `ID ${editing.residentId}`}</span>. This cannot be undone.
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

const ProcessRecordingPage = () => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [recordings, setRecordings] = useState<ProcessRecordingDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProcessRecordingFilterOptions | null>(null);

  const [search, setSearch] = useState("");
  const [filterResident, setFilterResident] = useState("");
  const [filterSW, setFilterSW] = useState("");
  const [filterType, setFilterType] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProcessRecordingDto | null>(null);
  const [sort, setSort] = useState<{ key: keyof ProcessRecordingDto | null; dir: "asc" | "desc" | "none" }>({ key: null, dir: "none" });

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRecordings = useCallback(async (pg = 1) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiListProcessRecordings(token, {
        search: search || undefined,
        residentId: filterResident ? Number(filterResident) : undefined,
        socialWorker: filterSW || undefined,
        sessionType: filterType || undefined,
        page: pg,
        pageSize: PAGE_SIZE,
      });
      setRecordings(data.items);
      setTotal(data.total);
      setPage(pg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load recordings");
    } finally {
      setLoading(false);
    }
  }, [token, search, filterResident, filterSW, filterType]);

  useEffect(() => {
    if (!token) return;
    apiGetProcessRecordingFilters(token).then(setFilters).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchRecordings(1), 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [fetchRecordings]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSaved = () => {
    setModalOpen(false);
    setEditing(null);
    fetchRecordings(page);
  };

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (r: ProcessRecordingDto) => { setEditing(r); setModalOpen(true); };

  const clearFilters = () => {
    setSearch(""); setFilterResident(""); setFilterSW(""); setFilterType("");
  };

  const hasFilters = search || filterResident || filterSW || filterType;

  const cycleSort = (key: keyof ProcessRecordingDto) => {
    setSort(prev => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      if (prev.dir === "desc") return { key: null, dir: "none" };
      return { key, dir: "asc" };
    });
  };

  const sortedRecordings = sort.key && sort.dir !== "none"
    ? [...recordings].sort((a, b) => {
        const av = a[sort.key!] ?? "";
        const bv = b[sort.key!] ?? "";
        const n = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sort.dir === "asc" ? n : -n;
      })
    : recordings;

  const SortIcon = ({ col }: { col: keyof ProcessRecordingDto }) => {
    if (sort.key !== col) return <ChevronsUpDown size={11} className="inline ml-1 opacity-40" />;
    if (sort.dir === "asc") return <ChevronUp size={11} className="inline ml-1" />;
    return <ChevronDown size={11} className="inline ml-1" />;
  };

  const thCls = "text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap";

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
        <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-4xl font-semibold text-foreground">{t("processTitle")}</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              {t("processSubtitle")}
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-accent text-accent-foreground hover:bg-gold-dark transition-colors shrink-0"
          >
            <Plus size={14} />
            {t("processNewSession")}
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="border border-border bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent w-56"
              placeholder={t("processSearchDetailed")}
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

          <select className={selectCls} value={filterSW} onChange={e => setFilterSW(e.target.value)}>
            <option value="">All social workers</option>
            {(filters?.socialWorkers ?? []).map(sw => <option key={sw}>{sw}</option>)}
          </select>

          <select className={selectCls} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All session types</option>
            {(filters?.sessionTypes ?? []).map(t => <option key={t}>{t}</option>)}
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* Count + pagination */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading…" : `${total.toLocaleString()} recording${total !== 1 ? "s" : ""}`}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button onClick={() => fetchRecordings(page - 1)} disabled={page <= 1 || loading} className="p-1 hover:text-foreground disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => fetchRecordings(page + 1)} disabled={page >= totalPages || loading} className="p-1 hover:text-foreground disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {error && <div className="text-destructive text-sm py-8 text-center">{error}</div>}

        {/* Table */}
        {!error && (
          <div className="border border-border bg-background overflow-x-auto">
            <table className="w-full text-sm table-fixed min-w-[1100px]">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className={`${thCls} w-[10%]`} onClick={() => cycleSort("residentCode")}>Resident<SortIcon col="residentCode" /></th>
                  <th className={`${thCls} w-[9%]`} onClick={() => cycleSort("sessionDate")}>Date<SortIcon col="sessionDate" /></th>
                  <th className={`${thCls} w-[10%]`} onClick={() => cycleSort("socialWorker")}>Social Worker<SortIcon col="socialWorker" /></th>
                  <th className={`${thCls} w-[9%]`} onClick={() => cycleSort("sessionType")}>Type<SortIcon col="sessionType" /></th>
                  <th className={`${thCls} w-[8%]`} onClick={() => cycleSort("emotionalStateObserved")}>Emotional State<SortIcon col="emotionalStateObserved" /></th>
                  <th className={`${thCls} w-[28%]`} onClick={() => cycleSort("sessionNarrative")}>Narrative<SortIcon col="sessionNarrative" /></th>
                  <th className={`${thCls} w-[14%]`} onClick={() => cycleSort("interventionsApplied")}>Interventions<SortIcon col="interventionsApplied" /></th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-[8%]">Flags</th>
                  <th className="w-[4%] px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {loading && recordings.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-muted-foreground py-16">{t("processLoading")}</td></tr>
                )}
                {!loading && recordings.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-muted-foreground py-16">{t("processNoRecordingsFound")}</td></tr>
                )}
                {sortedRecordings.map((r) => (
                  <tr key={r.recordingId} className="border-b border-border hover:bg-secondary transition-colors align-top">
                    <td className="px-3 py-2.5">
                      <div className="font-mono text-xs text-foreground">{r.residentCode ?? `ID ${r.residentId}`}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{r.sessionDate ?? "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground truncate">{r.socialWorker ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <Badge value={r.sessionType} colorMap={SESSION_TYPE_COLOR} />
                    </td>
                    <td className="px-3 py-2.5">
                      {r.emotionalStateObserved && (
                        <div className="text-xs text-muted-foreground">Start: {r.emotionalStateObserved}</div>
                      )}
                      {r.emotionalStateEnd && (
                        <div className="text-xs text-foreground">End: {r.emotionalStateEnd}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      <p className="line-clamp-2">{r.sessionNarrative ?? "—"}</p>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground truncate">{r.interventionsApplied ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        {r.progressNoted && (
                          <span className="flex items-center gap-1 text-xs text-green-700">
                            <CheckCircle2 size={11} /> Progress
                          </span>
                        )}
                        {r.concernsFlagged && (
                          <span className="flex items-center gap-1 text-xs text-orange-700">
                            <AlertCircle size={11} /> Concern
                          </span>
                        )}
                        {r.referralMade && (
                          <span className="flex items-center gap-1 text-xs text-blue-700">
                            <UserCheck size={11} /> Referral
                          </span>
                        )}
                        {!r.progressNoted && !r.concernsFlagged && !r.referralMade && (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => openEdit(r)}
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
            <button onClick={() => fetchRecordings(page - 1)} disabled={page <= 1} className="p-1.5 border border-border hover:bg-secondary disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => fetchRecordings(page + 1)} disabled={page >= totalPages} className="p-1.5 border border-border hover:bg-secondary disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        )}

      </div>

      {modalOpen && token && (
        <RecordingModal
          token={token}
          editing={editing}
          filters={filters}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSaved={handleSaved}
          onDeleted={() => { setModalOpen(false); setEditing(null); fetchRecordings(page); }}
        />
      )}
    </Layout>
  );
};

export default ProcessRecordingPage;
