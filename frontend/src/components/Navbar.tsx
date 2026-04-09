import { Link, useLocation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X, UserCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/state/auth";
import { useLanguage } from "@/state/language";

type NavItem = { to: string; label: string };

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, updateProfile } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const [profileOpen, setProfileOpen] = useState(false);
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

  const desktopPanelRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  const resetForm = useCallback(() => {
    if (user) {
      setFirstName(user.firstName);
      setEmail(user.email);
      setUsername(user.username);
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setProfileError("");
    setProfileSuccess(false);
  }, [user]);

  useEffect(() => {
    if (profileOpen) resetForm();
  }, [profileOpen, resetForm]);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        desktopPanelRef.current?.contains(target) ||
        mobilePanelRef.current?.contains(target)
      )
        return;
      setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

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
        ...(changingPassword
          ? { currentPassword, newPassword }
          : {}),
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileOpen(false), 800);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : t("profileErrFailed"));
    } finally {
      setProfileSaving(false);
    }
  };

  const donorLinks: NavItem[] = user?.isDonor
    ? [{ to: "/donor", label: t("navDonorDashboard") }]
    : [];

  const adminLinks: NavItem[] = user?.isAdmin
    ? [{ to: "/admin", label: t("navAdminDashboard") }]
    : [];

  const publicLinks: NavItem[] = [
    { to: "/", label: t("navHome") },
    { to: "/impact", label: t("navImpact") },
    { to: "/volunteer", label: t("navWaysToHelp") },
  ];

  const linkClass = (to: string) =>
    `text-sm font-medium transition-colors ${
      location.pathname === to
        ? "text-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const NavLinkList = ({ items }: { items: NavItem[] }) =>
    items.map((link) => (
      <Link key={link.to} to={link.to} className={linkClass(link.to)}>
        {link.label}
      </Link>
    ));

  const SectionDivider = () => (
    <span className="text-muted-foreground/40 select-none" aria-hidden>
      |
    </span>
  );

  const LangToggle = () => (
    <div className="flex items-center text-xs font-semibold border border-border rounded overflow-hidden shrink-0">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-2 py-1 transition-colors ${
          lang === "en"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-border select-none">|</span>
      <button
        type="button"
        onClick={() => setLang("es")}
        className={`px-2 py-1 transition-colors ${
          lang === "es"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Cambiar a Español"
      >
        ES
      </button>
    </div>
  );

  const renderDesktopNav = () => {
    const hasDonor = donorLinks.length > 0;
    const hasAdmin = adminLinks.length > 0;
    const hasPublic = publicLinks.length > 0;
    const sections: ReactNode[] = [];

    if (hasAdmin) {
      sections.push(
        <div key="admin" className="flex items-center gap-6">
          <NavLinkList items={adminLinks} />
        </div>,
      );
    }
    if (hasDonor) {
      sections.push(
        <div key="donor" className="flex items-center gap-6">
          <NavLinkList items={donorLinks} />
        </div>,
      );
    }
    if (hasPublic) {
      sections.push(
        <div key="public" className="flex items-center gap-6">
          <NavLinkList items={publicLinks} />
        </div>,
      );
    }

    return (
      <div className="hidden md:flex flex-1 items-center justify-center gap-4 min-w-0 px-4 flex-wrap">
        {sections.map((node, i) => (
          <span key={i} className="flex items-center gap-4">
            {i > 0 && <SectionDivider />}
            {node}
          </span>
        ))}
      </div>
    );
  };

  const inputClass =
    "w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent";

  const profileFormContent = (
    <>
      <h3 className="text-sm font-semibold text-foreground mb-4">{t("navEditProfile")}</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">{t("profileName")}</label>
          <input
            type="text"
            className={inputClass}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">{t("profileEmail")}</label>
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">{t("profileUsername")}</label>
          <input
            type="text"
            className={inputClass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
      </div>

      <div className="border-t border-border mt-4 pt-4">
        <p className="text-xs font-semibold text-foreground mb-3">{t("profileChangePassword")}</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t("profileCurrentPassword")}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                className={inputClass + " pr-9"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t("profileRequiredToChange")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t("profileNewPassword")}
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                className={inputClass + " pr-9"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("profileMinSixChars")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t("profileConfirmNewPassword")}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className={inputClass + " pr-9"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("profileReEnter")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {profileError && <p className="text-xs text-red-500 mt-3">{profileError}</p>}
      {profileSuccess && <p className="text-xs text-green-600 mt-3">{t("profileUpdated")}</p>}

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => setProfileOpen(false)}
          className="flex-1 text-sm font-medium px-3 py-2 border border-border rounded-md hover:bg-secondary transition-colors"
        >
          {t("profileCancel")}
        </button>
        <button
          type="button"
          onClick={handleProfileSave}
          disabled={profileSaving}
          className="flex-1 text-sm font-medium px-3 py-2 bg-accent text-accent-foreground rounded-md hover:bg-gold-dark transition-colors disabled:opacity-50"
        >
          {profileSaving ? t("profileSaving") : t("profileSave")}
        </button>
      </div>
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="w-full px-4 sm:px-6 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <img src="/icons/kid_stars.svg" alt="North Star" className="w-8 h-8" />
          <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
            North Star
          </span>
        </Link>

        {renderDesktopNav()}

        <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
          <LangToggle />
          {user ? (
            <>
              <span className="text-sm font-medium text-foreground">
                {user.firstName}
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary transition-colors"
                  aria-label={t("navEditProfile")}
                >
                  <UserCircle size={22} className="text-foreground" />
                </button>

                {profileOpen && (
                  <div
                    ref={desktopPanelRef}
                    className="absolute right-0 top-12 w-80 max-h-[80vh] overflow-y-auto bg-background border border-border rounded-lg shadow-lg p-5 z-50"
                  >
                    {profileFormContent}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={logout}
                className="text-sm font-medium px-4 py-2 bg-accent text-accent-foreground hover:bg-gold-dark transition-colors"
              >
                {t("navSignOut")}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="text-sm font-medium px-4 py-2 border border-border hover:bg-secondary transition-colors"
              >
                {t("navRegister")}
              </Link>
              <Link
                to="/login"
                className="text-sm font-medium px-4 py-2 bg-accent text-accent-foreground hover:bg-gold-dark transition-colors"
              >
                {t("navLogin")}
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-foreground ml-auto shrink-0"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 sm:px-6 py-4 space-y-4">
          {adminLinks.length > 0 && (
            <div className="space-y-2">
              {adminLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-sm font-medium py-1 ${linkClass(link.to)}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
          {adminLinks.length > 0 &&
            (donorLinks.length > 0 || publicLinks.length > 0) && (
              <div className="text-center text-muted-foreground/40 select-none py-0.5" aria-hidden>
                |
              </div>
            )}
          {donorLinks.length > 0 && (
            <div className="space-y-2">
              {donorLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-sm font-medium py-1 ${linkClass(link.to)}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
          {donorLinks.length > 0 && publicLinks.length > 0 && (
            <div className="text-center text-muted-foreground/40 select-none py-0.5" aria-hidden>
              |
            </div>
          )}
          {publicLinks.length > 0 && (
            <div className="space-y-2">
              {publicLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-sm font-medium py-1 ${linkClass(link.to)}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Language toggle in mobile menu */}
          <div className="pt-1">
            <LangToggle />
          </div>

          {user ? (
            <div className="space-y-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setProfileOpen(true);
                }}
                className="block w-full text-sm font-medium px-4 py-2 border border-border text-center"
              >
                {t("navEditProfile")}
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="block w-full text-sm font-medium px-4 py-2 bg-accent text-accent-foreground text-center"
              >
                {t("navSignOut")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium px-4 py-2 border border-border text-center"
              >
                {t("navRegister")}
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium px-4 py-2 bg-accent text-accent-foreground text-center"
              >
                {t("navLogin")}
              </Link>
            </div>
          )}
        </div>
      )}

      {profileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-20 px-4">
          <div
            ref={mobilePanelRef}
            className="w-full max-w-sm max-h-[75vh] overflow-y-auto bg-background border border-border rounded-lg shadow-lg p-5"
          >
            {profileFormContent}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
