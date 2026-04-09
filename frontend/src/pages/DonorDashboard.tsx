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
import { useLanguage } from "@/state/language";
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
  const { t } = useLanguage();
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

  const loadDonations = useCallback(async () => {
    if (!token) return;
    setLoadingList(true);
    setListError(null);
    try {
      const rows = await apiListDonorDonations(token);
      setDonations(rows);
    } catch (e) {
      setListError(e instanceof Error ? e.message : t("donorToastErrLoad"));
    } finally {
      setLoadingList(false);
    }
  }, [token, t]);

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
    Monetary: t("donorAmount"),
    Time: t("donorNumHours"),
    Skills: t("donorNumHours"),
    InKind: t("donorNumItems"),
    SocialMedia: t("donorNumPosts"),
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
      toast.error(t("donorToastErrValue"));
      return;
    }
    if (isSkills && !notes.trim()) {
      toast.error(t("donorToastErrSkills"));
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
      toast.success(t("donorToastSuccess"));
      setAmount("");
      setNotes("");
      await loadDonations();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("donorToastErrSave"));
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
      toast.error(t("donorToastErrValue"));
      return;
    }
    if (editIsSkills && !editNotes.trim()) {
      toast.error(t("donorToastErrSkillsEdit"));
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
      toast.success(t("donorToastUpdated"));
      setEditDonation(null);
      await loadDonations();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("donorToastErrUpdate"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteDonation) return;
    setDeleting(true);
    try {
      await apiDeleteDonorDonation(token, deleteDonation.donationId);
      toast.success(t("donorToastDeleted"));
      setDeleteDonation(null);
      setEditDonation(null);
      await loadDonations();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("donorToastErrDelete"));
    } finally {
      setDeleting(false);
    }
  };

  const donationTypeOptions = [
    { value: "Monetary",    label: t("donorMonetary"),      icon: "💵" },
    { value: "Time",        label: t("donorVolunteerTime"),  icon: "🕐" },
    { value: "Skills",      label: t("donorSkillsServices"), icon: "🛠️" },
    { value: "InKind",      label: t("donorInKindGoods"),    icon: "📦" },
    { value: "SocialMedia", label: t("donorSocialMedia"),    icon: "📣" },
  ] as const;

  return (
    <Layout>
      <section className="px-4 sm:px-6 py-8 sm:py-10 overflow-x-hidden">
        <div className="mx-auto max-w-6xl">
          {/* ── Welcome ────────────────────────────────────────── */}
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl font-semibold text-foreground md:text-5xl">
              {t("donorWelcome")}{user?.firstName ? `, ${user.firstName}` : ""}.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("donorSub")}
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
                  <p className="text-sm text-muted-foreground">{t("donorTotalGiven")}</p>
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
                  <p className="text-sm text-muted-foreground">{t("donorDonations")}</p>
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
                  <p className="text-sm text-muted-foreground">{t("donorActiveMonths")}</p>
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
                  <p className="text-sm text-muted-foreground">{t("donorLastGift")}</p>
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
                  <CardTitle className="font-heading text-2xl">{t("donorYourImpact")}</CardTitle>
                </div>
                <CardDescription>
                  {t("donorImpactDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {loadingList ? (
                  <p className="text-sm text-muted-foreground">{t("donorLoading")}</p>
                ) : (
                  <>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {t("donorMostRecent")}
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
                          {t("donorNoContributions")}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">
                          {t("donorWhatHelps")}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {t("donorSupportInAction")}
                        </Badge>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          { label: t("donorSafeHousing"),  desc: t("donorSafeHousingDesc") },
                          { label: t("donorMeals"),         desc: t("donorMealsDesc") },
                          { label: t("donorEducation"),     desc: t("donorEducationDesc") },
                          { label: t("donorCounseling"),    desc: t("donorCounselingDesc") },
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
                  <CardTitle className="font-heading text-2xl">{t("donorMakeADonation")}</CardTitle>
                </div>
                <CardDescription>
                  {t("donorMakeADonationDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
                  <div className="space-y-2">
                    <Label>{t("donorTypeOfContribution")}</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {donationTypeOptions.map((opt) => (
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
                        <Label htmlFor="currency">{t("donorCurrency")}</Label>
                        <select
                          id="currency"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={currencyCode}
                          onChange={(e) => setCurrencyCode(e.target.value)}
                        >
                          <option value="USD">{t("donorUSD")}</option>
                          <option value="COP">{t("donorCOP")}</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      {isSkills ? t("donorDescribeContribution") : t("donorNoteOptional")}
                    </Label>
                    <Input
                      id="notes"
                      type="text"
                      placeholder={isSkills ? t("donorSkillsPlaceholder") : t("donorNotePlaceholder")}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      maxLength={500}
                      required={isSkills}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? t("donorProcessing") : isMonetary ? t("donorDonateNow") : t("donorLogContribution")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* ── Donation history ───────────────────────────────── */}
          <Card className="mt-6 shadow-none">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">{t("donorDonationHistory")}</CardTitle>
              <CardDescription>
                {t("donorHistoryDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
              {loadingList && <p className="text-sm text-muted-foreground">{t("donorLoading")}</p>}
              {listError && (
                <p className="text-sm text-destructive" role="alert">
                  {listError}
                </p>
              )}
              {!loadingList && !listError && donations.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <Gift className="mx-auto h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 text-muted-foreground">
                    {t("donorNoDonations")}
                  </p>
                </div>
              )}
              {!loadingList && !listError && donations.length > 0 && (
                <div className="rounded-md border border-border w-full min-w-0 overflow-x-auto">
                  <Table className="min-w-[560px] table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[20%]">{t("donorDateCol")}</TableHead>
                        <TableHead className="w-[15%]">{t("donorTypeCol")}</TableHead>
                        <TableHead className="w-[20%]">{t("donorContributionCol")}</TableHead>
                        <TableHead className="w-[35%]">{t("donorNoteCol")}</TableHead>
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
            <DialogTitle>{t("donorEditDonation")}</DialogTitle>
            <DialogDescription>
              {t("donorEditDesc")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => void handleUpdate(e)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>{t("donorTypeEditLabel")}</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {donationTypeOptions.map((opt) => (
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
                  {editIsMonetary ? t("donorAmount") : valueLabel[editType]}
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
                <Label htmlFor="edit-currency">{t("donorCurrency")}</Label>
                <select
                  id="edit-currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editCurrency}
                  onChange={(e) => setEditCurrency(e.target.value)}
                >
                  <option value="USD">{t("donorUSD")}</option>
                  <option value="COP">{t("donorCOP")}</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-notes">
                {editIsSkills ? t("donorDescribeContribution") : t("donorNoteCol")}
              </Label>
              <Input
                id="edit-notes"
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                maxLength={500}
                required={editIsSkills}
                placeholder={editIsSkills ? t("donorSkillsPlaceholder") : ""}
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
                {t("donorDelete")}
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setEditDonation(null)}>
                  {t("donorCancel")}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? t("donorSavingChanges") : t("donorSaveChanges")}
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
            <DialogTitle>{t("donorDeleteDonation")}</DialogTitle>
            <DialogDescription>
              {t("donorDeleteConfirm")}
            </DialogDescription>
          </DialogHeader>

          {deleteDonation && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1 text-sm">
              <p>
                <span className="font-medium">{t("donorDateLabel")}</span>{" "}
                {new Date(deleteDonation.donationDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p>
                <span className="font-medium">{t("donorTypeLabelInline")}</span> {deleteDonation.donationType}
              </p>
              {deleteDonation.amount != null && (
                <p>
                  <span className="font-medium">{t("donorAmountLabel")}</span>{" "}
                  {formatMoney(deleteDonation.amount, deleteDonation.currencyCode)}
                </p>
              )}
              {deleteDonation.notes && (
                <p>
                  <span className="font-medium">{t("donorNoteLabelInline")}</span> {deleteDonation.notes}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDonation(null)}>
              {t("donorCancel")}
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={() => void handleDelete()}>
              {deleting ? t("donorDeleting") : t("donorDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default DonorDashboard;
