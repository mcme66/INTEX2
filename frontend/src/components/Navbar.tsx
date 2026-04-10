import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X, UserCircle } from "lucide-react";
import { useAuth } from "@/state/auth";
import { useLanguage } from "@/state/language";

type NavItem = { to: string; label: string };

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProxyNav, setShowProxyNav] = useState(false);
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const headerRef = useRef<HTMLElement>(null);
  const desktopPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (desktopPanelRef.current?.contains(target)) return;
      setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowProxyNav(!entry.isIntersecting),
      { threshold: 0.05 },
    );

    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setShowProxyNav(false);
  }, [location.pathname]);

  const donorLinks: NavItem[] = user?.isDonor ? [{ to: "/donor", label: t("navDonorDashboard") }] : [];
  const adminLinks: NavItem[] = user?.isAdmin ? [{ to: "/admin", label: t("navAdminDashboard") }] : [];
  const publicLinks: NavItem[] = [
    { to: "/", label: t("navHome") },
    { to: "/impact", label: t("navImpact") },
    { to: "/volunteer", label: t("navWaysToHelp") },
  ];

  const linkClass = (to: string) =>
    `text-sm font-medium transition-colors ${
      location.pathname === to ? "text-foreground" : "text-muted-foreground hover:text-foreground"
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
          lang === "en" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
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
          lang === "es" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Cambiar a Español"
      >
        ES
      </button>
    </div>
  );

  const renderDesktopNav = () => {
    const sections: ReactNode[] = [];
    if (adminLinks.length) sections.push(<div key="admin" className="flex items-center gap-6"><NavLinkList items={adminLinks} /></div>);
    if (donorLinks.length) sections.push(<div key="donor" className="flex items-center gap-6"><NavLinkList items={donorLinks} /></div>);
    if (publicLinks.length) sections.push(<div key="public" className="flex items-center gap-6"><NavLinkList items={publicLinks} /></div>);

    return (
      <div className="hidden md:flex items-center gap-4 min-w-0 pl-8 pr-4 flex-wrap">
        {sections.map((node, i) => (
          <span key={i} className="flex items-center gap-4">
            {i > 0 && <SectionDivider />}
            {node}
          </span>
        ))}
      </div>
    );
  };

  const renderNavShell = ({ isProxy = false }: { isProxy?: boolean }) => {
    const isActiveShell = showProxyNav ? isProxy : !isProxy;

    return (
      <header
        ref={isProxy ? undefined : headerRef}
        className={
          isProxy
            ? `fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm transition-all duration-300 ${
                showProxyNav ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-full opacity-0 pointer-events-none"
              }`
            : "relative z-40 border-b border-border bg-background/95 backdrop-blur-sm"
        }
      >
        <nav className="w-full px-4 sm:px-6 h-16 flex items-center">
          <div className="flex min-w-0 items-center">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="North Star home">
              <img src="/icons/kid_stars.svg" alt="" className="w-8 h-8" />
              <span className="font-heading text-xl font-semibold tracking-tight text-foreground">North Star</span>
            </Link>
            {renderDesktopNav()}
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
            <LangToggle />
            {user ? (
              <>
                <span className="text-sm font-medium text-foreground">{user.firstName}</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary transition-colors"
                    aria-label={t("navAccountSettings")}
                  >
                    <UserCircle size={22} className="text-foreground" />
                  </button>

                  {profileOpen && isActiveShell && (
                    <div
                      ref={desktopPanelRef}
                      className="absolute right-0 top-12 w-56 bg-background border border-border rounded-lg shadow-lg p-2 z-50"
                    >
                      <Link
                        to="/settings"
                        className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        {t("navAccountSettings")}
                      </Link>
                      <button
                        type="button"
                        onClick={logout}
                        className="block w-full text-left rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        {t("navSignOut")}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/register" className="text-sm font-medium px-4 py-2 border border-border hover:bg-secondary transition-colors">
                  {t("navRegister")}
                </Link>
                <Link to="/login" className="text-sm font-medium px-4 py-2 bg-accent text-accent-foreground hover:bg-gold-dark transition-colors">
                  {t("navLogin")}
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-foreground ml-auto shrink-0" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {mobileOpen && isActiveShell && (
          <div className="md:hidden border-t border-border bg-background px-4 sm:px-6 py-4 space-y-4">
            {[...adminLinks, ...donorLinks, ...publicLinks].map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={`block text-sm font-medium py-1 ${linkClass(link.to)}`}>
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <div className="text-center text-muted-foreground/40 select-none py-0.5" aria-hidden>|</div>
                <Link to="/settings" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-1 text-foreground">
                  {t("navAccountSettings")}
                </Link>
                <button type="button" onClick={logout} className="block text-sm font-medium py-1 text-foreground">
                  {t("navSignOut")}
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-3">
                <Link to="/register" onClick={() => setMobileOpen(false)} className="text-sm font-medium px-4 py-2 border border-border hover:bg-secondary transition-colors text-center">
                  {t("navRegister")}
                </Link>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium px-4 py-2 bg-accent text-accent-foreground hover:bg-gold-dark transition-colors text-center">
                  {t("navLogin")}
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    );
  };

  return (
    <>
      {renderNavShell({ isProxy: false })}
      {renderNavShell({ isProxy: true })}
    </>
  );
};

export default Navbar;
