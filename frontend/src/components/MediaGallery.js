import { useMemo, useState } from "react";
import { Play } from "lucide-react";

const isYouTube = (url = "") => /youtu\.?be/.test(url);
const isVimeo = (url = "") => /vimeo\.com/.test(url);

const ytEmbed = (url) => {
  const m = url.match(/(?:v=|youtu\.be\/)([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : url;
};
const vimeoEmbed = (url) => {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? `https://player.vimeo.com/video/${m[1]}` : url;
};

/**
 * Bloom & Wild-style gallery: large main view + 4-5 thumbnails (left rail on desktop, scrollable on mobile).
 * Supports image, direct video URL, YouTube and Vimeo embeds.
 *
 * media: [{ type: "image" | "video", url, thumbnail?, source?: "upload"|"external" }]
 * If media is empty, falls back to product.images.
 */
export default function MediaGallery({ media, fallbackImages = [], productName = "" }) {
  const items = useMemo(() => {
    if (Array.isArray(media) && media.length > 0) return media;
    return fallbackImages.map((url) => ({ type: "image", url }));
  }, [media, fallbackImages]);

  const [active, setActive] = useState(0);
  if (items.length === 0) return null;

  const current = items[active];
  const isVideo = current.type === "video";

  return (
    <div className="lg:sticky lg:top-28 lg:self-start" data-testid="product-media-gallery">
      <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4">
        {/* Thumbnails */}
        <div className="flex md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-visible md:w-20 shrink-0">
          {items.slice(0, 5).map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative shrink-0 w-16 h-16 md:w-full md:aspect-square overflow-hidden bg-[#F2EFEB] border ${active === i ? "border-[#1A1A1A]" : "border-transparent hover:border-[#B3A89B]"} transition-colors`}
              data-testid={`gallery-thumb-${i}`}
              aria-label={`Show media ${i + 1}`}
            >
              <img
                src={m.thumbnail || m.url}
                alt={`${productName} ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.opacity = 0.4; }}
              />
              {m.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play size={14} className="text-white" />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main viewer */}
        <div className="flex-1">
          <div className="aspect-[4/5] md:aspect-[4/5] bg-[#F2EFEB] overflow-hidden relative" data-testid="gallery-main-viewer">
            {isVideo ? (
              isYouTube(current.url) ? (
                <iframe
                  className="w-full h-full"
                  src={ytEmbed(current.url)}
                  title={productName}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isVimeo(current.url) ? (
                <iframe
                  className="w-full h-full"
                  src={vimeoEmbed(current.url)}
                  title={productName}
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={current.url}
                  poster={current.thumbnail}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <img src={current.url} alt={productName} className="w-full h-full object-cover" data-testid="gallery-main-image" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
