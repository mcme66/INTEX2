/**
 * CookieConsent.tsx — GDPR-compliant cookie consent banner
 *
 * FUNCTIONALITY: Fully functional — NOT cosmetic only.
 *
 * HOW CONSENT IS STORED:
 *   - Choice is persisted in localStorage under the key "cookie_consent".
 *   - Value is "accepted" or "rejected".
 *   - On every page load the value is read; the banner is only shown when
 *     the key is absent (first visit or after clearing storage).
 *
 * HOW SCRIPTS ARE BLOCKED BEFORE CONSENT:
 *   - No analytics or non-essential scripts are loaded unconditionally in
 *     this project. The `enableAnalytics()` function below is the single
 *     gate that would activate them.
 *   - Until the user clicks "Accept", `enableAnalytics()` is never called,
 *     so any third-party tracking remains dormant.
 *   - If you later add an analytics SDK (e.g. Google Analytics, Posthog),
 *     call `enableAnalytics()` / `disableAnalytics()` inside the accept /
 *     reject handlers rather than loading those scripts unconditionally.
 *
 * BANNER BEHAVIOUR:
 *   - Shown on first visit (no stored preference).
 *   - Hidden permanently once the user clicks Accept or Reject.
 *   - Choice can be reviewed on the /privacy page (see Privacy.tsx).
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "cookie_consent"; // localStorage key

/** Activate non-essential cookies / analytics here if you add them later. */
function enableAnalytics() {
  // Example: window.gtag?.("consent", "update", { analytics_storage: "granted" });
  // Currently a no-op — add your analytics init code here.
}

/** Deactivate / block non-essential cookies / analytics here. */
function disableAnalytics() {
  // Example: window.gtag?.("consent", "update", { analytics_storage: "denied" });
  // Currently a no-op — add your opt-out code here.
}

/** Returns the stored consent value, or null if not yet set. */
export function getConsentStatus(): "accepted" | "rejected" | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === "accepted" || v === "rejected") return v;
  } catch {
    // localStorage unavailable (private browsing edge-case)
  }
  return null;
}

const CookieConsent = () => {
  // Show banner only when no prior consent is stored.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getConsentStatus();
    if (stored === null) {
      // No preference yet — show banner.
      setVisible(true);
    } else if (stored === "accepted") {
      // User previously accepted; re-activate analytics without showing banner.
      enableAnalytics();
    }
    // "rejected" → do nothing; non-essential scripts stay blocked.
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      /* ignore if storage is blocked */
    }
    enableAnalytics();
    setVisible(false);
  };

  const handleReject = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "rejected");
    } catch {
      /* ignore if storage is blocked */
    }
    disableAnalytics();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    // Fixed banner at bottom of viewport; z-index above all page content.
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 px-6 py-5 shadow-lg backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-foreground">
            We use cookies
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            This site uses essential cookies required for login and core
            functionality. With your consent we may also activate optional
            analytics cookies to understand how the site is used — no personal
            data is sold or shared with third parties. See our{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </a>{" "}
            for details. You can change your preference at any time by clearing
            your browser's local storage.
          </p>
        </div>

        <div className="flex shrink-0 gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReject}
            className="min-w-[90px]"
          >
            Reject
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="min-w-[90px]"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
