import Image from "next/image";

const imageCards = [
  {
    title: "Home-style meals",
    body: "Nutritious, freshly prepared food that tastes like a home kitchen, because it is one.",
    src: "/images/meals.jpg",
    alt: "Fresh ingredients being prepared at a kitchen table",
  },
  {
    title: "Daily housekeeping",
    body: "Come home to a fresh, cared-for space, every single day.",
    src: "/images/housekeeping.jpg",
    alt: "Smiling housekeeper holding fresh folded towels",
  },
  {
    title: "Space to rest",
    body: "A serene environment built around rest, reliability and the routines that keep you well.",
    src: "/images/wellness.jpg",
    alt: "A woman stretching in soft afternoon light",
  },
  {
    title: "A real community",
    body: "Shared dinners and gatherings where friendships form naturally and no one feels like a stranger for long.",
    src: "/images/dining.jpg",
    alt: "Women laughing together around a long dinner table",
  },
];

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-8 w-8",
  "aria-hidden": true,
  focusable: false,
};

const features = [
  {
    title: "Laundry included",
    body: "One less chore on your list, and more time for yourself.",
    icon: (
      <svg {...iconProps}>
        <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
        <circle cx="12" cy="14" r="4.5" />
        <path d="M7.5 6h.01M10.5 6h.01" />
      </svg>
    ),
  },
  {
    title: "WiFi that never fails",
    body: "Reliable connectivity for work, study and every call home.",
    icon: (
      <svg {...iconProps}>
        <path d="M2.5 9.5a14 14 0 0 1 19 0" />
        <path d="M5.5 13a9.5 9.5 0 0 1 13 0" />
        <path d="M8.7 16.3a5 5 0 0 1 6.6 0" />
        <path d="M12 20h.01" />
      </svg>
    ),
  },
  {
    title: "Safe, women-only living",
    body: "Peace of mind, built into every detail of your home.",
    icon: (
      <svg {...iconProps}>
        <path d="M12 2.5l8 3v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10v-6l8-3z" />
        <path d="M8.5 12l2.5 2.5 4.5-5" />
      </svg>
    ),
  },
];

export function Included() {
  return (
    <section id="included" className="on-dark scroll-mt-20 bg-terracotta section-y text-card">
      <div className="container-page">
        <div data-reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow !text-card">All-inclusive living</p>
          <h2 className="!text-card text-4xl leading-tight sm:text-5xl">Curated comfort, taken care of.</h2>
          <p className="mt-6 text-lg leading-relaxed">
            Life in Dubai moves fast. At DarShe, the everyday essentials are handled for you, so
            your energy can go to the things that matter most.
          </p>
        </div>

        <ul data-stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {imageCards.map((c) => (
            <li key={c.title} className="overflow-hidden rounded-3xl bg-card text-ink">
              <div className="relative aspect-[4/3]">
                <Image
                  src={c.src}
                  alt={c.alt}
                  fill
                  sizes="(min-width: 1024px) 290px, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl">{c.title}</h3>
                <p className="mt-2 leading-relaxed text-body-muted">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <ul data-stagger className="mt-6 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <li key={f.title} className="rounded-3xl border border-card/60 p-7">
              <span className="text-card">{f.icon}</span>
              <h3 className="mt-4 text-2xl !text-card">{f.title}</h3>
              <p className="mt-2 leading-relaxed">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
