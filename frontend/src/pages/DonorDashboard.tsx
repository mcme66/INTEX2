import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/state/auth";
import type { DonationDto } from "@/utils/api";
import {
  apiCreateDonorDonation,
  apiDeleteDonorDonation,
  apiListDonorDonations,
  apiUpdateDonorDonation,
} from "@/utils/api";
import {
  CalendarDays,
  DollarSign,
  Gift,
  HandHeart,
  Heart,
  Pencil,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const formatMoney = (amount: number | null, currency?: string | null) => {
  if (amount == null) return "—";
  const code = currency ?? "USD";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${code}`;
  }
};

const formatValue = (d: DonationDto) => {
  const val = d.amount ?? d.estimatedValue;
  switch (d.donationType) {
    case "Monetary":
      return formatMoney(val, d.currencyCode);
    case "Skills":
      return "Skills / Services";
    case "Time":
      return val != null ? `${val} hr${val === 1 ? "" : "s"}` : "—";
    case "InKind":
      return val != null ? `${val} item${val === 1 ? "" : "s"}` : "—";
    case "SocialMedia":
      return val != null ? `${val} post${val === 1 ? "" : "s"}` : "—";
    default:
      return val != null ? `${val}` : "—";
  }
};

const DonorDashboard = () => {
  const { user, token } = useAuth();
  const [donations, setDonations] = useState<DonationDto[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [donationType, setDonationType] = useState("Monetary");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [submitting, setSubmitting] = useState(false);

  const isMonetary = donationType === "Monetary";
  const isSkills = donationType === "Skills";
  const needsNumericValue = !isMonetary && !isSkills;

  const loadDonations = useCallback(async () => {
    if (!token) return;
    setLoadingList(true);
    setListError(null);
    try {
      const rows = await apiListDonorDonations(token);
      setDonations(rows);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Could not load donations.");
    } finally {
      setLoadingList(false);
    }
  }, [token]);

  useEffect(() => {
    void loadDonations();
  }, [loadDonations]);

  const stats = useMemo(() => {
    const totalGiven = donations.reduce((sum, d) => sum + (d.amount ?? 0), 0);
    const count = donations.length;
    const sorted = [...donations].sort(
      (a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime(),
    );
    const mostRecent = sorted[0] ?? null;
    const uniqueMonths = new Set(
      donations.map((d) => {
        const dt = new Date(d.donationDate);
        return `${dt.getFullYear()}-${dt.getMonth()}`;
      }),
    ).size;
    return { totalGiven, count, mostRecent, uniqueMonths };
  }, [donations]);

  const valueLabel: Record<string, string> = {
    Monetary: "Amount",
    Time: "Number of Hours",
    Skills: "Number of Hours",
    InKind: "Number of Items",
    SocialMedia: "Number of Posts",
  };

  const impactUnitMap: Record<string, string> = {
    Monetary: "dollars",
    Time: "hours",
    Skills: "hours",
    InKind: "items",
    SocialMedia: "campaigns",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const parsed = Number.parseFloat(amount);
    if (!isSkills && (!Number.isFinite(parsed) || parsed <= 0)) {
      toast.error("Enter a valid value greater than zero.");
      return;
    }
    if (isSkills && !notes.trim()) {
      toast.error("Please describe the skills or services you contributed.");
      return;
    }

    setSubmitting(true);
    try {
      await apiCreateDonorDonation(token, {
        donationType,
        amount: isMonetary ? parsed : undefined,
        estimatedValue: isSkills ? 1 : isMonetary ? undefined : parsed,
        impactUnit: impactUnitMap[donationType],
        notes: notes.trim() || undefined,
        currencyCode: isMonetary ? currencyCode : undefined,
      });
      toast.success("Thank you — your contribution has been recorded.");
      setAmount("");
      setNotes("");
      await loadDonations();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Contribution could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit / delete state ─────────────────────────────────
  const [editDonation, setEditDonation] = useState<DonationDto | null>(null);
  const [editType, setEditType] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editCurrency, setEditCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);

  const [deleteDonation, setDeleteDonation] = useState<DonationDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const editIsMonetary = editType === "Monetary";
  const editIsSkills = editType === "Skills";

  function openEdit(d: DonationDto) {
    setEditDonation(d);
    setEditType(d.donationType);
    setEditAmount(
      d.donationType === "Monetary"
        ? (d.amount?.toString() ?? "")
        : (d.estimatedValue?.toString() ?? ""),
    );
    setEditNotes(d.notes ?? "");
    setEditCurrency(d.currencyCode ?? "USD");
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editDonation) return;
    const parsed = Number.parseFloat(editAmount);
    if (!editIsSkills && (!Number.isFinite(parsed) || parsed <= 0)) {
      toast.error("Enter a valid value greater than zero.");
      return;
    }
    if (editIsSkills && !editNotes.trim()) {
      toast.error("Please describe the skills or services contributed.");
      return;
    }
    setSaving(true);
    try {
      await apiUpdateDonorDonation(token, editDonation.donationId, {
        donationType: editType,
        amount: editIsMonetary ? parsed : undefined,
        estimatedValue: editIsSkills ? 1 : editIsMonetary ? undefined : parsed,
        impactUnit: impactUnitMap[editType],
        notes: editNotes.trim() || undefined,
        currencyCode: editIsMonetary ? editCurrency : undefined,
      });
      toast.success("Donation updated.");
      setEditDonation(null);
      await loadDonations();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update donation.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteDonation) return;
    setDeleting(true);
    try {
      await apiDeleteDonorDonation(token, deleteDonation.donationId);
      toast.success("Donation deleted.");
      setDeleteDonation(null);
      setEditDonation(null);
      await loadDonations();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete donation.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <section className="px-4 sm:px-6 py-8 sm:py-10 overflow-x-hidden">
        <div className="mx-auto max-w-6xl">
          {/* ── Welcome ────────────────────────────────────────── */}
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Track your giving history, see the impact of your contributions, and continue
              making a difference for children in Colombia.
            </p>
          </div>

          {/* ── Stats strip ────────────────────────────────────── */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-none">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Given</p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {loadingList ? "…" : formatMoney(stats.totalGiven)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Donations</p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {loadingList ? "…" : stats.count}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Months</p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {loadingList ? "…" : stats.uniqueMonths}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Gift</p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {loadingList
                      ? "…"
                      : stats.mostRecent
                        ? new Date(stats.mostRecent.donationDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Impact + Give ──────────────────────────────────── */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
            {/* Impact snapshot */}
            <Card className="shadow-none">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  <CardTitle className="font-heading text-2xl">Your Impact</CardTitle>
                </div>
                <CardDescription>
                  Every donation helps fund safe housing, meals, education, and counseling for children in North Star&apos;s care.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {loadingList ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Most Recent Contribution
                      </p>
                      {stats.mostRecent ? (
                        <div className="mt-2 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {stats.mostRecent.donationType}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(stats.mostRecent.donationDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {formatValue(stats.mostRecent)}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          No contributions recorded yet.
                        </p>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">
                          What your contributions help provide
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          Support in action
                        </Badge>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          { label: "Safe housing", desc: "A secure home environment" },
                          { label: "Meals & nutrition", desc: "Daily meals for children" },
                          { label: "Education", desc: "School supplies & tutoring" },
                          { label: "Counseling", desc: "Therapeutic support sessions" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-lg border border-border bg-muted/30 p-3"
                          >
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Make a gift */}
            <Card className="shadow-none">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HandHeart className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="font-heading text-2xl">Make a Donation</CardTitle>
                </div>
                <CardDescription>
                  Submit a donation to support North Star's mission. No real payment is
                  processed — this is a demo environment.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Type of Contribution</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {([
                        { value: "Monetary", label: "Monetary", icon: "💵" },
                        { value: "Time", label: "Volunteer Time", icon: "🕐" },
                        { value: "Skills", label: "Skills & Services", icon: "🛠️" },
                        { value: "InKind", label: "In-Kind Goods", icon: "📦" },
                        { value: "SocialMedia", label: "Social Media", icon: "📣" },
                      ] as const).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setDonationType(opt.value); setAmount(""); }}
                          className={`rounded-md border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                            donationType === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                          }`}
                        >
                          <span className="mr-1.5">{opt.icon}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!isSkills && (
                    <div className="space-y-2">
                      <Label htmlFor="amount">{valueLabel[donationType]}</Label>
                      {isMonetary ? (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            $
                          </span>
                          <Input
                            id="amount"
                            type="number"
                            inputMode="decimal"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            className="pl-7"
                          />
                        </div>
                      ) : (
                        <Input
                          id="amount"
                          type="number"
                          inputMode="decimal"
                          min="0.01"
                          step="0.01"
                          placeholder={donationType === "SocialMedia" ? "e.g. 3" : "e.g. 25"}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                        />
                      )}
                    </div>
                  )}

                  {isMonetary && (
                    <>
                      <div className="flex gap-2">
                        {[10, 25, 50, 100, 250].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setAmount(preset.toString())}
                            className={`flex-1 rounded-md border px-2 py-1.5 text-sm font-medium transition-colors ${
                              amount === preset.toString()
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                            }`}
                          >
                            ${preset}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <select
                          id="currency"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={currencyCode}
                          onChange={(e) => setCurrencyCode(e.target.value)}
                        >
                          <option value="USD">USD — US Dollar</option>
                          <option value="COP">COP — Colombian Peso</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      {isSkills ? "Describe Your Contribution" : "Note (optional)"}
                    </Label>
                    <Input
                      id="notes"
                      type="text"
                      placeholder={isSkills ? "e.g. Legal consultation, tutoring, medical screening…" : "In honor of…"}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      maxLength={500}
                      required={isSkills}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Processing…" : isMonetary ? "Donate Now" : "Log Contribution"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* ── Donation history ───────────────────────────────── */}
          <Card className="mt-6 shadow-none">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Donation History</CardTitle>
              <CardDescription>
                A complete record of every contribution tied to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
              {loadingList && <p className="text-sm text-muted-foreground">Loading…</p>}
              {listError && (
                <p className="text-sm text-destructive" role="alert">
                  {listError}
                </p>
              )}
              {!loadingList && !listError && donations.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <Gift className="mx-auto h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 text-muted-foreground">
                    No donations yet. When you submit a gift above, it will appear here.
                  </p>
                </div>
              )}
              {!loadingList && !listError && donations.length > 0 && (
                <div className="rounded-md border border-border w-full min-w-0 overflow-x-auto">
                  <Table className="min-w-[560px] table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[20%]">Date</TableHead>
                        <TableHead className="w-[15%]">Type</TableHead>
                        <TableHead className="w-[20%]">Contribution</TableHead>
                        <TableHead className="w-[35%]">Note</TableHead>
                        <TableHead className="w-[10%]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...donations]
                        .sort(
                          (a, b) =>
                            new Date(b.donationDate).getTime() -
                            new Date(a.donationDate).getTime(),
                        )
                        .map((d) => (
                          <TableRow key={d.donationId}>
                            <TableCell className="whitespace-nowrap">
                              {new Date(d.donationDate).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs font-normal">
                                {d.donationType}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatValue(d)}
                            </TableCell>
                            <TableCell className="truncate text-muted-foreground">
                              {d.notes ?? "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <button
                                type="button"
                                onClick={() => openEdit(d)}
                                className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Edit donation dialog ─────────────────────────── */}
      <Dialog open={editDonation !== null && deleteDonation === null} onOpenChange={(open) => { if (!open) setEditDonation(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Donation</DialogTitle>
            <DialogDescription>
              Update the details for this contribution, or delete it.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => void handleUpdate(e)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {([
                  { value: "Monetary", label: "Monetary", icon: "💵" },
                  { value: "Time", label: "Volunteer Time", icon: "🕐" },
                  { value: "Skills", label: "Skills & Services", icon: "🛠️" },
                  { value: "InKind", label: "In-Kind Goods", icon: "📦" },
                  { value: "SocialMedia", label: "Social Media", icon: "📣" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEditType(opt.value)}
                    className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition-colors ${
                      editType === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    <span className="mr-1.5">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {!editIsSkills && (
              <div className="space-y-2">
                <Label htmlFor="edit-amount">
                  {editIsMonetary ? "Amount" : valueLabel[editType]}
                </Label>
                {editIsMonetary ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="edit-amount"
                      type="number"
                      inputMode="decimal"
                      min="0.01"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      required
                      className="pl-7"
                    />
                  </div>
                ) : (
                  <Input
                    id="edit-amount"
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    required
                  />
                )}
              </div>
            )}

            {editIsMonetary && (
              <div className="space-y-2">
                <Label htmlFor="edit-currency">Currency</Label>
                <select
                  id="edit-currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editCurrency}
                  onChange={(e) => setEditCurrency(e.target.value)}
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="COP">COP — Colombian Peso</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-notes">
                {editIsSkills ? "Describe Your Contribution" : "Note"}
              </Label>
              <Input
                id="edit-notes"
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                maxLength={500}
                required={editIsSkills}
                placeholder={editIsSkills ? "e.g. Legal consultation, tutoring…" : ""}
              />
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDonation(editDonation)}
                className="sm:mr-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setEditDonation(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation dialog ───────────────────── */}
      <Dialog open={deleteDonation !== null} onOpenChange={(open) => { if (!open) setDeleteDonation(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Donation</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to delete this donation?
            </DialogDescription>
          </DialogHeader>

          {deleteDonation && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1 text-sm">
              <p>
                <span className="font-medium">Date:</span>{" "}
                {new Date(deleteDonation.donationDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p>
                <span className="font-medium">Type:</span> {deleteDonation.donationType}
              </p>
              {deleteDonation.amount != null && (
                <p>
                  <span className="font-medium">Amount:</span>{" "}
                  {formatMoney(deleteDonation.amount, deleteDonation.currencyCode)}
                </p>
              )}
              {deleteDonation.notes && (
                <p>
                  <span className="font-medium">Note:</span> {deleteDonation.notes}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDonation(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={() => void handleDelete()}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default DonorDashboard;
