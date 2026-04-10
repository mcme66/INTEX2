import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/state/auth";
import { useLanguage } from "@/state/language";

const Settings = () => {
  const { user, updateProfile, setupMfa, enableMfa, disableMfa, regenerateRecoveryCodes, deleteAccount } = useAuth();
  const { t } = useLanguage();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [mfaPassword, setMfaPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaSetupKey, setMfaSetupKey] = useState("");
  const [mfaSetupUri, setMfaSetupUri] = useState("");
  const [mfaQrDataUrl, setMfaQrDataUrl] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [mfaError, setMfaError] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setEmail(user.email);
    setUsername(user.username);
  }, [user]);

  useEffect(() => {
    if (!mfaSetupUri) {
      setMfaQrDataUrl("");
      return;
    }

    let cancelled = false;
    QRCode.toDataURL(mfaSetupUri, {
      width: 200,
      margin: 1,
      color: { dark: "#1f2937", light: "#0000" },
    })
      .then((dataUrl) => {
        if (!cancelled) setMfaQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setMfaQrDataUrl("");
      });

    return () => {
      cancelled = true;
    };
  }, [mfaSetupUri]);

  const handleProfileSave = async () => {
    setProfileError("");
    setProfileSuccess(false);

    if (firstName.trim().length < 2) {
      setProfileError(t("profileErrName"));
      return;
    }
    if (username.trim().length < 3) {
      setProfileError(t("profileErrUsername"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileError(t("profileErrEmail"));
      return;
    }

    const changingPassword = currentPassword || newPassword || confirmPassword;
    if (changingPassword) {
      if (!currentPassword) {
        setProfileError(t("profileErrCurrentPwd"));
        return;
      }
      if (newPassword.length < 6) {
        setProfileError(t("profileErrNewPwdLen"));
        return;
      }
      if (newPassword !== confirmPassword) {
        setProfileError(t("profileErrPwdMismatch"));
        return;
      }
    }

    setProfileSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        email: email.trim(),
        username: username.trim(),
        ...(changingPassword ? { currentPassword, newPassword } : {}),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setProfileSuccess(true);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : t("profileErrFailed"));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleMfaSetup = async () => {
    if (!mfaPassword) {
      setMfaError(t("profileErrCurrentPwd"));
      return;
    }

    setMfaLoading(true);
    setMfaError("");
    try {
      const setup = await setupMfa(mfaPassword);
      setMfaSetupKey(setup.manualEntryKey);
      setMfaSetupUri(setup.otpAuthUri);
      setRecoveryCodes([]);
    } catch (err: unknown) {
      setMfaError(err instanceof Error ? err.message : t("profileErrFailed"));
    } finally {
      setMfaLoading(false);
    }
  };

  const handleMfaEnable = async () => {
    if (!mfaPassword) {
      setMfaError(t("profileErrCurrentPwd"));
      return;
    }
    if (!mfaCode.trim()) {
      setMfaError(t("loginMfaCodeHelp"));
      return;
    }

    setMfaLoading(true);
    setMfaError("");
    try {
      const codes = await enableMfa(mfaPassword, mfaCode);
      setRecoveryCodes(codes);
      setMfaSetupKey("");
      setMfaSetupUri("");
      setMfaQrDataUrl("");
      setMfaCode("");
      toast.success(t("profileMfaSetupSuccess"));
    } catch (err: unknown) {
      setMfaError(err instanceof Error ? err.message : t("profileErrFailed"));
    } finally {
      setMfaLoading(false);
    }
  };

  const handleMfaDisable = async () => {
    if (!mfaPassword) {
      setMfaError(t("profileErrCurrentPwd"));
      return;
    }
    if (!mfaCode.trim()) {
      setMfaError(t("loginMfaCodeHelp"));
      return;
    }

    setMfaLoading(true);
    setMfaError("");
    try {
      await disableMfa(mfaPassword, mfaCode);
      setMfaCode("");
      setMfaSetupKey("");
      setMfaSetupUri("");
      setMfaQrDataUrl("");
      setRecoveryCodes([]);
      toast.success(t("profileMfaDisableSuccess"));
    } catch (err: unknown) {
      setMfaError(err instanceof Error ? err.message : t("profileErrFailed"));
    } finally {
      setMfaLoading(false);
    }
  };

  const handleRecoveryCodesRegenerate = async () => {
    if (!mfaPassword) {
      setMfaError(t("profileErrCurrentPwd"));
      return;
    }
    if (!mfaCode.trim()) {
      setMfaError(t("loginMfaCodeHelp"));
      return;
    }

    setMfaLoading(true);
    setMfaError("");
    try {
      const codes = await regenerateRecoveryCodes(mfaPassword, mfaCode);
      setRecoveryCodes(codes);
      setMfaCode("");
      toast.success(t("profileMfaRegenerateSuccess"));
    } catch (err: unknown) {
      setMfaError(err instanceof Error ? err.message : t("profileErrFailed"));
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError(t("profileErrCurrentPwd"));
      return;
    }
    if (user?.mfaEnabled && !deleteCode.trim()) {
      setDeleteError(t("loginMfaCodeHelp"));
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteAccount(deletePassword, deleteCode.trim() || undefined);
      toast.success(t("settingsDeleteSuccess"));
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : t("profileErrFailed"));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Layout>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h1 className="font-heading text-4xl font-semibold text-foreground">{t("settingsTitle")}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("settingsSub")}</p>
          </div>

          <Card className="border-border/80 shadow-none">
            <CardHeader>
              <CardTitle>{t("settingsProfileSection")}</CardTitle>
              <CardDescription>{t("settingsPasswordSection")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t("profileName")}</label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t("profileEmail")}</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("profileUsername")}</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>

              <div className="border-t border-border pt-6">
                <p className="mb-4 text-sm font-semibold text-foreground">{t("settingsPasswordSection")}</p>
                <div className="grid gap-5 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("profileCurrentPassword")}</label>
                    <div className="relative">
                      <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="pr-10" />
                      <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground">
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("profileNewPassword")}</label>
                    <div className="relative">
                      <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pr-10" />
                      <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground">
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("profileConfirmNewPassword")}</label>
                    <div className="relative">
                      <Input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pr-10" />
                      <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {profileError && <p className="text-sm text-destructive">{profileError}</p>}
              {profileSuccess && <p className="text-sm text-green-600">{t("profileUpdated")}</p>}

              <Button onClick={handleProfileSave} disabled={profileSaving}>
                {profileSaving ? t("profileSaving") : t("profileSave")}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-none">
            <CardHeader>
              <CardTitle>{t("settingsSecuritySection")}</CardTitle>
              <CardDescription>{t("profileMfaTitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                {user?.mfaEnabled ? t("profileMfaEnabled") : t("profileMfaDisabled")}
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("profileMfaSetupPasswordLabel")}</label>
                <Input type="password" value={mfaPassword} onChange={(e) => setMfaPassword(e.target.value)} />
                <p className="text-xs text-muted-foreground">{t("profileMfaPasswordHelp")}</p>
              </div>

              {!user?.mfaEnabled && (
                <>
                  <Button variant="outline" onClick={handleMfaSetup} disabled={mfaLoading}>
                    {t("profileMfaStartSetup")}
                  </Button>

                  {mfaSetupKey && (
                    <div className="rounded-lg border border-border bg-secondary/50 p-5 space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t("profileMfaSetupReady")}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{t("profileMfaSetupHint")}</p>
                      </div>
                      {mfaQrDataUrl && (
                        <div className="flex justify-center rounded-md bg-white p-4">
                          <img src={mfaQrDataUrl} alt="Scan this QR code with your authenticator app" className="h-48 w-48" />
                        </div>
                      )}
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">{t("profileMfaManualKey")}</p>
                        <code className="block break-all rounded bg-background px-3 py-3 text-xs text-foreground">{mfaSetupKey}</code>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t("profileMfaCode")}</label>
                        <Input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder={t("profileMfaCodePlaceholder")} />
                      </div>
                      <Button onClick={handleMfaEnable} disabled={mfaLoading}>{t("profileMfaEnable")}</Button>
                    </div>
                  )}
                </>
              )}

              {user?.mfaEnabled && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("profileMfaCode")}</label>
                    <Input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder={t("profileMfaCodePlaceholder")} />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button variant="outline" onClick={handleRecoveryCodesRegenerate} disabled={mfaLoading}>
                      {t("profileMfaRegenerateCodes")}
                    </Button>
                    <Button variant="outline" onClick={handleMfaDisable} disabled={mfaLoading} className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive">
                      {t("profileMfaDisable")}
                    </Button>
                  </div>
                </>
              )}

              {recoveryCodes.length > 0 && (
                <div className="rounded-lg border border-border bg-secondary/50 p-5 space-y-3">
                  <p className="text-sm font-semibold text-foreground">{t("profileMfaRecoveryCodes")}</p>
                  <p className="text-sm text-muted-foreground">{t("profileMfaRecoveryCodesHelp")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {recoveryCodes.map((code) => (
                      <code key={code} className="rounded bg-background px-3 py-2 text-xs text-foreground">{code}</code>
                    ))}
                  </div>
                </div>
              )}

              {mfaError && <p className="text-sm text-destructive">{mfaError}</p>}
            </CardContent>
          </Card>

          <Card className="border-destructive/20 shadow-none">
            <CardHeader>
              <CardTitle>{t("settingsDangerSection")}</CardTitle>
              <CardDescription>{t("settingsDeleteTitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("settingsDeleteBody")}</p>
              <p className="text-xs text-muted-foreground">{t("settingsDeleteConfirmLabel")}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t("profileCurrentPassword")}</label>
                  <Input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
                </div>
                {user?.mfaEnabled && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("profileMfaCode")}</label>
                    <Input value={deleteCode} onChange={(e) => setDeleteCode(e.target.value)} placeholder={t("profileMfaCodePlaceholder")} />
                  </div>
                )}
              </div>
              {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
              >
                {deleteLoading ? t("profileSaving") : t("settingsDeleteAction")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Settings;
