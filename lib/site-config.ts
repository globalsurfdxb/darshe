/**
 * Single source for every business detail used across the site.
 *
 * TODO before launch: replace the placeholder values marked below with the
 * real DarShe details. Nothing else in the codebase hard-codes these.
 */
export const siteConfig = {
  name: "DarShe",
  tagline: "Her Home, Her Haven.",

  // Public contact email (shown in the footer and on the survey error message).
  email: "hello@darshe.org",

  // Location shown in the footer. Only the city and country are published, no street address.
  location: "Dubai, UAE",

  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const seo = {
  title: "DarShe — Her Home, Her Haven | Co-living for Working Women in Dubai",
  description:
    "DarShe is a women-only, all-inclusive co-living residence for working women in Dubai. Thoughtfully designed rooms, daily housekeeping, laundry, WiFi and home-style meals, in a safe and sisterly community.",
} as const;
