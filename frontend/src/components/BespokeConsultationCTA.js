import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * Bespoke-first consultation CTA — sits before the Ready Collection
 * on every occasion page, making clear that the primary path is bespoke
 * and budget-led, with the Ready Collection as the secondary option.
 *
 * Props:
 *   service     — query string for consultation, e.g. "wedding"
 *   eyebrow     — small uppercase label (default: "Bespoke Consultation")
 *   heading     — JSX or string (default suits weddings)
 *   subheading  — supporting copy
 *   ctaLabel    — button label (default: "Begin a consultation")
 *   tone        — "light" (default, paper-accent) | "white" | "dark"
 */
export default function BespokeConsultationCTA({
  service,
  eyebrow = "Bespoke Consultation",
  heading,
  subheading = "Tell us what you imagine — your venue, your colours, your scale, your dreams. We'll design and quote a bespoke proposal that works within the budget that's right for you.",
  ctaLabel = "Begin a consultation",
  tone = "light",
}) {
  const isDark = tone === "dark";
  const bgClass = isDark ? "bg-[#1A1A1A] text-[#FAFAF7]" : (tone === "white" ? "bg-white" : "paper-accent");
  const labelClass = isDark ? "accent-label !text-[#B3A89B]" : "accent-label";
  const headingColor = isDark ? "text-[#FAFAF7]" : "text-[#1A1A1A]";
  const italicColor = "text-[#B3A89B]";
  const subColor = isDark ? "text-[#FAFAF7]/75" : "text-[#7A7A7A]";
  const ruleClass = isDark ? "thin-rule !bg-[#B3A89B]" : "thin-rule";
  const btnClass = isDark
    ? "bg-[#FAFAF7] text-[#1A1A1A] hover:bg-[#B3A89B]"
    : "bg-[#1A1A1A] text-[#FAFAF7] hover:bg-[#333]";

  return (
    <section
      className={`py-20 md:py-28 px-6 md:px-12 border-t border-[#E5E5E5] ${bgClass}`}
      data-testid={`bespoke-consultation-cta-${service}`}
    >
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-current mb-7 mx-auto">
          <Sparkles size={16} strokeWidth={1.3} className={isDark ? "text-[#B3A89B]" : "text-[#1A1A1A]"} />
        </div>
        <p className={`${labelClass} mb-6 inline-block`}><span className={ruleClass} />{eyebrow}</p>
        <h2 className={`font-heading text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight ${headingColor} mb-7`}>
          {heading || (
            <>
              We bring your vision<br />to life — <em className={italicColor}>at a budget that fits.</em>
            </>
          )}
        </h2>
        <p className={`font-body text-base leading-relaxed mb-10 max-w-2xl mx-auto ${subColor}`}>
          {subheading}
        </p>
        <Link to={`/consultation?service=${service}`} data-testid={`bespoke-consultation-link-${service}`}>
          <button className={`${btnClass} px-8 py-4 font-body text-xs uppercase tracking-[0.22em] inline-flex items-center gap-3 transition-all`}>
            {ctaLabel} <ArrowRight size={14} />
          </button>
        </Link>
        <p className={`mt-6 font-body text-[11px] uppercase tracking-[0.2em] ${isDark ? "text-[#FAFAF7]/50" : "text-[#B3A89B]"}`}>
          Complimentary · no obligation · response within 24 hours
        </p>
      </div>
    </section>
  );
}
