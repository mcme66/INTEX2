import { Link, useLocation } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/state/auth";

type NavItem = { to: string; label: string };

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const donorLinks: NavItem[] = user?.isDonor
    ? [{ to: "/donor", label: "Donor Dashboard" }]
    : [];

  const adminLinks: NavItem[] = user?.isAdmin
    ? [{ to: "/admin", label: "Admin Dashboard" }]
    : [];

  const publicLinks: NavItem[] = [
    { to: "/donors", label: "Ways to Help" },
    { to: "/impact", label: "Our Impact" },
    { to: "/volunteer", label: "Volunteer" },
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

  const renderDesktopNav = () => {
    const hasDonor = donorLinks.length > 0;
    const hasAdmin = adminLinks.length > 0;
    const hasPublic = publicLinks.length > 0;
    const sections: ReactNode[] = [];

    if (hasDonor) {
      sections.push(
        <div key="donor" className="flex items-center gap-6">
          <NavLinkList items={donorLinks} />
        </div>,
      );
    }
    if (hasAdmin) {
      sections.push(
        <div key="admin" className="flex items-center gap-6">
          <NavLinkList items={adminLinks} />
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

        <div className="hidden md:flex items-center shrink-0 ml-auto">
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium px-4 py-2 bg-accent text-accent-foreground hover:bg-gold-dark transition-colors"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium px-4 py-2 bg-accent text-accent-foreground hover:bg-gold-dark transition-colors"
            >
              Staff Login
            </Link>
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
          {donorLinks.length > 0 &&
            (adminLinks.length > 0 || publicLinks.length > 0) && (
              <div
                className="text-center text-muted-foreground/40 select-none py-0.5"
                aria-hidden
              >
                |
              </div>
            )}
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
          {adminLinks.length > 0 && publicLinks.length > 0 && (
            <div
              className="text-center text-muted-foreground/40 select-none py-0.5"
              aria-hidden
            >
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
          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              className="block w-full text-sm font-medium px-4 py-2 bg-accent text-accent-foreground text-center mt-2"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium px-4 py-2 bg-accent text-accent-foreground text-center mt-2"
            >
              Staff Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
