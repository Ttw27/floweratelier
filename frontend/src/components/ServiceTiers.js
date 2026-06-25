/**
 * Editable services / tier-pricing block. Renders the admin-editable tiers if
 * available, otherwise falls back to the hardcoded `defaultTiers` array passed in.
 *
 * Tier shape: { title, description, price_label, image_url }
 */
export default function ServiceTiers({ content, defaultTiers, eyebrow = "Services", heading, testId = "service-tiers" }) {
  const tiers = (content?.tiers && content.tiers.length > 0) ? content.tiers : (defaultTiers || []);
  if (tiers.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-6 md:px-12 paper-accent border-t border-[#E5E5E5]" data-testid={testId}>
      <div className="max-w-[1400px] mx-auto">
        <p className="accent-label mb-5"><span className="thin-rule" />{eyebrow}</p>
        {heading && (
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-16 max-w-3xl">
            {heading}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {tiers.map((t, idx) => (
            <div key={`${t.title}-${idx}`} className="group" data-testid={`${testId}-tier-${idx}`}>
              <div className="aspect-[4/3] image-hover-container mb-6 bg-white overflow-hidden">
                {t.image_url && <img src={t.image_url} alt={t.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
              </div>
              <h3 className="font-heading text-2xl md:text-3xl font-light text-[#1A1A1A] mb-3 group-hover:italic transition-all">{t.title}</h3>
              {t.description && <p className="font-body text-sm text-[#7A7A7A] leading-relaxed mb-3">{t.description}</p>}
              {t.price_label && <p className="accent-label text-[#1A1A1A]">{t.price_label}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
