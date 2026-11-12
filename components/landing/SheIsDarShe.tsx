import Image from "next/image";
import Link from "next/link";

const statements = [
  "She who wants safety, comfort and WiFi that never fails.",
  "She who values rest and reliability.",
  "She who is balancing ambition and independence.",
  "She who is seeking inspiration and affordable, chic living.",
];

export function SheIsDarShe() {
  return (
    <section id="she" className="scroll-mt-20 bg-blush section-y">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div data-reveal>
          <p className="eyebrow !text-espresso">Who it&apos;s for</p>
          <h2 className="text-4xl leading-tight sm:text-5xl lg:text-6xl">She is DarShe.</h2>
          <p className="mt-6 text-lg leading-relaxed text-body-muted">
            She might be a young professional starting her first role in Dubai, an expat settling
            into a new city, a teacher, or a student finding her feet. Between 22 and 40, she is
            looking for independence without isolation, and modern living that feels safe,
            affordable and aspirational.
          </p>

          <ul className="mt-8 border-t border-espresso/25">
            {statements.map((s) => (
              <li
                key={s}
                className="border-b border-espresso/25 py-4 font-display text-xl leading-snug text-espresso sm:text-2xl"
              >
                {s}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-lg text-espresso">
            If this sounds like you, there&apos;s a place waiting for you here.
          </p>
          <Link href="/survey" className="btn-primary mt-6">
            Sound like you? Take the survey
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[520px] lg:max-w-none">
          <div className="arch">
            <Image
              data-arch-img
              src="/images/she-is-darshe.jpg"
              alt="Illustration of a diverse group of women standing close together"
              fill
              sizes="(min-width: 1024px) 560px, (min-width: 640px) 520px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
