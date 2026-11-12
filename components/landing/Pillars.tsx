const pillars = [
  {
    label: "Purpose",
    title: "Safe, beautiful, empowering.",
    body: "We create living spaces for working women in Dubai where security and beauty are the starting point, never the upgrade.",
  },
  {
    label: "Promise",
    title: "Respected, supported, at home.",
    body: "Comfortable, community-driven co-living, cared for with the warmth of boutique hospitality.",
  },
  {
    label: "Personality",
    title: "Warm, modern, sisterly.",
    body: "Confident and contemporary, with deep respect for culture and for every woman who calls DarShe home.",
  },
];

export function Pillars() {
  return (
    <section aria-label="Purpose, promise and personality" className="on-dark bg-brown py-16 text-card sm:py-20">
      <div data-stagger className="container-page grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-14">
        {pillars.map((p) => (
          <div key={p.label} className="border-t border-card/30 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-card/85">{p.label}</p>
            <h2 className="mt-3 !text-card text-3xl leading-snug">{p.title}</h2>
            <p className="mt-4 leading-relaxed text-card/90">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
