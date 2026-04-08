import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/state/auth";
import {
  apiListHomeVisitations,
  apiGetHomeVisitationFilters,
  apiCreateHomeVisitation,
  apiUpdateHomeVisitation,
  type HomeVisitationDto,
  type HomeVisitationFilterOptions,
  type HomeVisitationUpsertRequest,
} from "@/utils/api";
import {
  Search, X, ChevronLeft, ChevronRight, Plus, Pencil,
  ArrowLeft, AlertTriangle, CalendarCheck,
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
};

function VisitModal({ token, editing, filters, onClose, onSaved }: ModalProps) {
  const [form, setForm] = useState<HomeVisitationUpsertRequest>(
    editing ? visitToForm(editing) : { ...BLANK }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const inputCls = "w-full border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent";
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1";
  const sectionCls = "mb-6";
  const sectionTitle = "text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3";

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

        <form onSubmit={handleSubmit} className="px-6 py-6">

          {/* Visit Details */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Visit Details</p>
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
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
        </form>
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

const HomeVisitationPage = () => {
  const { token } = useAuth();
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
  const selectCls = "border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-6 py-12">

        {/* Back button */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={13} />
          Admin Dashboard
        </Link>

        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Admin · Case Management
            </p>
            <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground">Home Visitation</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Home and field visit logs including observations, family cooperation, safety concerns, and follow-up actions.
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-accent text-accent-foreground hover:bg-gold-dark transition-colors shrink-0"
          >
            <Plus size={14} />
            Log Visit
          </button>
        </div>

        {/* Filters */}
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
          <div className="border border-border">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-[9%]">Resident</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-[8%]">Date</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-[17%]">Visit Type</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-[9%]">Worker</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-[10%]">Location</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-[22%]">Observations</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-[10%]">Cooperation</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-[9%]">Outcome</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-[4%]">Flags</th>
                  <th className="w-[2%] px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {loading && visits.length === 0 && (
                  <tr><td colSpan={10} className="text-center text-muted-foreground py-16">Loading…</td></tr>
                )}
                {!loading && visits.length === 0 && (
                  <tr><td colSpan={10} className="text-center text-muted-foreground py-16">No visits found</td></tr>
                )}
                {visits.map((v) => (
                  <tr key={v.visitationId} className="border-b border-border hover:bg-secondary/20 transition-colors align-top">
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

      </div>

      {modalOpen && token && (
        <VisitModal
          token={token}
          editing={editing}
          filters={filters}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </Layout>
  );
};

export default HomeVisitationPage;
