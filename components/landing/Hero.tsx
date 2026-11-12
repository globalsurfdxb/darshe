import Image from "next/image";

export function Hero() {
  return (
    <section id="top" className="section-y !pt-12 sm:!pt-16">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow">Co-living for working women · Dubai</p>
          <h1 className="text-[2.9rem] leading-[1.05] sm:text-6xl lg:text-[4.5rem]">
            Her Home,
            <br />
            <span className="italic text-terracotta">Her Haven.</span>
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-body-muted">
            Welcome to DarShe, a modern, all-inclusive home made exclusively for working women in
            Dubai. Thoughtfully designed rooms, daily housekeeping, laundry and nourishing
            home-style meals are all taken care of, so you can come home to calm, comfort and a
            community that truly gets you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#enquire" className="btn-primary">
              Find your place
            </a>
            <a href="#spaces" className="btn-outline">
              Explore the spaces
            </a>
          </div>
          <div className="mt-10 max-w-[34rem] border-t border-line pt-6">
            <p className="text-[0.95rem] leading-relaxed text-body-muted">
              <span className="font-display text-xl text-espresso">Dar</span> means &quot;home&quot;
              in Arabic. <span className="font-display text-xl text-espresso">She</span> is every
              woman who makes it her own.
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
          <div className="arch">
            <Image
              src="/images/hero.jpg"
              alt="A group of women embracing, dressed in warm neutral linens"
              fill
              priority
              sizes="(min-width: 1024px) 560px, (min-width: 640px) 520px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 left-1/2 w-[85%] -translate-x-1/2 rounded-2xl bg-card px-6 py-5 text-center shadow-[0_10px_30px_-12px_rgba(74,38,20,0.35)] sm:left-auto sm:right-[-1rem] sm:w-[19rem] sm:translate-x-0 sm:text-left">
            <p className="font-display text-xl text-espresso">Women-only residence</p>
            <p className="mt-1 text-sm text-body-muted">Safe, respectful and sisterly, by design.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
