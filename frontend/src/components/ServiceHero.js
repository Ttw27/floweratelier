import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * Editable service-page hero. Falls back to provided defaults if `content` is null.
 * `content` shape matches /api/page-content/{slug}:
 *   { hero_eyebrow, hero_title_line1, hero_title_italic, hero_title_line2,
 *     hero_subheading, hero_image, hero_cta_label, hero_cta_url }
 *
 * `defaults` is the same shape — pages pass their original copy as defaults so they
 * still render when the CMS row is missing or the API is down.
 */
export default function ServiceHero({ content, defaults, testId = "service-hero", titleTestId, layout = "split-right" }) {
  const c = content || {};
  const d = defaults || {};
  const eyebrow   = c.hero_eyebrow   || d.hero_eyebrow   || "";
  const line1     = c.hero_title_line1   || d.hero_title_line1   || "";
  const italic    = c.hero_title_italic  || d.hero_title_italic  || "";
  const line2     = c.hero_title_line2   || d.hero_title_line2   || "";
  const sub       = c.hero_subheading || d.hero_subheading || "";
  const image     = c.hero_image     || d.hero_image     || "";
  const ctaLabel  = c.hero_cta_label || d.hero_cta_label || "Begin a consultation";
  const ctaUrl    = c.hero_cta_url   || d.hero_cta_url   || "/consultation";

  const imgRight = layout === "split-right";

  return (
    <section className="relative" data-testid={testId}>
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[60vh] lg:min-h-[70vh]">
        <div className={`lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-14 lg:py-16 bg-[#FAFAF7] ${imgRight ? "order-2 lg:order-1" : "order-2"}`}>
          <div className="max-w-md">
            {eyebrow && <p className="accent-label mb-8"><span className="thin-rule" />{eyebrow}</p>}
            <h1 className="font-heading text-[2.5rem] sm:text-5xl xl:text-6xl 2xl:text-7xl font-light text-[#1A1A1A] leading-[1.05] tracking-tight mb-8 break-words" data-testid={titleTestId}>
              {line1}{line2 && <> {line2}</>}{italic && <> <span className="italic text-[#B3A89B]">{italic}</span></>}
            </h1>
            {sub && <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">{sub}</p>}
            <Link to={ctaUrl}>
              <Button className="btn-dark rounded-none inline-flex items-center gap-3 py-6 px-8" data-testid={`${testId}-cta`}>
                {ctaLabel} <ArrowRight size={14} strokeWidth={1.5} />
              </Button>
            </Link>
          </div>
        </div>
        <div className={`lg:col-span-7 h-[45vh] lg:h-auto ${imgRight ? "order-1 lg:order-2" : "order-1"} bg-[#F2EFEB]`}>
          {image && <img src={image} alt={eyebrow} className="w-full h-full object-cover" onLoad={(e) => e.target.style.opacity = 1} style={{opacity: 0, transition: "opacity 0.3s ease"}} ref={el => { if (el) { el.onload = () => el.style.opacity = 1; if (el.complete) el.style.opacity = 1; }}} />}
        </div>
      </div>
    </section>
  );
}
