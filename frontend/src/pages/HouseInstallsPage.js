import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const HERO = "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1800";

export default function HouseInstallsPage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/portfolio`, { params: { category: "house" } })
      .then((res) => setProjects(res.data))
      .catch(() => {});
  }, []);

  const programmes = [
    { name: "Weekly Programme", freq: "Every week", desc: "Ever-changing seasonal floral programme across principal rooms — arranged in your own vessels or ours.", price: "from £450 / week" },
    { name: "Fortnightly", freq: "Every two weeks", desc: "A refreshed edit across entrance, kitchen and dining rooms.", price: "from £295 / visit" },
    { name: "Occasion-Led", freq: "Per event", desc: "Bespoke installs for private dinners, anniversaries and at-home entertaining.", price: "from £850 / event" },
  ];

  return (
    <div className="pt-20" data-testid="house-installs-page">
      {/* Hero */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[70vh]">
          <div className="lg:col-span-5 flex items-center px-6 md:px-12 lg:px-16 py-16 lg:py-0 order-2 lg:order-1 bg-[#FAFAF7]">
            <div className="max-w-md">
              <p className="accent-label mb-8"><span className="thin-rule" />House Installs</p>
              <h1 className="font-heading text-5xl md:text-7xl font-light text-[#1A1A1A] leading-[0.95] tracking-tight mb-10" data-testid="house-title">
                Your home,<br />in <span className="italic text-[#B3A89B]">season.</span>
              </h1>
              <p className="font-body text-base text-[#7A7A7A] leading-relaxed mb-10">
                Private residence floral programmes — weekly, fortnightly or occasion-led.
                Discreet access, trusted keys, your home always in its finest edit.
              </p>
              <Link to="/consultation?service=house">
                <Button className="btn-dark rounded-none inline-flex items-center gap-3" data-testid="house-enquire">
                  Discuss a programme <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 h-[55vh] lg:h-auto">
            <img src={HERO} alt="House floral installation" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-t border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-5"><span className="thin-rule" />Programmes</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-16 max-w-3xl">
            Three cadences.<br /><span className="italic">One standard.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {programmes.map((p, idx) => (
              <div key={idx} className="bg-white border border-[#E5E5E5] p-10" data-testid={`house-programme-${idx}`}>
                <p className="accent-label mb-4 text-[#B3A89B]">{p.freq}</p>
                <h3 className="font-heading text-3xl font-light text-[#1A1A1A] mb-4">{p.name}</h3>
                <p className="font-body text-sm text-[#7A7A7A] leading-relaxed mb-6">{p.desc}</p>
                <p className="accent-label text-[#1A1A1A]">{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 md:py-32 px-6 md:px-12 paper-accent">
        <div className="max-w-[1400px] mx-auto">
          <p className="accent-label mb-5"><span className="thin-rule" />How it works</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-16 max-w-3xl">
            Seamless,<br /><span className="italic">invisible.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {[
              { step: "01", title: "Home Survey", desc: "Visit or video tour to understand your rooms, taste and scheduling." },
              { step: "02", title: "Seasonal Plan", desc: "A 12-month palette and cadence, reviewed quarterly." },
              { step: "03", title: "Discreet Delivery", desc: "Trusted key-holder access; installation between 8am–11am." },
              { step: "04", title: "Quiet Continuity", desc: "A single point of contact, always." },
            ].map((s) => (
              <div key={s.step}>
                <p className="font-heading text-6xl font-light text-[#B3A89B] mb-4">{s.step}</p>
                <h3 className="font-heading text-2xl font-light text-[#1A1A1A] mb-3">{s.title}</h3>
                <p className="font-body text-sm text-[#7A7A7A] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selected residences */}
      {projects.length > 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12 border-t border-[#E5E5E5]">
          <div className="max-w-[1400px] mx-auto">
            <p className="accent-label mb-5"><span className="thin-rule" />Selected Residences</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-[#1A1A1A] mb-16">Past installations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {projects.slice(0, 2).map((item) => (
                <Link key={item.id} to={`/consultation?service=house&portfolio_item_id=${item.id}&ref_title=${encodeURIComponent(item.title)}`} className="group block" data-testid={`house-project-${item.id}`}>
                  <div className="aspect-[4/3] image-hover-container mb-5 bg-[#F2EFEB]">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="accent-label mb-2">{item.location}</p>
                  <h3 className="font-heading text-2xl font-light text-[#1A1A1A] group-hover:italic transition-all">{item.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="accent-label mb-8"><span className="thin-rule" />Discuss</p>
          <h2 className="font-heading text-4xl md:text-6xl font-light text-[#1A1A1A] leading-[1.05] mb-12">
            A quiet house<br /><span className="italic">in perpetual bloom.</span>
          </h2>
          <Link to="/consultation?service=house"><Button className="btn-dark rounded-none">Begin a house programme</Button></Link>
        </div>
      </section>
    </div>
  );
}
