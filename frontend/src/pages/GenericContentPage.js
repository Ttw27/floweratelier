import { Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ServiceHero from "../components/ServiceHero";
import ServiceTiers from "../components/ServiceTiers";
import BespokeConsultationCTA from "../components/BespokeConsultationCTA";
import { usePageContent } from "../hooks/usePageContent";
import { SLUG_TO_PATH, isValidCustomSlug } from "../lib/pageRoutes";
import NotFoundPage from "./NotFoundPage";

/**
 * Renders admin-created pages (Admin → Page Content → Add page) at "/<slug>".
 * Shows the 404 page if the slug has no active content.
 */
export default function GenericContentPage() {
  const { slug = "" } = useParams();
  const normalised = slug.toLowerCase();
  const dedicatedPath = Object.prototype.hasOwnProperty.call(SLUG_TO_PATH, normalised) ? SLUG_TO_PATH[normalised] : null;
  const valid = !dedicatedPath && isValidCustomSlug(normalised);
  const { content, loading } = usePageContent(valid ? normalised : null);

  // Pages with their own dedicated route (e.g. /workshops-pubs) redirect there.
  if (dedicatedPath) return <Navigate to={dedicatedPath} replace />;
  if (!valid) return <NotFoundPage />;

  if (loading && !content) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] flex items-center justify-center" data-testid="generic-page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!content || content.active === false) return <NotFoundPage />;

  const title = [content.hero_title_line1, content.hero_title_line2, content.hero_title_italic].filter(Boolean).join(" ") || content.label || normalised;
  const hasTiers = Array.isArray(content.tiers) && content.tiers.length > 0;

  return (
    <div className="pt-28" data-testid={`generic-page-${normalised}`}>
      <Helmet>
        <title>{`${content.label || title} — Flower Atelier`}</title>
      </Helmet>
      <ServiceHero
        content={{ ...content, hero_title_line1: content.hero_title_line1 || content.label || "" }}
        defaults={{ hero_eyebrow: content.label || "" }}
        loading={loading}
        testId="generic-page-hero"
        titleTestId="generic-page-title"
      />
      {hasTiers && (
        <ServiceTiers content={content} loading={loading} eyebrow={content.label || "Services"} testId="generic-page-tiers" />
      )}
      {content.secondary_image && (
        <section className="px-6 md:px-12 py-16 md:py-20 border-t border-[#E5E5E5]">
          <div className="max-w-[1400px] mx-auto">
            <img src={content.secondary_image} alt={content.label || title} className="w-full max-h-[70vh] object-cover" />
          </div>
        </section>
      )}
      <BespokeConsultationCTA service="bespoke" />
    </div>
  );
}
