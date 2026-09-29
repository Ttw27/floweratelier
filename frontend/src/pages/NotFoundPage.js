import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="pt-32 pb-24 px-6 min-h-[70vh] bg-[#FAFAF7] flex items-center justify-center" data-testid="not-found-page">
      <Helmet>
        <title>Page not found — Flower Atelier</title>
        <meta name="robots" content="noindex,follow" />
      </Helmet>
      <div className="max-w-lg text-center">
        <p className="accent-label justify-center mb-6"><span className="thin-rule" />404</p>
        <h1 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] mb-5 tracking-tight">
          This page has <span className="italic text-[#B3A89B]">wilted.</span>
        </h1>
        <p className="font-body text-sm text-[#7A7A7A] leading-relaxed mb-10">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/"><Button className="btn-dark rounded-none py-5 px-8 w-full sm:w-auto" data-testid="not-found-home">Back to home</Button></Link>
          <Link to="/collection"><Button variant="outline" className="rounded-none py-5 px-8 w-full sm:w-auto">Shop the collection</Button></Link>
        </div>
      </div>
    </div>
  );
}
