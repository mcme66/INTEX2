import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { apiCreateDonorDonation, apiListDonorDonations } from "@/utils/api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const formatMoney = (amount: number | null, currency: string | null) => {
  if (amount == null) return "—";
  const code = currency ?? "PHP";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(amount);
  } catch {
    return `${amount} ${code}`;
  }
};

const DonorDashboard = () => {
  const { user, token } = useAuth();
  const [donations, setDonations] = useState<DonationDto[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const parsed = Number.parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter a valid amount greater than zero.");
      return;
    }
    setSubmitting(true);
    try {
      await apiCreateDonorDonation(token, {
        amount: parsed,
        notes: notes.trim() || undefined,
        currencyCode: currencyCode || undefined,
      });
      toast.success("Thank you — your simulated gift was recorded.");
      setAmount("");
      setNotes("");
      await loadDonations();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Donation could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="px-4 sm:px-6 py-10 sm:py-14 overflow-x-hidden">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Donor Dashboard
            </p>
            <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Make a simulated gift (no real payment) and review your donation history tied to your
              account.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-2 min-w-0">
            <Card className="shadow-none min-w-0">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Make a gift</CardTitle>
                <CardDescription>
                  This is a demo only — no card or bank connection. The amount is stored like other
                  Lighthouse donations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      inputMode="decimal"
                      min="0.01"
                      step="0.01"
                      placeholder="500.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={currencyCode}
                      onChange={(e) => setCurrencyCode(e.target.value)}
                    >
                      <option value="PHP">PHP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Note (optional)</Label>
                    <Input
                      id="notes"
                      type="text"
                      placeholder="In honor of…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      maxLength={500}
                    />
                  </div>
                  <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
                    {submitting ? "Saving…" : "Submit simulated donation"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-none min-w-0">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Your donations</CardTitle>
                <CardDescription>
                  New accounts are linked to a supporter record automatically when you give, or by
                  email if you match an existing profile.
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
                  <p className="text-sm text-muted-foreground">
                    No donations yet. When you submit a gift, it will appear here.
                  </p>
                )}
                {!loadingList && !listError && donations.length > 0 && (
                  <div className="rounded-md border border-border w-full min-w-0 overflow-x-auto">
                    <Table className="min-w-[520px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Note</TableHead>
                          <TableHead>Source</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {donations.map((d) => (
                          <TableRow key={d.donationId}>
                            <TableCell className="whitespace-nowrap">
                              {new Date(d.donationDate).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatMoney(d.amount, d.currencyCode)}
                            </TableCell>
                            <TableCell className="max-w-[180px] sm:max-w-[240px] truncate text-muted-foreground">
                              {d.notes ?? "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {d.channelSource ?? "—"}
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
        </div>
      </section>
    </Layout>
  );
};

export default DonorDashboard;
