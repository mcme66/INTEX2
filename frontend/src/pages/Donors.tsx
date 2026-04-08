import { useState, useEffect } from "react";
import { Search, Plus, X, Trash2, Loader2, ArrowLeft, Pencil, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/state/auth";

interface Contribution {
  donationId: number;
  donationDate: string;
  donationType: string;
  amount?: number;
  estimatedValue?: number;
  notes: string;
  programArea: string;
}

interface Donor {
  supporterId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  supporterType: string;
  status: string;
  totalGiven: number;
  contributions: Contribution[];
}

const DONOR_TYPE_LABELS: Record<string, string> = {
  MonetaryDonor: "Monetary",
  Volunteer: "Volunteer",
  SkillsContributor: "Skills/Services",
  InKindDonor: "In-Kind",
  SocialMediaAdvocate: "Advocacy",
  PartnerOrganization: "Partner",
};

const ALLOCATIONS = [
  "Education Program",
  "Wellbeing",
  "Operations",
  "Transport",
  "Maintenance",
  "Outreach",
  "General",
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5180";
const STATUS_COLOR: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Inactive: "bg-secondary text-muted-foreground",
};

function donorDisplayName(donor: Pick<Donor, "firstName" | "lastName" | "email">) {
  const name = `${donor.firstName ?? ""} ${donor.lastName ?? ""}`.trim();
  return name || donor.email || "Unnamed supporter";
}

const Donors = () => {
  const { user, token } = useAuth();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // Modals state
  const [isDonorFormOpen, setIsDonorFormOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Partial<Donor> | null>(null);
  const [donorFormError, setDonorFormError] = useState<string | null>(null);
  const [isDonationFormOpen, setIsDonationFormOpen] = useState(false);
  const [donationError, setDonationError] = useState<string | null>(null);
  const [newDonation, setNewDonation] = useState<Partial<Contribution>>({ donationType: "Monetary", programArea: "General" });
  const [confirmDeleteDonor, setConfirmDeleteDonor] = useState(false);
  const [deletingDonor, setDeletingDonor] = useState(false);

  const canManageDonors = !!user?.isAdmin;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token || ""}`,
  };
  const selectCls = "border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent";
  const inputCls = "w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent";
  const labelCls = "block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide";

  const fetchDonors = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${API_URL}/api/supporters`, { headers: authHeaders });
      if (!res.ok) {
        const message =
          res.status === 401
            ? "Your admin session is not valid. Please sign in again."
            : `Unable to load supporters (${res.status}).`;
        setDonors([]);
        setLoadError(message);
        return;
      }

      setDonors(await res.json());
    } catch (e) {
      console.error(e);
      setDonors([]);
      setLoadError("Could not reach the API. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (canManageDonors && token) fetchDonors();
    else if (canManageDonors) {
      setDonors([]);
      setLoadError("Your admin session is missing a token. Please sign in again.");
      setIsLoading(false);
    }
    else setIsLoading(false); // Handle non-admin mock mode later if needed
  }, [canManageDonors, token]);

  const filtered = donors.filter((d) => {
    const name = donorDisplayName(d).toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || d.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || d.supporterType === typeFilter;
    const matchesStatus = statusFilter === "all" || d.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Allocation summary
  const allocationSummary = donors.flatMap((d) => d.contributions).reduce<Record<string, number>>((acc, c) => {
    const key = c.programArea || "General";
    acc[key] = (acc[key] || 0) + (c.amount || 0);
    return acc;
  }, {});

  const handleSaveDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    setDonorFormError(null);
    try {
      const method = editingDonor?.supporterId ? "PUT" : "POST";
      const url = editingDonor?.supporterId ? `${API_URL}/api/supporters/${editingDonor.supporterId}` : `${API_URL}/api/supporters`;
      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(editingDonor),
      });
      if (res.ok) {
        setIsDonorFormOpen(false);
        fetchDonors();
      } else {
        const body = await res.json().catch(() => ({})) as { message?: string };
        setDonorFormError(body.message ?? `Save failed (${res.status})`);
      }
    } catch {
      setDonorFormError("Could not reach the API. Make sure the backend is running.");
    }
  };

  const handleDeleteDonor = async (id: number) => {
    setDeletingDonor(true);
    try {
      const res = await fetch(`${API_URL}/api/supporters/${id}`, { method: "DELETE", headers: authHeaders });
      if (res.ok) {
        setSelectedDonor(null);
        setIsDonorFormOpen(false);
        setConfirmDeleteDonor(false);
        fetchDonors();
      } else {
        const body = await res.json().catch(() => ({})) as { message?: string };
        setDonorFormError(body.message ?? `Delete failed (${res.status})`);
        setConfirmDeleteDonor(false);
      }
    } catch {
      setDonorFormError("Could not reach the API. Make sure the backend is running.");
      setConfirmDeleteDonor(false);
    } finally {
      setDeletingDonor(false);
    }
  };

  const handleSaveDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonor) return;
    setDonationError(null);
    try {
      const res = await fetch(`${API_URL}/api/supporters/${selectedDonor.supporterId}/donations`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(newDonation),
      });
      if (res.ok) {
        setIsDonationFormOpen(false);
        setNewDonation({ donationType: "Monetary", programArea: "General" });
        fetchDonors();
        const updatedDonors = await (await fetch(`${API_URL}/api/supporters`, { headers: authHeaders })).json() as Donor[];
        setDonors(updatedDonors);
        setSelectedDonor(updatedDonors.find((d: Donor) => d.supporterId === selectedDonor.supporterId) ?? null);
      } else {
        const body = await res.json().catch(() => ({})) as { message?: string };
        setDonationError(body.message ?? `Save failed (${res.status})`);
      }
    } catch {
      setDonationError("Could not reach the API. Make sure the backend is running.");
    }
  };

  const openNew = () => {
    setEditingDonor({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      status: "Active",
      supporterType: "MonetaryDonor",
    });
    setDonorFormError(null);
    setIsDonorFormOpen(true);
  };

  const openEdit = (donor: Donor) => {
    setEditingDonor(donor);
    setDonorFormError(null);
    setIsDonorFormOpen(true);
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const hasFilters = search || typeFilter !== "all" || statusFilter !== "all";

  const [sort, setSort] = useState<{ key: keyof Donor | null; dir: "asc" | "desc" | "none" }>({ key: null, dir: "none" });

  const cycleSort = (key: keyof Donor) => {
    setSort(prev => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      if (prev.dir === "desc") return { key: null, dir: "none" };
      return { key, dir: "asc" };
    });
  };

  const base = canManageDonors ? filtered : donors;
  const donorRows = sort.key && sort.dir !== "none"
    ? [...base].sort((a, b) => {
        const av = a[sort.key!] ?? "";
        const bv = b[sort.key!] ?? "";
        const n = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sort.dir === "asc" ? n : -n;
      })
    : base;

  const SortIcon = ({ col }: { col: keyof Donor }) => {
    if (sort.key !== col) return <ChevronsUpDown size={11} className="inline ml-1 opacity-40" />;
    if (sort.dir === "asc") return <ChevronUp size={11} className="inline ml-1" />;
    return <ChevronDown size={11} className="inline ml-1" />;
  };

  const thCls = "px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors";

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        {canManageDonors && (
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={13} />
            Admin Dashboard
          </Link>
        )}

        <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-4xl font-semibold text-foreground">Donors & Contributions</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              {canManageDonors
                ? "Manage supporter records, giving history, and donation allocation details."
                : "A stewardship-first view of where support is going and how the work is sustained."}
            </p>
          </div>
          {canManageDonors ? (
            <button
              onClick={openNew}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-accent text-accent-foreground hover:bg-gold-dark transition-colors shrink-0"
            >
              <Plus size={14} />
              Add Supporter
            </button>
          ) : (
            <Link
              to={user ? "/donor" : "/login"}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-accent text-accent-foreground hover:bg-gold-dark transition-colors shrink-0"
            >
              {user ? "Open donor dashboard" : "Staff login"}
            </Link>
          )}
        </div>

        {/* Allocation Summary */}
        <div className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Donation Allocations
          </h2>
          <div className="flex flex-wrap gap-3">
            {ALLOCATIONS.filter((a) => (allocationSummary[a] || 0) > 0).map((a) => (
              <div key={a} className="flex-1 min-w-0 border border-border p-4">
                <div className="text-sm text-muted-foreground mb-1 whitespace-nowrap">{a}</div>
                <div className="font-heading text-xl font-semibold text-foreground">
                  ${(allocationSummary[a] || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {canManageDonors ? (
          <>
            {loadError && (
              <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {loadError}
              </div>
            )}
            <div className="mb-6 flex flex-wrap gap-3 items-center">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="border border-border bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent w-56"
                  placeholder="Search name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select className={selectCls} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All supporter types</option>
                {Object.entries(DONOR_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>

              <select className={selectCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <X size={12} /> Clear filters
                </button>
              )}
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Loading..." : `${filtered.length.toLocaleString()} supporter${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </>
        ) : (
          <div className="mb-6 border border-border bg-secondary/60 p-6">
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Detailed supporter management remains restricted to admin users. This public-facing
              version keeps the same design language while exposing only high-level stewardship
              summaries.
            </p>
          </div>
        )}

        {/* Donors Table */}
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className={`text-left ${thCls} w-[28%]`} onClick={() => cycleSort("lastName")}>Supporter<SortIcon col="lastName" /></th>
                <th className={`text-left ${thCls} w-[18%]`} onClick={() => cycleSort("supporterType")}>Type<SortIcon col="supporterType" /></th>
                <th className={`text-left ${thCls} w-[12%]`} onClick={() => cycleSort("status")}>Status<SortIcon col="status" /></th>
                <th className={`text-left ${thCls} w-[16%]`} onClick={() => cycleSort("phone")}>Phone<SortIcon col="phone" /></th>
                <th className={`text-right ${thCls} w-[16%]`} onClick={() => cycleSort("totalGiven")}>Total Given<SortIcon col="totalGiven" /></th>
                <th className="w-[10%] px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading supporters...
                  </td>
                </tr>
              ) : donorRows.map((donor) => (
                <tr key={donor.supporterId} className="border-b border-border hover:bg-secondary/20 transition-colors">
                  <td className="px-3 py-2.5">
                    <button type="button" onClick={() => canManageDonors && setSelectedDonor(donor)} className="text-left w-full">
                      <div className="font-medium text-foreground truncate">{donorDisplayName(donor)}</div>
                      <div className="text-xs text-muted-foreground truncate">{donor.email || "No email on file"}</div>
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    <span className="inline-block px-2 py-0.5 border border-border bg-background">{DONOR_TYPE_LABELS[donor.supporterType] || donor.supporterType || "-"}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${STATUS_COLOR[donor.status] ?? "bg-secondary text-muted-foreground"}`}>
                      {donor.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground truncate">{donor.phone || "-"}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-foreground">
                    {donor.totalGiven > 0 ? `$${donor.totalGiven.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {canManageDonors && (
                      <button
                        type="button"
                        onClick={() => openEdit(donor)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={`Edit ${donorDisplayName(donor)}`}
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && donorRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No supporters found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Donor Detail Slide-over */}
        {canManageDonors && selectedDonor && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-foreground/20" onClick={() => setSelectedDonor(null)} />
            <div className="relative bg-background w-full max-w-lg border-l border-border overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="font-heading text-2xl font-semibold text-foreground">{donorDisplayName(selectedDonor)}</h2>
                    <span className={`text-xs font-medium ${selectedDonor.status.toLowerCase() === "active" ? "text-green-700" : "text-muted-foreground"}`}>
                      {selectedDonor.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(selectedDonor)} className="text-muted-foreground hover:text-foreground p-1">
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteDonor(selectedDonor.supporterId)} 
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button onClick={() => setSelectedDonor(null)} className="text-muted-foreground hover:text-foreground p-1 ml-2">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Type</label>
                    <p className="text-sm text-foreground mt-0.5">{DONOR_TYPE_LABELS[selectedDonor.supporterType] || selectedDonor.supporterType}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
                    <p className="text-sm text-foreground mt-0.5">{selectedDonor.email || "-"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Phone</label>
                    <p className="text-sm text-foreground mt-0.5">{selectedDonor.phone || "-"}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Contribution History
                  </h3>
                  <button 
                    onClick={() => setIsDonationFormOpen(!isDonationFormOpen)}
                    className="text-xs flex items-center gap-1 font-medium text-accent-foreground hover:text-gold-dark"
                  >
                    <Plus size={14} /> Log Contribution
                  </button>
                </div>

                {isDonationFormOpen && (
                  <form onSubmit={handleSaveDonation} className="bg-secondary/50 border border-border p-4 mb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Type</label>
                        <select className="w-full text-sm border p-1.5" required value={newDonation.donationType} onChange={e => setNewDonation({...newDonation, donationType: e.target.value})}>
                          <option value="Monetary">Monetary</option>
                          <option value="InKind">In-Kind</option>
                          <option value="Time">Time / Volunteer</option>
                          <option value="Skills">Skills</option>
                          <option value="SocialMedia">Social Media</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium">Date</label>
                        <input type="date" required className="w-full text-sm border p-1.5" value={newDonation.donationDate || ''} onChange={e => setNewDonation({...newDonation, donationDate: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Amount/Value ($)</label>
                        <input type="number" step="0.01" className="w-full text-sm border p-1.5" value={newDonation.amount || ''} onChange={e => setNewDonation({...newDonation, amount: e.target.value ? parseFloat(e.target.value) : undefined})} />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Program Area</label>
                        <select className="w-full text-sm border p-1.5" value={newDonation.programArea} onChange={e => setNewDonation({...newDonation, programArea: e.target.value})}>
                          {ALLOCATIONS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Notes / Description</label>
                      <input type="text" required className="w-full text-sm border p-1.5" value={newDonation.notes || ''} onChange={e => setNewDonation({...newDonation, notes: e.target.value})} />
                    </div>
                    {donationError && (
                      <p className="text-xs text-red-600">{donationError}</p>
                    )}
                    <div className="flex gap-2 justify-end pt-2">
                      <button type="button" onClick={() => setIsDonationFormOpen(false)} className="text-xs px-3 py-1.5 border border-border">Cancel</button>
                      <button type="submit" className="text-xs px-3 py-1.5 bg-accent text-accent-foreground font-medium">Save</button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {selectedDonor.contributions.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No contributions recorded.</p>
                  )}
                  {selectedDonor.contributions.map((c, idx) => (
                    <div key={c.donationId || idx} className="border border-border p-4">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-foreground">{c.notes}</span>
                        <span className="text-xs text-muted-foreground">{c.donationDate?.split('T')[0]}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>{c.donationType}</span>
                        {c.amount && <span>${c.amount.toLocaleString()}</span>}
                        <span>{c.programArea}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Donor Modal */}
        {isDonorFormOpen && editingDonor && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setIsDonorFormOpen(false)} />
            <div className="relative bg-background w-full max-w-lg border border-border p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <h2 className="font-heading font-semibold text-foreground">
                  {editingDonor.supporterId ? "Edit Supporter" : "New Supporter Record"}
                </h2>
                <button onClick={() => setIsDonorFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSaveDonor} className="space-y-5">
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-2 border-b border-border">Supporter Details</p>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                    <div>
                      <label className={labelCls}>First Name</label>
                      <input className={inputCls}
                        value={editingDonor.firstName || ''} onChange={e => setEditingDonor({...editingDonor, firstName: e.target.value})} />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name</label>
                      <input className={inputCls}
                        value={editingDonor.lastName || ''} onChange={e => setEditingDonor({...editingDonor, lastName: e.target.value})} />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" className={inputCls}
                        value={editingDonor.email || ''} onChange={e => setEditingDonor({...editingDonor, email: e.target.value})} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input type="text" className={inputCls}
                        value={editingDonor.phone || ''} onChange={e => setEditingDonor({...editingDonor, phone: e.target.value})} />
                    </div>
                    <div>
                      <label className={labelCls}>Supporter Type</label>
                      <select className={inputCls}
                        value={editingDonor.supporterType || "MonetaryDonor"} onChange={e => setEditingDonor({...editingDonor, supporterType: e.target.value})}>
                        {Object.entries(DONOR_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <select className={inputCls}
                        value={editingDonor.status || "Active"} onChange={e => setEditingDonor({...editingDonor, status: e.target.value})}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                {donorFormError && (
                  <p className="text-sm text-red-600 mb-2">{donorFormError}</p>
                )}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                  <div>
                    {editingDonor?.supporterId && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteDonor(true)}
                        className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete Supporter
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsDonorFormOpen(false)} className="px-4 py-2 text-sm border border-border hover:bg-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm bg-accent text-accent-foreground font-semibold hover:bg-gold-dark">
                      Save Supporter
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        {confirmDeleteDonor && editingDonor?.supporterId && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
            <div className="bg-background border border-border p-6 w-full max-w-sm shadow-xl">
              <h3 className="font-heading font-semibold text-foreground mb-2">Delete Supporter</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Deleting supporter <span className="font-medium text-foreground">{`${editingDonor.firstName ?? ""} ${editingDonor.lastName ?? ""}`.trim() || editingDonor.email || `#${editingDonor.supporterId}`}</span> and all their contributions. This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDeleteDonor(false)}
                  className="text-sm px-4 py-2 border border-border hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteDonor(editingDonor.supporterId!)}
                  disabled={deletingDonor}
                  className="text-sm font-medium px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deletingDonor ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Donors;
