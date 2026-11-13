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
      </div>
    </section>
  );
}
