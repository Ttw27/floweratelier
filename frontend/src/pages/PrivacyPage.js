export default function PrivacyPage() {
  return (
    <div className="pt-28 pb-20 bg-[#FAFAF7]" data-testid="privacy-page">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <p className="accent-label mb-4"><span className="thin-rule" />Legal</p>
        <h1 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] mb-8">Privacy &amp; cookies</h1>

        <div className="prose prose-neutral max-w-none font-body text-[#1A1A1A]/90 leading-relaxed space-y-6 text-[15px]">
          <p>
            Flower Atelier (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is the data controller of any personal information you provide. We comply
            with the UK GDPR and the Privacy and Electronic Communications Regulations (PECR).
          </p>

          <h2 className="font-heading text-2xl text-[#1A1A1A] mt-10 mb-3">What we collect</h2>
          <p>
            Account details (name, email), contact details for delivery, order history, gift messages you write, photographs you upload
            for personalised boxes, and limited diagnostic data from your device (browser, IP region, page interactions).
          </p>

          <h2 className="font-heading text-2xl text-[#1A1A1A] mt-10 mb-3">Cookies &amp; tracking</h2>
          <p>
            Essential cookies are always on — they are needed for the cart, login and checkout to work. Analytics and marketing
            cookies (Google Analytics, Meta Pixel) are only loaded after you accept them via the consent banner. You can withdraw
            consent at any time by clearing your browser storage for this site.
          </p>

          <h2 className="font-heading text-2xl text-[#1A1A1A] mt-10 mb-3">How we use your data</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Fulfilling and delivering your order</li>
            <li>Answering enquiries and consultation requests</li>
            <li>Improving the site (anonymised analytics, only with consent)</li>
            <li>Marketing communications you have explicitly opted in to</li>
          </ul>

          <h2 className="font-heading text-2xl text-[#1A1A1A] mt-10 mb-3">Your rights</h2>
          <p>
            Under UK GDPR you have the right to access, correct, or delete your data, restrict processing, and complain to the ICO.
            Email <a className="underline" href="mailto:atelier@floweratelier.com">atelier@floweratelier.com</a> to exercise these rights.
          </p>

          <p className="text-sm text-[#7A7A7A] pt-8">Last updated: February 2026.</p>
        </div>
      </div>
    </div>
  );
}
