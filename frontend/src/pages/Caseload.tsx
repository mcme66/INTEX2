import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/state/auth";
import { useLanguage } from "@/state/language";
import {
  apiListResidents,
  apiGetResidentFilters,
  apiCreateResident,
  apiUpdateResident,
  apiDeleteResident,
  type ResidentListItem,
  type ResidentFilterOptions,
  type ResidentUpsertRequest,
} from "@/utils/api";
import { Search, X, ChevronLeft, ChevronRight, Plus, Pencil, ArrowLeft, Trash2, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────

const RISK_COLOR: Record<string, string> = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

const STATUS_COLOR: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Closed: "bg-secondary text-muted-foreground",
  "On Hold": "bg-yellow-100 text-yellow-800",
};

function Badge({ value, colorMap }: { value: string | null; colorMap: Record<string, string> }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  const cls = colorMap[value] ?? "bg-secondary text-muted-foreground";
  return <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${cls}`}>{value}</span>;
}

function subcatLabels(r: ResidentListItem): string[] {
  const map: [boolean, string][] = [
    [r.subCatOrphaned, "Orphaned"],
    [r.subCatTrafficked, "Trafficked"],
    [r.subCatChildLabor, "Child Labor"],
    [r.subCatPhysicalAbuse, "Physical Abuse"],
    [r.subCatSexualAbuse, "Sexual Abuse"],
    [r.subCatOsaec, "OSAEC"],
    [r.subCatCicl, "CICL"],
    [r.subCatAtRisk, "At Risk"],
    [r.subCatStreetChild, "Street Child"],
    [r.subCatChildWithHiv, "Child w/ HIV"],
  ];
  return map.filter(([v]) => v).map(([, l]) => l);
}

function familyFlags(r: ResidentListItem): string[] {
  const map: [boolean, string][] = [
    [r.familyIs4Ps, "4Ps"],
    [r.familySoloParent, "Solo Parent"],
    [r.familyIndigenous, "Indigenous"],
    [r.familyParentPwd, "Parent PWD"],
    [r.familyInformalSettler, "Informal Settler"],
  ];
  return map.filter(([v]) => v).map(([, l]) => l);
}

// ── blank form state ──────────────────────────────────────────────────────────

const BLANK: ResidentUpsertRequest = {
  caseControlNo: "", internalCode: "", safehouseId: null, caseStatus: "Active",
  sex: "", dateOfBirth: null, birthStatus: "", placeOfBirth: "", religion: "",
  caseCategory: "",
  subCatOrphaned: false, subCatTrafficked: false, subCatChildLabor: false,
  subCatPhysicalAbuse: false, subCatSexualAbuse: false, subCatOsaec: false,
  subCatCicl: false, subCatAtRisk: false, subCatStreetChild: false, subCatChildWithHiv: false,
  isPwd: false, pwdType: null, hasSpecialNeeds: false, specialNeedsDiagnosis: null,
  familyIs4Ps: false, familySoloParent: false, familyIndigenous: false,
  familyParentPwd: false, familyInformalSettler: false,
  dateOfAdmission: null, ageUponAdmission: "", presentAge: "", lengthOfStay: "",
  referralSource: "", referringAgencyPerson: "",
  dateColbRegistered: null, dateColbObtained: null,
  assignedSocialWorker: "", initialCaseAssessment: "", dateCaseStudyPrepared: null,
  reintegrationType: "", reintegrationStatus: "Not Started",
  initialRiskLevel: "", currentRiskLevel: "",
  dateEnrolled: null, dateClosed: null, notesRestricted: "",
};

function residentToForm(r: ResidentListItem): ResidentUpsertRequest {
  return {
    caseControlNo: r.caseControlNo ?? "",
    internalCode: r.internalCode ?? "",
    safehouseId: r.safehouseId,
    caseStatus: r.caseStatus ?? "Active",
    sex: r.sex ?? "",
    dateOfBirth: r.dateOfBirth,
    birthStatus: "", placeOfBirth: "", religion: "",
    caseCategory: r.caseCategory ?? "",
    subCatOrphaned: r.subCatOrphaned, subCatTrafficked: r.subCatTrafficked,
    subCatChildLabor: r.subCatChildLabor, subCatPhysicalAbuse: r.subCatPhysicalAbuse,
    subCatSexualAbuse: r.subCatSexualAbuse, subCatOsaec: r.subCatOsaec,
    subCatCicl: r.subCatCicl, subCatAtRisk: r.subCatAtRisk,
    subCatStreetChild: r.subCatStreetChild, subCatChildWithHiv: r.subCatChildWithHiv,
    isPwd: r.isPwd, pwdType: r.pwdType, hasSpecialNeeds: r.hasSpecialNeeds,
    specialNeedsDiagnosis: r.specialNeedsDiagnosis,
    familyIs4Ps: r.familyIs4Ps, familySoloParent: r.familySoloParent,
    familyIndigenous: r.familyIndigenous, familyParentPwd: r.familyParentPwd,
    familyInformalSettler: r.familyInformalSettler,
    dateOfAdmission: r.dateOfAdmission, ageUponAdmission: r.ageUponAdmission ?? "",
    presentAge: r.presentAge ?? "", lengthOfStay: r.lengthOfStay ?? "",
    referralSource: r.referralSource ?? "", referringAgencyPerson: r.referringAgencyPerson ?? "",
    dateColbRegistered: null, dateColbObtained: null,
    assignedSocialWorker: r.assignedSocialWorker ?? "",
    initialCaseAssessment: r.initialCaseAssessment ?? "",
    dateCaseStudyPrepared: null,
    reintegrationType: r.reintegrationType ?? "",
    reintegrationStatus: r.reintegrationStatus ?? "Not Started",
    initialRiskLevel: r.initialRiskLevel ?? "", currentRiskLevel: r.currentRiskLevel ?? "",
    dateEnrolled: r.dateEnrolled, dateClosed: r.dateClosed, notesRestricted: "",
  };
}

// ── modal ─────────────────────────────────────────────────────────────────────

type ModalProps = {
  token: string;
  editing: ResidentListItem | null;
  filters: ResidentFilterOptions | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
};

function ResidentModal({ token, editing, filters, onClose, onSaved, onDeleted }: ModalProps) {
  const [form, setForm] = useState<ResidentUpsertRequest>(
    editing ? residentToForm(editing) : { ...BLANK }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = (field: keyof ResidentUpsertRequest, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await apiUpdateResident(token, editing.residentId, form);
      } else {
        await apiCreateResident(token, form);
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
      await apiDeleteResident(token, editing.residentId);
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

  const SUB_CATS: [keyof ResidentUpsertRequest, string][] = [
    ["subCatOrphaned", "Orphaned"], ["subCatTrafficked", "Trafficked"],
    ["subCatChildLabor", "Child Labor"], ["subCatPhysicalAbuse", "Physical Abuse"],
    ["subCatSexualAbuse", "Sexual Abuse"], ["subCatOsaec", "OSAEC"],
    ["subCatCicl", "CICL"], ["subCatAtRisk", "At Risk"],
    ["subCatStreetChild", "Street Child"], ["subCatChildWithHiv", "Child w/ HIV"],
  ];

  const FAMILY_FLAGS: [keyof ResidentUpsertRequest, string][] = [
    ["familyIs4Ps", "4Ps Beneficiary"], ["familySoloParent", "Solo Parent"],
    ["familyIndigenous", "Indigenous Group"], ["familyParentPwd", "Parent with PWD"],
    ["familyInformalSettler", "Informal Settler"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
      <div className="bg-background w-full max-w-3xl border border-border shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-foreground">
            {editing ? `Edit Resident — ${editing.caseControlNo ?? editing.internalCode}` : "New Resident Record"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-2 divide-y divide-border">

          {/* Identifiers */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Identifiers</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4">
              <div><label className={labelCls}>Case Control No.</label>
                <input className={inputCls + " bg-secondary text-muted-foreground cursor-not-allowed"} value={form.caseControlNo ?? ""} readOnly /></div>
              <div><label className={labelCls}>Internal Code</label>
                <input className={inputCls + " bg-secondary text-muted-foreground cursor-not-allowed"} value={form.internalCode ?? ""} readOnly /></div>
              <div><label className={labelCls}>Safehouse ID</label>
                <select className={inputCls} value={form.safehouseId ?? ""} onChange={e => set("safehouseId", e.target.value ? Number(e.target.value) : null)}>
                  <option value="">— select —</option>
                  {(filters?.safehouseIds ?? []).map(id => <option key={id} value={id}>{id}</option>)}
                </select></div>
              <div><label className={labelCls}>Case Status</label>
                <select className={inputCls} value={form.caseStatus ?? ""} onChange={e => set("caseStatus", e.target.value)}>
                  {["Active", "Closed", "On Hold"].map(s => <option key={s}>{s}</option>)}
                </select></div>
            </div>
          </div>

          {/* Demographics */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Demographics</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4">
              <div><label className={labelCls}>Sex</label>
                <select className={inputCls} value={form.sex ?? ""} onChange={e => set("sex", e.target.value)}>
                  <option value="">— select —</option>
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                </select></div>
              <div><label className={labelCls}>Date of Birth</label>
                <input type="date" className={inputCls} value={form.dateOfBirth ?? ""} onChange={e => set("dateOfBirth", e.target.value || null)} /></div>
              <div><label className={labelCls}>Birth Status</label>
                <input className={inputCls} value={form.birthStatus ?? ""} onChange={e => set("birthStatus", e.target.value)} /></div>
              <div><label className={labelCls}>Place of Birth</label>
                <input className={inputCls} value={form.placeOfBirth ?? ""} onChange={e => set("placeOfBirth", e.target.value)} /></div>
              <div><label className={labelCls}>Religion</label>
                <input className={inputCls} value={form.religion ?? ""} onChange={e => set("religion", e.target.value)} /></div>
            </div>
          </div>

          {/* Case Category */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Case Category</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4 mb-4">
              <div><label className={labelCls}>Primary Category</label>
                <input className={inputCls} value={form.caseCategory ?? ""} onChange={e => set("caseCategory", e.target.value)} placeholder="e.g. Neglected, Trafficked" /></div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Sub-categories (check all that apply)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-3">
              {SUB_CATS.map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={!!form[field]} onChange={e => set(field, e.target.checked)} className="accent-accent" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Disability */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Disability / Special Needs</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer col-span-full md:col-span-1">
                <input type="checkbox" checked={form.isPwd} onChange={e => set("isPwd", e.target.checked)} className="accent-accent" />
                Person with Disability (PWD)
              </label>
              {form.isPwd && (
                <div><label className={labelCls}>PWD Type</label>
                  <input className={inputCls} value={form.pwdType ?? ""} onChange={e => set("pwdType", e.target.value || null)} /></div>
              )}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.hasSpecialNeeds} onChange={e => set("hasSpecialNeeds", e.target.checked)} className="accent-accent" />
                Has Special Needs
              </label>
              {form.hasSpecialNeeds && (
                <div><label className={labelCls}>Diagnosis</label>
                  <input className={inputCls} value={form.specialNeedsDiagnosis ?? ""} onChange={e => set("specialNeedsDiagnosis", e.target.value || null)} /></div>
              )}
            </div>
          </div>

          {/* Family Profile */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Family Socio-Demographic Profile</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-3">
              {FAMILY_FLAGS.map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={!!form[field]} onChange={e => set(field, e.target.checked)} className="accent-accent" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Admission */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Admission &amp; Referral</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4">
              <div><label className={labelCls}>Date of Admission</label>
                <input type="date" className={inputCls} value={form.dateOfAdmission ?? ""} onChange={e => set("dateOfAdmission", e.target.value || null)} /></div>
              <div><label className={labelCls}>Age Upon Admission</label>
                <input className={inputCls} value={form.ageUponAdmission ?? ""} onChange={e => set("ageUponAdmission", e.target.value)} /></div>
              <div><label className={labelCls}>Referral Source</label>
                <input className={inputCls} value={form.referralSource ?? ""} onChange={e => set("referralSource", e.target.value)} /></div>
              <div><label className={labelCls}>Referring Agency / Person</label>
                <input className={inputCls} value={form.referringAgencyPerson ?? ""} onChange={e => set("referringAgencyPerson", e.target.value)} /></div>
              <div><label className={labelCls}>Date COLB Registered</label>
                <input type="date" className={inputCls} value={form.dateColbRegistered ?? ""} onChange={e => set("dateColbRegistered", e.target.value || null)} /></div>
              <div><label className={labelCls}>Date COLB Obtained</label>
                <input type="date" className={inputCls} value={form.dateColbObtained ?? ""} onChange={e => set("dateColbObtained", e.target.value || null)} /></div>
            </div>
          </div>

          {/* Case Management */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Case Management</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4">
              <div><label className={labelCls}>Assigned Social Worker</label>
                <input className={inputCls} value={form.assignedSocialWorker ?? ""} onChange={e => set("assignedSocialWorker", e.target.value)} /></div>
              <div><label className={labelCls}>Initial Case Assessment</label>
                <input className={inputCls} value={form.initialCaseAssessment ?? ""} onChange={e => set("initialCaseAssessment", e.target.value)} /></div>
              <div><label className={labelCls}>Date Case Study Prepared</label>
                <input type="date" className={inputCls} value={form.dateCaseStudyPrepared ?? ""} onChange={e => set("dateCaseStudyPrepared", e.target.value || null)} /></div>
              <div><label className={labelCls}>Initial Risk Level</label>
                <select className={inputCls} value={form.initialRiskLevel ?? ""} onChange={e => set("initialRiskLevel", e.target.value)}>
                  <option value="">— select —</option>
                  {["Critical","High","Medium","Low"].map(l => <option key={l}>{l}</option>)}
                </select></div>
              <div><label className={labelCls}>Current Risk Level</label>
                <select className={inputCls} value={form.currentRiskLevel ?? ""} onChange={e => set("currentRiskLevel", e.target.value)}>
                  <option value="">— select —</option>
                  {["Critical","High","Medium","Low"].map(l => <option key={l}>{l}</option>)}
                </select></div>
            </div>
          </div>

          {/* Reintegration */}
          <div className={sectionCls}>
            <p className={sectionTitle}>Reintegration</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4">
              <div><label className={labelCls}>Reintegration Type</label>
                <input className={inputCls} value={form.reintegrationType ?? ""} onChange={e => set("reintegrationType", e.target.value)} /></div>
              <div><label className={labelCls}>Reintegration Status</label>
                <select className={inputCls} value={form.reintegrationStatus ?? ""} onChange={e => set("reintegrationStatus", e.target.value)}>
                  {["Not Started","In Progress","Completed","On Hold"].map(s => <option key={s}>{s}</option>)}
                </select></div>
              <div><label className={labelCls}>Date Enrolled</label>
                <input type="date" className={inputCls} value={form.dateEnrolled ?? ""} onChange={e => set("dateEnrolled", e.target.value || null)} /></div>
              <div><label className={labelCls}>Date Closed</label>
                <input type="date" className={inputCls} value={form.dateClosed ?? ""} onChange={e => set("dateClosed", e.target.value || null)} /></div>
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
              Deleting record <span className="font-medium text-foreground">{editing.caseControlNo ?? editing.internalCode ?? `#${editing.residentId}`}</span>. This cannot be undone.
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

const Caseload = () => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [residents, setResidents] = useState<ResidentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ResidentFilterOptions | null>(null);

  // filter state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSafehouse, setFilterSafehouse] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterReintegration, setFilterReintegration] = useState("");
  const [filterSW, setFilterSW] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ResidentListItem | null>(null);
  const [sort, setSort] = useState<{ key: keyof ResidentListItem | null; dir: "asc" | "desc" | "none" }>({ key: null, dir: "none" });

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResidents = useCallback(async (pg = 1) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiListResidents(token, {
        search: search || undefined,
        status: filterStatus || undefined,
        safehouseId: filterSafehouse ? Number(filterSafehouse) : undefined,
        category: filterCategory || undefined,
        reintegrationStatus: filterReintegration || undefined,
        socialWorker: filterSW || undefined,
        page: pg,
        pageSize: PAGE_SIZE,
      });
      setResidents(data.items);
      setTotal(data.total);
      setPage(pg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load residents");
    } finally {
      setLoading(false);
    }
  }, [token, search, filterStatus, filterSafehouse, filterCategory, filterReintegration, filterSW]);

  useEffect(() => {
    if (!token) return;
    apiGetResidentFilters(token).then(setFilters).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchResidents(1), 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [fetchResidents]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSaved = () => {
    setModalOpen(false);
    setEditing(null);
    fetchResidents(page);
  };

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (r: ResidentListItem) => { setEditing(r); setModalOpen(true); };

  const clearFilters = () => {
    setSearch(""); setFilterStatus(""); setFilterSafehouse("");
    setFilterCategory(""); setFilterReintegration(""); setFilterSW("");
  };

  const hasFilters = search || filterStatus || filterSafehouse || filterCategory || filterReintegration || filterSW;

  const cycleSort = (key: keyof ResidentListItem) => {
    setSort(prev => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      if (prev.dir === "desc") return { key: null, dir: "none" };
      return { key, dir: "asc" };
    });
  };

  const sortedResidents = sort.key && sort.dir !== "none"
    ? [...residents].sort((a, b) => {
        const av = a[sort.key!] ?? "";
        const bv = b[sort.key!] ?? "";
        const n = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sort.dir === "asc" ? n : -n;
      })
    : residents;

  const SortIcon = ({ col }: { col: keyof ResidentListItem }) => {
    if (sort.key !== col) return <ChevronsUpDown size={11} className="inline ml-1 opacity-40" />;
    if (sort.dir === "asc") return <ChevronUp size={11} className="inline ml-1" />;
    return <ChevronDown size={11} className="inline ml-1" />;
  };

  const thCls = "text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors";

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
          {t("navAdminDashboard")}
        </Link>

        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-4xl font-semibold text-foreground">{t("caseloadTitle")}</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              {t("caseloadSubtitle")}
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-accent text-accent-foreground hover:bg-gold-dark transition-colors shrink-0"
          >
            <Plus size={14} />
            {t("caseloadNewRecord")}
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="border border-border bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent w-56"
              placeholder={t("caseloadSearchPlaceholder")}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className={selectCls} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">{t("caseloadAllStatuses")}</option>
            {(filters?.statuses ?? []).map(s => <option key={s}>{s}</option>)}
          </select>

          <select className={selectCls} value={filterSafehouse} onChange={e => setFilterSafehouse(e.target.value)}>
            <option value="">{t("caseloadAllSafehouses")}</option>
            {(filters?.safehouseIds ?? []).map(id => <option key={id} value={id}>Safehouse {id}</option>)}
          </select>

          <select className={selectCls} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">{t("caseloadAllCategories")}</option>
            {(filters?.categories ?? []).map(c => <option key={c}>{c}</option>)}
          </select>

          <select className={selectCls} value={filterReintegration} onChange={e => setFilterReintegration(e.target.value)}>
            <option value="">{t("caseloadAllReintegration")}</option>
            {(filters?.reintegrationStatuses ?? []).map(s => <option key={s}>{s}</option>)}
          </select>

          <select className={selectCls} value={filterSW} onChange={e => setFilterSW(e.target.value)}>
            <option value="">{t("caseloadAllSocialWorkers")}</option>
            {(filters?.socialWorkers ?? []).map(sw => <option key={sw}>{sw}</option>)}
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X size={12} /> {t("caseloadClearFilters")}
            </button>
          )}
        </div>

        {/* Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading…" : `${total.toLocaleString()} resident${total !== 1 ? "s" : ""}`}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button
                onClick={() => fetchResidents(page - 1)}
                disabled={page <= 1 || loading}
                className="p-1 hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => fetchResidents(page + 1)}
                disabled={page >= totalPages || loading}
                className="p-1 hover:text-foreground disabled:opacity-40"
              >
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
                  <th className={`${thCls} w-[10%]`} onClick={() => cycleSort("caseControlNo")}>{t("caseloadCaseNo")}<SortIcon col="caseControlNo" /></th>
                  <th className={`${thCls} w-[8%]`} onClick={() => cycleSort("caseStatus")}>{t("caseloadStatus")}<SortIcon col="caseStatus" /></th>
                  <th className={`${thCls} w-[7%]`} onClick={() => cycleSort("safehouseId")}>SH<SortIcon col="safehouseId" /></th>
                  <th className={`${thCls} w-[13%]`} onClick={() => cycleSort("caseCategory")}>{t("caseloadCategory")}<SortIcon col="caseCategory" /></th>
                  <th className={`${thCls} w-[10%]`} onClick={() => cycleSort("dateOfAdmission")}>{t("caseloadAdmitted")}<SortIcon col="dateOfAdmission" /></th>
                  <th className={`${thCls} w-[10%]`} onClick={() => cycleSort("assignedSocialWorker")}>{t("caseloadSocialWorker")}<SortIcon col="assignedSocialWorker" /></th>
                  <th className={`${thCls} w-[14%]`} onClick={() => cycleSort("reintegrationStatus")}>{t("caseloadReintegration")}<SortIcon col="reintegrationStatus" /></th>
                  <th className={`${thCls} w-[9%]`} onClick={() => cycleSort("currentRiskLevel")}>{t("caseloadRisk")}<SortIcon col="currentRiskLevel" /></th>
                  <th className="w-[8%] px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {loading && residents.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center text-muted-foreground py-16">{t("caseloadLoading")}</td>
                  </tr>
                )}
                {!loading && residents.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center text-muted-foreground py-16">{t("caseloadNoRecordsFound")}</td>
                  </tr>
                )}
                {sortedResidents.map((r) => {
                  const subs = subcatLabels(r);
                  return (
                    <tr key={r.residentId} className="border-b border-border hover:bg-secondary/20 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="font-mono text-xs text-foreground truncate">{r.caseControlNo ?? "—"}</div>
                        <div className="font-mono text-xs text-muted-foreground truncate">{r.internalCode ?? ""}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge value={r.caseStatus} colorMap={STATUS_COLOR} />
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {r.safehouseId ? `SH-${r.safehouseId}` : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="text-xs text-foreground truncate">{r.caseCategory ?? "—"}</div>
                        {subs.length > 0 && (
                          <div className="text-xs text-muted-foreground truncate">{subs.join(", ")}</div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{r.dateOfAdmission ?? "—"}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground truncate">{r.assignedSocialWorker ?? "—"}</td>
                      <td className="px-3 py-2.5">
                        <div className="text-xs text-muted-foreground truncate">{r.reintegrationType ?? ""}</div>
                        <div className="text-xs font-medium text-foreground">{r.reintegrationStatus ?? "—"}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge value={r.currentRiskLevel} colorMap={RISK_COLOR} />
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-3 mt-6 text-xs text-muted-foreground">
            <button onClick={() => fetchResidents(page - 1)} disabled={page <= 1} className="p-1.5 border border-border hover:bg-secondary disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => fetchResidents(page + 1)} disabled={page >= totalPages} className="p-1.5 border border-border hover:bg-secondary disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        )}

      </div>

      {modalOpen && token && (
        <ResidentModal
          token={token}
          editing={editing}
          filters={filters}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSaved={handleSaved}
          onDeleted={() => { setModalOpen(false); setEditing(null); fetchResidents(page); }}
        />
      )}
    </Layout>
  );
};

export default Caseload;
