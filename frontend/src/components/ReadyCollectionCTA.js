import { Link } from "react-router-dom";
import { ArrowRight, Truck, Clock } from "lucide-react";

/**
 * "Buy direct" CTA strip — for service pages where customers want set
 * standard-size pieces without a bespoke consultation.
 *
 * Props:
 *   occasion       — "traveller_funeral" | "sympathy" | "wedding" | "traveller_wedding" | "faith_wedding"
 *   eyebrow        — small uppercase label (defaults to "The Ready Collection")
 *   heading        — main heading (can be JSX with <em>)
 *   subheading     — short body copy
 *   examples       — optional array of strings to display as quick tags (e.g. ["1ft DAD", "Heart Tribute", ...])
 *   ctaLabel       — button label (default: "Shop the Ready Collection")
 *   tone           — "light" (default — paper-accent bg) | "white" | "dark"
 */
export default function ReadyCollectionCTA({
  occasion,
  eyebrow = "The Ready Collection",
  heading,
  subheading = "Some pieces don't wait. We hold a curated edit of standard-size tributes — ready to order direct from the shop. Up to a 4-day turnaround as we source fresh stems from Holland and Colombia and hand-build each piece in the atelier.",
  examples,
  ctaLabel = "Shop the Ready Collection",
  tone = "light",
}) {
  const isDark = tone === "dark";
  const bgClass = isDark ? "bg-[#1A1A1A] text-[#FAFAF7]" : (tone === "white" ? "bg-white" : "paper-accent");
  const labelClass = isDark ? "accent-label !text-[#B3A89B]" : "accent-label";
  const headingColor = isDark ? "text-[#FAFAF7]" : "text-[#1A1A1A]";
  const italicColor = isDark ? "text-[#B3A89B]" : "text-[#B3A89B]";
  const subColor = isDark ? "text-[#FAFAF7]/75" : "text-[#7A7A7A]";
  const ruleClass = isDark ? "thin-rule !bg-[#B3A89B]" : "thin-rule";
  const btnClass = isDark
    ? "bg-[#FAFAF7] text-[#1A1A1A] hover:bg-[#B3A89B]"
    : "bg-[#1A1A1A] text-[#FAFAF7] hover:bg-[#333]";

  return (
    <section className={`py-20 md:py-28 px-6 md:px-12 border-t border-[#E5E5E5] ${bgClass}`} data-testid={`ready-collection-cta-${occasion}`}>
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-7">
          <p className={`${labelClass} mb-6`}><span className={ruleClass} />{eyebrow}</p>
          <h2 className={`font-heading text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight ${headingColor} mb-6`}>
            {heading || (
              <>
                Order direct, <em className={italicColor}>no consultation needed.</em>
              </>
            )}
          </h2>
          <p className={`font-body text-base leading-relaxed mb-8 max-w-xl ${subColor}`}>
            {subheading}
          </p>
          {examples && examples.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {examples.map((ex) => (
                <span
                  key={ex}
                  className={`px-3 py-1.5 font-body text-[10px] uppercase tracking-[0.22em] ${
                    isDark ? "bg-[#FAFAF7]/10 text-[#FAFAF7]" : "bg-white border border-[#E5E5E5] text-[#1A1A1A]"
                  }`}
                >
                  {ex}
                </span>
              ))}
            </div>
          )}
          <Link to={`/collection?occasion=${occasion}`} data-testid={`ready-collection-link-${occasion}`}>
            <button className={`${btnClass} px-8 py-4 font-body text-xs uppercase tracking-[0.22em] inline-flex items-center gap-3 transition-all`}>
              {ctaLabel} <ArrowRight size={14} />
            </button>
          </Link>
        </div>

        <div className="lg:col-span-5">
          <div className={`p-8 ${isDark ? "border border-[#FAFAF7]/15" : "bg-white border border-[#E5E5E5]"}`}>
            <p className={`accent-label mb-5 ${isDark ? "!text-[#B3A89B]" : ""}`}>How it works</p>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Clock size={16} strokeWidth={1.3} className={isDark ? "text-[#B3A89B] mt-0.5" : "text-[#1A1A1A] mt-0.5"} />
                <div>
                  <p className={`font-body text-sm ${headingColor}`}>Up to 4-day turnaround</p>
                  <p className={`font-body text-xs ${subColor} mt-1`}>Fresh stems sourced from Holland &amp; Colombia, then hand-built in the atelier.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck size={16} strokeWidth={1.3} className={isDark ? "text-[#B3A89B] mt-0.5" : "text-[#1A1A1A] mt-0.5"} />
                <div>
                  <p className={`font-body text-sm ${headingColor}`}>Standard sizes &amp; finishes</p>
                  <p className={`font-body text-xs ${subColor} mt-1`}>Fixed prices. No quote required. UK-wide delivery.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ArrowRight size={16} strokeWidth={1.3} className={isDark ? "text-[#B3A89B] mt-0.5" : "text-[#1A1A1A] mt-0.5"} />
                <div>
                  <p className={`font-body text-sm ${headingColor}`}>Need bespoke?</p>
                  <p className={`font-body text-xs ${subColor} mt-1`}>
                    <Link to="/consultation" className="underline">Begin a consultation →</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
