import { useState } from "react";
import { Search, Plus, Filter, ChevronDown, X } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/state/auth";

type DonorType = "monetary" | "volunteer" | "skills" | "in-kind" | "advocacy";
type DonorStatus = "active" | "inactive";

interface Contribution {
  id: string;
  date: string;
  type: DonorType;
  amount?: number;
  hours?: number;
  description: string;
  allocation: string;
}

interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: DonorType;
  status: DonorStatus;
  notes: string;
  totalGiven: number;
  contributions: Contribution[];
}

const DONOR_TYPE_LABELS: Record<DonorType, string> = {
  monetary: "Monetary",
  volunteer: "Volunteer",
  skills: "Skills/Services",
  "in-kind": "In-Kind",
  advocacy: "Advocacy",
};

const ALLOCATIONS = [
  "Bogotá Safe House",
  "Medellín Safe House",
  "Cali Safe House",
  "Cartagena Safe House",
  "Education Program",
  "Trauma Recovery",
  "Vocational Training",
  "General Fund",
];

// Sample data
const SAMPLE_DONORS: Donor[] = [
  {
    id: "1", name: "María González", email: "maria@example.com", phone: "+57 300 123 4567",
    type: "monetary", status: "active", notes: "Monthly recurring donor since 2022",
    totalGiven: 14400,
    contributions: [
      { id: "c1", date: "2024-03-01", type: "monetary", amount: 200, description: "Monthly donation", allocation: "Bogotá Safe House" },
      { id: "c2", date: "2024-02-01", type: "monetary", amount: 200, description: "Monthly donation", allocation: "Bogotá Safe House" },
    ],
  },
  {
    id: "2", name: "James Carter", email: "james@example.com", phone: "+1 555 987 6543",
    type: "volunteer", status: "active", notes: "Licensed therapist, remote sessions weekly",
    totalGiven: 0,
    contributions: [
      { id: "c3", date: "2024-03-15", type: "volunteer", hours: 12, description: "Trauma counseling sessions", allocation: "Trauma Recovery" },
    ],
  },
  {
    id: "3", name: "Fundación Esperanza", email: "contact@esperanza.org", phone: "+57 601 234 5678",
    type: "in-kind", status: "active", notes: "Provides school supplies quarterly",
    totalGiven: 8500,
    contributions: [
      { id: "c4", date: "2024-01-10", type: "in-kind", amount: 3200, description: "School supplies and backpacks (200 units)", allocation: "Education Program" },
    ],
  },
  {
    id: "4", name: "Sarah Kim", email: "sarah.kim@design.co", phone: "+1 555 111 2222",
    type: "skills", status: "inactive", notes: "Designed branding materials in 2023",
    totalGiven: 0,
    contributions: [
      { id: "c5", date: "2023-09-01", type: "skills", hours: 40, description: "Brand identity and print materials", allocation: "General Fund" },
    ],
  },
  {
    id: "5", name: "Carlos Medina", email: "carlos.m@gmail.com", phone: "+57 310 555 6789",
    type: "advocacy", status: "active", notes: "Social media ambassador, 15k followers",
    totalGiven: 500,
    contributions: [
      { id: "c6", date: "2024-02-14", type: "advocacy", description: "Awareness campaign - reached 45k impressions", allocation: "General Fund" },
      { id: "c7", date: "2024-03-01", type: "monetary", amount: 500, description: "One-time donation", allocation: "General Fund" },
    ],
  },
];

const Donors = () => {
  const { user } = useAuth();
  const [donors] = useState<Donor[]>(SAMPLE_DONORS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DonorType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DonorStatus | "all">("all");
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = donors.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || d.type === typeFilter;
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Allocation summary
  const allocationSummary = donors.flatMap((d) => d.contributions).reduce<Record<string, number>>((acc, c) => {
    const key = c.allocation;
    acc[key] = (acc[key] || 0) + (c.amount || 0);
    return acc;
  }, {});

  const canManageDonors = !!user?.isAdmin;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-foreground">Donors & Contributions</h1>
            <p className="text-muted-foreground mt-1">
              {canManageDonors
                ? "Manage supporter profiles and track all contributions."
                : "A stewardship-first view of where support is going and how the work is sustained."}
            </p>
          </div>
          {canManageDonors ? (
            <button className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold hover:bg-gold-dark transition-colors self-start">
              <Plus size={16} /> Add Supporter
            </button>
          ) : (
            <Link
              to={user ? "/donor" : "/login"}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold hover:bg-gold-dark transition-colors self-start"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ALLOCATIONS.map((a) => (
              <div key={a} className="border border-border p-4">
                <div className="text-sm text-muted-foreground mb-1">{a}</div>
                <div className="font-heading text-xl font-semibold text-foreground">
                  ${(allocationSummary[a] || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {canManageDonors ? (
          <>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Filter size={14} /> Filters <ChevronDown size={14} />
              </button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-3 mb-6 p-4 bg-secondary border border-border">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as DonorType | "all")}
                  className="text-sm border border-border bg-background text-foreground px-3 py-2 focus:outline-none"
                >
                  <option value="all">All Types</option>
                  {Object.entries(DONOR_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as DonorStatus | "all")}
                  className="text-sm border border-border bg-background text-foreground px-3 py-2 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden lg:table-cell">Email</th>
              </tr>
            </thead>
            <tbody>
              {(canManageDonors ? filtered : donors).map((donor) => (
                <tr
                  key={donor.id}
                  onClick={() => canManageDonors && setSelectedDonor(donor)}
                  className={`border-b border-border transition-colors ${canManageDonors ? "hover:bg-secondary/50 cursor-pointer" : ""}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{donor.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    <span className="text-xs px-2 py-0.5 border border-border bg-background">{DONOR_TYPE_LABELS[donor.type]}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs font-medium ${donor.status === "active" ? "text-green-700" : "text-muted-foreground"}`}>
                      {donor.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {donor.totalGiven > 0 ? `$${donor.totalGiven.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{donor.email}</td>
                </tr>
              ))}
              {canManageDonors && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
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
                    <h2 className="font-heading text-2xl font-semibold text-foreground">{selectedDonor.name}</h2>
                    <span className={`text-xs font-medium ${selectedDonor.status === "active" ? "text-green-700" : "text-muted-foreground"}`}>
                      {selectedDonor.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <button onClick={() => setSelectedDonor(null)} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Type</label>
                    <p className="text-sm text-foreground mt-0.5">{DONOR_TYPE_LABELS[selectedDonor.type]}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
                    <p className="text-sm text-foreground mt-0.5">{selectedDonor.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Phone</label>
                    <p className="text-sm text-foreground mt-0.5">{selectedDonor.phone}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Notes</label>
                    <p className="text-sm text-muted-foreground mt-0.5">{selectedDonor.notes}</p>
                  </div>
                </div>

                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Contribution History
                </h3>
                <div className="space-y-3">
                  {selectedDonor.contributions.map((c) => (
                    <div key={c.id} className="border border-border p-4">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-foreground">{c.description}</span>
                        <span className="text-xs text-muted-foreground">{c.date}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>{DONOR_TYPE_LABELS[c.type]}</span>
                        {c.amount && <span>${c.amount.toLocaleString()}</span>}
                        {c.hours && <span>{c.hours} hrs</span>}
                        <span>→ {c.allocation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Donors;
