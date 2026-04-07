import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/kid_stars.svg" alt="North Star" className="w-7 h-7 brightness-200" />
              <span className="font-heading text-lg font-semibold">North Star</span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Providing refuge, healing, and hope to trafficked and abused children in Colombia.
            </p>
          </div>

          {/* Organization */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-4">
              Organization
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Home</Link></li>
              <li><a href="#mission" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Our Mission</a></li>
              <li><a href="#about" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Our Team</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Annual Reports</a></li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-4">
              Get Involved
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/donors" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Donate</Link></li>
              <li><Link to="/volunteer" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Volunteer</Link></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Partner With Us</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Fundraise</a></li>
              <li><Link to="/impact" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">See Our Impact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-4">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/70">
              <li>info@northstarrefuge.org</li>
              <li>Bogotá, Colombia</li>
              <li className="pt-2">
                <a href="#" className="hover:text-primary-foreground transition-colors">Instagram</a>
                {" · "}
                <a href="#" className="hover:text-primary-foreground transition-colors">Facebook</a>
                {" · "}
                <a href="#" className="hover:text-primary-foreground transition-colors">LinkedIn</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-primary-foreground/40">
          <span>© {new Date().getFullYear()} North Star Refuge. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-primary-foreground/60 transition-colors">Privacy Policy</Link>
            <a href="#" className="hover:text-primary-foreground/60 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-foreground/60 transition-colors">Financial Transparency</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
