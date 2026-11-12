import Image from "next/image";

export function Spaces() {
  return (
    <section id="spaces" className="scroll-mt-20 section-y">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">The spaces</p>
          <h2 className="text-4xl leading-tight sm:text-5xl">Rooms that feel like a deep breath.</h2>
          <p className="mt-6 text-lg leading-relaxed text-body-muted">
            Soft linens, terracotta warmth, sage greens and natural textures. Every DarShe space is
            designed to slow the pace of a busy city day, from calm private rooms to shared lounges
            made for long conversations and quiet evenings.
          </p>
        </div>

        <div className="mt-14 grid items-end gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <figure>
            <div className="arch">
              <Image
                src="/images/room-sage.jpg"
                alt="Bright twin room with white bedding, sage throws and a jute rug"
                fill
                sizes="(min-width: 1024px) 390px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 text-center font-display text-xl text-espresso">
              Thoughtfully designed rooms
            </figcaption>
          </figure>

          <figure className="lg:mb-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[24px]">
              <Image
                src="/images/lounge.jpg"
                alt="Terracotta lounge with rattan chairs, sage cushions and plants"
                fill
                sizes="(min-width: 1024px) 390px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 text-center font-display text-xl text-espresso">
              Shared lounges to unwind
            </figcaption>
          </figure>

          <figure className="sm:col-span-2 sm:mx-auto sm:w-1/2 lg:col-span-1 lg:mx-0 lg:w-auto">
            <div className="arch">
              <Image
                src="/images/room-cream.jpg"
                alt="Cream room with arched headboards and soft brown cushions"
                fill
                sizes="(min-width: 1024px) 390px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 text-center font-display text-xl text-espresso">
              Quiet corners to recharge
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
