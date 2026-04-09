import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, X, Pencil, Trash2, Loader2, ArrowLeft, ChevronsUpDown, ChevronUp, ChevronDown, Eye, EyeOff, KeyRound } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/state/auth";

interface StaffUser {
  id: string;
  firstName: string;
  email: string;
  username: string;
  isDonor: boolean;
  isAdmin: boolean;
  createdAtUtc: string;
  donationCount: number;
  totalDonations: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5180";

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-accent/20 text-accent-foreground border border-accent/30",
  donor: "bg-secondary text-muted-foreground border border-border",
};

const Staff = () => {
  const { token, user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "donor">("all");

  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StaffUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit modal lock
  const [editUnlocked, setEditUnlocked] = useState(false);
  const [editAdminCode, setEditAdminCode] = useState("");
  const [showEditAdminCode, setShowEditAdminCode] = useState(false);
  const [editCodeError, setEditCodeError] = useState<string | null>(null);
  const [editCodeVerifying, setEditCodeVerifying] = useState(false);

  // Reset password flow
  const [resetTarget, setResetTarget] = useState<StaffUser | null>(null);
  const [resetStep, setResetStep] = useState<"code" | "password">("code");
  const [resetAdminCode, setResetAdminCode] = useState("");
  const [showResetAdminCode, setShowResetAdminCode] = useState(false);
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSaving, setResetSaving] = useState(false);

  const [sort, setSort] = useState<{ key: keyof StaffUser | null; dir: "asc" | "desc" | "none" }>({ key: null, dir: "none" });

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token ?? ""}`,
  };

  const fetchUsers = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${API_URL}/api/staff`, { headers: authHeaders });
      if (!res.ok) {
        setLoadError(`Unable to load users (${res.status}).`);
        return;
      }
      setUsers(await res.json());
    } catch {
      setLoadError("Could not reach the API. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [token]);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && u.isAdmin) ||
      (roleFilter === "donor" && u.isDonor && !u.isAdmin);
    return matchesSearch && matchesRole;
  });

  const cycleSort = (key: keyof StaffUser) => {
    setSort(prev => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return { key: null, dir: "none" };
    });
  };

  const rows = sort.key && sort.dir !== "none"
    ? [...filtered].sort((a, b) => {
        const av = a[sort.key!] ?? "";
        const bv = b[sort.key!] ?? "";
        const n = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : typeof av === "boolean" && typeof bv === "boolean"
            ? Number(av) - Number(bv)
            : String(av).localeCompare(String(bv));
        return sort.dir === "asc" ? n : -n;
      })
    : filtered;

  const SortIcon = ({ col }: { col: keyof StaffUser }) => {
    if (sort.key !== col) return <ChevronsUpDown size={11} className="inline ml-1 opacity-40" />;
    if (sort.dir === "asc") return <ChevronUp size={11} className="inline ml-1" />;
    return <ChevronDown size={11} className="inline ml-1" />;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setFormError(null);
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/staff/${editing.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          firstName: editing.firstName,
          email: editing.email,
          username: editing.username,
          isDonor: editing.isDonor,
          isAdmin: editing.isAdmin,
        }),
      });
      if (res.ok) {
        setEditing(null);
        fetchUsers();
      } else {
        const body = await res.json().catch(() => ({})) as { message?: string };
        setFormError(body.message ?? `Save failed (${res.status})`);
      }
    } catch {
      setFormError("Could not reach the API.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/staff/${confirmDelete.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        setConfirmDelete(null);
        setEditing(null);
        if (currentUser && confirmDelete.id === currentUser.id.toString()) {
          logout();
          return;
        }
        fetchUsers();
      } else {
        const body = await res.json().catch(() => ({})) as { message?: string };
        setFormError(body.message ?? `Delete failed (${res.status})`);
        setConfirmDelete(null);
      }
    } catch {
      setFormError("Could not reach the API.");
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const openEditing = (u: StaffUser) => {
    setEditing({ ...u });
    setFormError(null);
    setEditUnlocked(false);
    setEditAdminCode("");
    setShowEditAdminCode(false);
    setEditCodeError(null);
  };

  const handleEditCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditCodeError(null);
    if (!editAdminCode.trim()) {
      setEditCodeError("Please enter your admin code.");
      return;
    }
    setEditCodeVerifying(true);
    try {
      const res = await fetch(`${API_URL}/api/staff/verify-admin-code`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ adminCode: editAdminCode }),
      });
      if (res.ok) {
        setEditUnlocked(true);
      } else {
        const body = await res.json().catch(() => ({})) as { message?: string };
        setEditCodeError(body.message ?? "Invalid admin code.");
      }
    } catch {
      setEditCodeError("Could not reach the API.");
    } finally {
      setEditCodeVerifying(false);
    }
  };

  const openResetPassword = (user: StaffUser) => {
    setResetTarget(user);
    setResetStep("password");
    setResetAdminCode(editAdminCode);
    setShowResetAdminCode(false);
    setResetNewPassword("");
    setResetConfirmPassword("");
    setResetError(null);
    setShowResetPassword(false);
    setShowResetConfirm(false);
  };

  const handleResetCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (!resetAdminCode.trim()) {
      setResetError("Please enter your admin code.");
      return;
    }
    setResetSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/staff/verify-admin-code`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ adminCode: resetAdminCode }),
      });
      if (res.ok) {
        setResetStep("password");
      } else {
        const body = await res.json().catch(() => ({})) as { message?: string };
        setResetError(body.message ?? "Invalid admin code.");
      }
    } catch {
      setResetError("Could not reach the API.");
    } finally {
      setResetSaving(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (resetNewPassword.length < 14) {
      setResetError("Password must be at least 14 characters.");
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/staff/${resetTarget!.id}/reset-password`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ adminCode: resetAdminCode, newPassword: resetNewPassword }),
      });
      if (res.ok) {
        setResetTarget(null);
      } else {
        const body = await res.json().catch(() => ({})) as { message?: string };
        setResetError(body.message ?? `Reset failed (${res.status})`);
        // If admin code was wrong, go back to code step
        if (res.status === 400 && body.message?.toLowerCase().includes("admin code")) {
          setResetStep("code");
        }
      }
    } catch {
      setResetError("Could not reach the API.");
    } finally {
      setResetSaving(false);
    }
  };

  const thCls = "px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap";
  const inputCls = "w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent";
  const labelCls = "block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide";
  const selectCls = "border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={13} />
          Admin Dashboard
        </Link>

        <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-4xl font-semibold text-foreground">Staff & User Management</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              View, edit, and manage all registered users and admin accounts.
            </p>
          </div>
        </div>

        {loadError && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="border border-border bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent w-56"
              placeholder="Search name, email, username…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className={selectCls} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="donor">Donor</option>
          </select>
          {(search || roleFilter !== "all") && (
            <button
              onClick={() => { setSearch(""); setRoleFilter("all"); }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        <div className="mb-4">
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading…" : `${rows.length.toLocaleString()} user${rows.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Table */}
        <div className="border border-border overflow-x-auto bg-background">
          <table className="w-full text-sm table-fixed min-w-[980px]">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className={`text-left ${thCls} w-[14%]`} onClick={() => cycleSort("firstName")}>Name <SortIcon col="firstName" /></th>
                <th className={`text-left ${thCls} w-[22%]`} onClick={() => cycleSort("email")}>Email <SortIcon col="email" /></th>
                <th className={`text-left ${thCls} w-[15%]`} onClick={() => cycleSort("username")}>Username <SortIcon col="username" /></th>
                <th className={`text-left ${thCls} w-[10%]`}>Roles</th>
                <th className={`text-left ${thCls} w-[11%]`} onClick={() => cycleSort("createdAtUtc")}>Joined <SortIcon col="createdAtUtc" /></th>
                <th className={`text-right ${thCls} w-[11%] whitespace-nowrap`} onClick={() => cycleSort("donationCount")}># Donations <SortIcon col="donationCount" /></th>
                <th className={`text-right ${thCls} w-[12%] whitespace-nowrap`} onClick={() => cycleSort("totalDonations")}>Total Given <SortIcon col="totalDonations" /></th>
                <th className="w-[5%] px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading users…
                  </td>
                </tr>
              ) : rows.map((u) => (
                <tr key={u.id} className="border-b border-border hover:bg-secondary transition-colors">
                  <td className="px-3 py-2.5 font-medium text-foreground truncate">{u.firstName}</td>
                  <td className="px-3 py-2.5 text-muted-foreground truncate">{u.email}</td>
                  <td className="px-3 py-2.5 text-muted-foreground truncate">{u.username}</td>
                  <td className="px-3 py-2.5">
                    {u.isAdmin && <span className={`text-xs px-2 py-0.5 ${ROLE_BADGE.admin}`}>Admin</span>}
                    {!u.isAdmin && <span className={`text-xs px-2 py-0.5 ${ROLE_BADGE.donor}`}>Donor</span>}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    {new Date(u.createdAtUtc).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">
                    {u.donationCount > 0 ? u.donationCount.toLocaleString() : <span className="opacity-40">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">
                    {u.totalDonations > 0 ? `$${Math.round(u.totalDonations).toLocaleString()}` : <span className="opacity-40">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => openEditing(u)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setEditing(null)} />
            <div className="relative bg-background w-full max-w-lg border border-border p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
                  {editUnlocked ? (
                    <>Edit User</>
                  ) : (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <KeyRound size={15} />
                      Edit User
                      <span className="text-xs font-normal border border-border px-2 py-0.5 ml-1">Locked</span>
                    </span>
                  )}
                </h2>
                <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              {!editUnlocked ? (
                <form onSubmit={handleEditCodeSubmit} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your admin code to unlock editing for <span className="font-medium text-foreground">{editing.firstName}</span>.
                  </p>
                  <div>
                    <label className={labelCls}>Admin Code</label>
                    <div className="relative">
                      <input
                        className={`${inputCls} pr-10`}
                        type={showEditAdminCode ? "text" : "password"}
                        required
                        autoFocus
                        value={editAdminCode}
                        onChange={e => setEditAdminCode(e.target.value)}
                        placeholder="Enter admin code"
                      />
                      <button type="button" tabIndex={-1}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowEditAdminCode(p => !p)}>
                        {showEditAdminCode ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  {editCodeError && <p className="text-sm text-red-600">{editCodeError}</p>}
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setEditing(null)}
                      className="px-4 py-2 text-sm border border-border hover:bg-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={editCodeVerifying}
                      className="px-4 py-2 text-sm bg-accent text-accent-foreground font-semibold hover:bg-gold-dark disabled:opacity-50">
                      {editCodeVerifying ? "Verifying…" : "Unlock"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                    <div>
                      <label className={labelCls}>First Name</label>
                      <input className={inputCls} required value={editing.firstName}
                        onChange={e => setEditing({ ...editing, firstName: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Username</label>
                      <input className={inputCls} required value={editing.username}
                        onChange={e => setEditing({ ...editing, username: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Email</label>
                      <input type="email" className={inputCls} required value={editing.email}
                        onChange={e => setEditing({ ...editing, email: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Password</label>
                    <button
                      type="button"
                      onClick={() => openResetPassword(editing)}
                      disabled={!editUnlocked}
                      className="flex items-center gap-2 text-sm font-medium px-4 py-2 border border-border hover:bg-secondary transition-colors"
                    >
                      <KeyRound size={14} />
                        Reset Password
                      </button>
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Roles</label>
                      <div className="flex gap-5 mt-1">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={editing.isAdmin}
                            onChange={e => setEditing({ ...editing, isAdmin: e.target.checked })} />
                          Admin
                        </label>
                      </div>
                    </div>
                  </div>
                  {formError && <p className="text-sm text-red-600">{formError}</p>}
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(editing)}
                      className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={14} /> Delete User
                    </button>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setEditing(null)}
                        className="px-4 py-2 text-sm border border-border hover:bg-secondary">
                        Cancel
                      </button>
                      <button type="submit" disabled={saving}
                        className="px-4 py-2 text-sm bg-accent text-accent-foreground font-semibold hover:bg-gold-dark disabled:opacity-50">
                        {saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {confirmDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
            <div className="bg-background border border-border p-6 w-full max-w-sm shadow-xl">
              <h3 className="font-heading font-semibold text-foreground mb-2">Delete User</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Permanently delete <span className="font-medium text-foreground">{confirmDelete.firstName} ({confirmDelete.username})</span>? This cannot be undone.
                {currentUser && confirmDelete.id === currentUser.id.toString() && (
                  <span className="block mt-2 font-medium text-red-600">
                    You are deleting your own account. You will be logged out immediately.
                  </span>
                )}
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="text-sm px-4 py-2 border border-border hover:bg-secondary transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="text-sm font-medium px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Reset Password Modal */}
        {resetTarget && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setResetTarget(null)} />
            <div className="relative bg-background w-full max-w-sm border border-border p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <h2 className="font-heading font-semibold text-foreground">
                  {resetStep === "code" ? "Verify Admin Code" : "Set New Password"}
                </h2>
                <button onClick={() => setResetTarget(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              {resetStep === "code" ? (
                <form onSubmit={handleResetCodeSubmit} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your admin code to reset the password for <span className="font-medium text-foreground">{resetTarget.firstName}</span>.
                  </p>
                  <div>
                    <label className={labelCls}>Admin Code</label>
                    <div className="relative">
                      <input
                        className={`${inputCls} pr-10`}
                        type={showResetAdminCode ? "text" : "password"}
                        required
                        autoFocus
                        value={resetAdminCode}
                        onChange={e => setResetAdminCode(e.target.value)}
                        placeholder="Enter admin code"
                      />
                      <button type="button" tabIndex={-1}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowResetAdminCode(p => !p)}>
                        {showResetAdminCode ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  {resetError && <p className="text-sm text-red-600">{resetError}</p>}
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setResetTarget(null)}
                      className="px-4 py-2 text-sm border border-border hover:bg-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={resetSaving}
                      className="px-4 py-2 text-sm bg-accent text-accent-foreground font-semibold hover:bg-gold-dark disabled:opacity-50">
                      {resetSaving ? "Verifying…" : "Continue"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Set a new password for <span className="font-medium text-foreground">{resetTarget.firstName}</span>. Must be at least 14 characters.
                  </p>
                  <div>
                    <label className={labelCls}>New Password</label>
                    <div className="relative">
                      <input
                        className={`${inputCls} pr-10`}
                        type={showResetPassword ? "text" : "password"}
                        required
                        minLength={14}
                        autoFocus
                        value={resetNewPassword}
                        onChange={e => setResetNewPassword(e.target.value)}
                      />
                      <button type="button" tabIndex={-1}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowResetPassword(p => !p)}>
                        {showResetPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Confirm Password</label>
                    <div className="relative">
                      <input
                        className={`${inputCls} pr-10`}
                        type={showResetConfirm ? "text" : "password"}
                        required
                        minLength={14}
                        value={resetConfirmPassword}
                        onChange={e => setResetConfirmPassword(e.target.value)}
                      />
                      <button type="button" tabIndex={-1}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowResetConfirm(p => !p)}>
                        {showResetConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {resetConfirmPassword.length > 0 && resetNewPassword !== resetConfirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                    )}
                  </div>
                  {resetError && <p className="text-sm text-red-600">{resetError}</p>}
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setResetTarget(null)}
                      className="px-4 py-2 text-sm border border-border hover:bg-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={resetSaving}
                      className="px-4 py-2 text-sm bg-accent text-accent-foreground font-semibold hover:bg-gold-dark disabled:opacity-50">
                      {resetSaving ? "Saving…" : "Reset Password"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Staff;
