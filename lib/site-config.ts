/**
 * Single source for every business detail used across the site.
 *
 * TODO before launch: replace the placeholder values marked below with the
 * real DarShe details. Nothing else in the codebase hard-codes these.
 */
export const siteConfig = {
  name: "DarShe",
  tagline: "Her Home, Her Haven.",

  // TODO: confirm the real public contact email (shown in the footer and on the survey error message).
  email: "hello@darshe.ae",

  // TODO: confirm the real phone / WhatsApp number.
  phone: "+971 4 000 0000",

  // TODO: confirm the real street address. The footer renders "{address}, Dubai, UAE".
  address: "Address to be confirmed",

  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const seo = {
  title: "DarShe — Her Home, Her Haven | Co-living for Working Women in Dubai",
  description:
    "DarShe is a women-only, all-inclusive co-living residence for working women in Dubai. Thoughtfully designed rooms, daily housekeeping, laundry, WiFi and home-style meals, in a safe and sisterly community.",
} as const;
