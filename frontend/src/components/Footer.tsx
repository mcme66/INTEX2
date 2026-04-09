import { Link } from "react-router-dom";
import { useLanguage } from "@/state/language";

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
const scrollToMission = () => {
  const el = document.getElementById("mission");
  if (el) el.scrollIntoView({ behavior: "smooth" });
  else window.scrollTo({ top: 0, behavior: "smooth" });
};

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/lighthousesanctuary/", icon: "/icons/insta_icon.svg" },
  { name: "Facebook", href: "https://www.facebook.com/lighthousesanctuary/", icon: "/icons/fb_icon.svg" },
  { name: "YouTube", href: "https://www.youtube.com/@LighthouseSanctuary", icon: "/icons/youtube_icon.svg" },
];

const Footer = () => {
  const { t } = useLanguage();

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
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-4">
              {t("footerOrganization")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={scrollToTop}
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t("footerHome")}
                </button>
              </li>
              <li>
                <button
                  onClick={scrollToMission}
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t("footerOurMission")}
                </button>
              </li>
              <li>
                <Link to="/impact" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {t("footerOurImpact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-4">
              {t("footerGetInvolved")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/register" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {t("footerDonate")}
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {t("footerVolunteer")}
                </Link>
              </li>
              <li>
                <Link to="/impact" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {t("footerOurImpact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-4">
              {t("footerContact")}
            </h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/70">
              <li>info@northstar.com</li>
              <li>Bogotá, Colombia</li>
              <li className="pt-2">
                <div className="flex items-center gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      aria-label={social.name}
                      title={social.name}
                      className="inline-flex items-center justify-center text-primary-foreground/70 transition-opacity hover:opacity-80"
                    >
                      <img src={social.icon} alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
                    </a>
                  ))}
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
