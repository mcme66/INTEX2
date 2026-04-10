import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/state/auth";
import { useLanguage } from "@/state/language";
import { toast } from "@/components/ui/use-toast";

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/lighthousesanctuary/", icon: "/icons/insta_icon.svg" },
  { name: "Facebook", href: "https://www.facebook.com/lighthousesanctuary/", icon: "/icons/fb_icon.svg" },
  { name: "YouTube", href: "https://www.youtube.com/@LighthouseSanctuary", icon: "/icons/youtube_icon.svg" },
];
const publicSiteUrl = "https://northstar-sanctuaries.vercel.app";

const Footer = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const donateTarget = user ? "/donor" : "/register";

  const footerLinkClass = "text-primary-foreground/70 hover:text-primary-foreground transition-colors";

  const navigateHomeSection = (sectionId?: string) => {
    if (location.pathname === "/") {
      if (!sectionId) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    navigate(sectionId ? { pathname: "/", hash: `#${sectionId}` } : "/");
  };

  const handleShare = async () => {
    const shareUrl = publicSiteUrl;

    if (navigator.share) {
      try {
        await navigator.share({ url: shareUrl });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: t("footerShareSuccess") });
        return;
      } catch {
        // Fall through to unavailable feedback.
      }
    }

    toast({ title: t("footerShareUnavailable") });
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/icons/kid_stars.svg" alt="" className="w-7 h-7 brightness-200" />
              <span className="font-heading text-lg font-semibold">North Star</span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              {t("footerTagline")}
            </p>
          </div>

          {/* Organization */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-4">
              {t("footerOrganization")}
            </h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigateHomeSection()}
                  className={footerLinkClass}
                >
                  {t("footerHome")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateHomeSection("mission")}
                  className={footerLinkClass}
                >
                  {t("footerOurMission")}
                </button>
              </li>
              <li>
                <Link to="/impact" className={footerLinkClass}>
                  {t("footerOurImpact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-4">
              {t("footerGetInvolved")}
            </h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to={donateTarget} className={footerLinkClass}>
                  {t("footerDonate")}
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className={footerLinkClass}>
                  {t("footerVolunteer")}
                </Link>
              </li>
              <li>
                <button type="button" onClick={() => navigateHomeSection("get-involved")} className={footerLinkClass}>
                  {t("footerWaysToHelp")}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-4">
              {t("footerContact")}
            </h2>
            <ul className="space-y-2.5 text-sm text-primary-foreground/70">
              <li>
                <a href="mailto:info@northstarrefuge.org" className={footerLinkClass}>
                  info@northstarrefuge.org
                </a>
              </li>
              <li>Bogotá, Colombia</li>
              <li className="pt-2">
                <div className="flex items-center gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.name}
                      title={social.name}
                      className="inline-flex items-center justify-center text-primary-foreground/70 transition-opacity hover:opacity-80"
                    >
                      <img src={social.icon} alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
                    </a>
                  ))}
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label={t("footerShare")}
                    title={t("footerShare")}
                    className="inline-flex items-center justify-center text-primary-foreground/70 transition-opacity hover:opacity-80"
                  >
                    <img
                      src="/icons/share_icon.svg"
                      alt=""
                      aria-hidden="true"
                      className="h-8 w-8 object-contain brightness-0 invert"
                    />
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-primary-foreground/40">
          <span>© {new Date().getFullYear()} North Star Refuge. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-primary-foreground/60 transition-colors">
              {t("footerPrivacyPolicy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
