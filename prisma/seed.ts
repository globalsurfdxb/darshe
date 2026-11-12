import { PrismaClient, EnquiryStatus } from "@prisma/client";

const db = new PrismaClient();

const day = 24 * 60 * 60 * 1000;
const now = Date.now();
const ago = (days: number, hours = 0) => new Date(now - days * day - hours * 60 * 60 * 1000);
const ahead = (days: number) => {
  const d = new Date(now + days * day);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// All sample rows use @example.com so re-seeding can replace them without touching real data.
const samples = [
  {
    fullName: "Aisha Rahman",
    occupation: "Working professional",
    email: "aisha.rahman@example.com",
    phone: "+971 50 123 4567",
    roomPreference: "Private room",
    moveInDate: ahead(14),
    lengthOfStay: "6–12 months",
    message: "I'm relocating from London for a new role in DIFC and would love to visit this week.",
    consent: true,
    status: EnquiryStatus.NEW,
    source: "instagram",
    createdAt: ago(0, 2),
  },
  {
    fullName: "Maria Santos",
    occupation: "Teacher",
    email: "maria.santos@example.com",
    phone: "+971 55 987 6543",
    roomPreference: "Shared room",
    moveInDate: ahead(30),
    lengthOfStay: "12 months +",
    message: null,
    consent: true,
    status: EnquiryStatus.NEW,
    source: null,
    createdAt: ago(1, 5),
  },
  {
    fullName: "Layla Hassan",
    occupation: "Student",
    email: "layla.hassan@example.com",
    phone: "050 765 4321",
    roomPreference: "Open to both",
    moveInDate: ahead(45),
    lengthOfStay: "3–6 months",
    message: "Is there a student rate? I start my masters in January.",
    consent: true,
    status: EnquiryStatus.CONTACTED,
    source: "google",
    createdAt: ago(3),
  },
  {
    fullName: "Priya Nair",
    occupation: "Working professional",
    email: "priya.nair@example.com",
    phone: "+971 52 222 3344",
    roomPreference: "Private room",
    moveInDate: ahead(7),
    lengthOfStay: "1–3 months",
    message: "Short-term project in Dubai Media City.",
    consent: true,
    status: EnquiryStatus.CLOSED,
    source: null,
    createdAt: ago(9),
  },
  {
    fullName: "Sofia Petrova",
    occupation: "Other",
    email: "sofia.petrova@example.com",
    phone: "+971 56 444 8899",
    roomPreference: "Shared room",
    moveInDate: ahead(21),
    lengthOfStay: "6–12 months",
    message: null,
    consent: true,
    status: EnquiryStatus.NEW,
    source: "friend-referral",
    createdAt: ago(5, 3),
  },
];

async function main() {
  const removed = await db.enquiry.deleteMany({ where: { email: { endsWith: "@example.com" } } });
  await db.enquiry.createMany({ data: samples });
  console.log(`Seeded ${samples.length} sample enquiries (replaced ${removed.count} earlier samples).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
