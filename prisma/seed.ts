import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const events = [
  {
    title: "Pune Music Festival",
    category: "MUSIC",
    city: "Pune",
    dateTime: new Date("2026-10-18T18:30:00+05:30"),
    price: 499,
    description: "An evening of live music featuring talented local artists.",
    imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
    isActive: true,
  },
  {
    title: "Next.js Full Stack Workshop",
    category: "WORKSHOP",
    city: "Pune",
    dateTime: new Date("2026-10-20T10:00:00+05:30"),
    price: 799,
    description: "Hands-on workshop covering Next.js, APIs and databases.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    isActive: true,
  },
  {
    title: "Street Food Carnival",
    category: "FOOD",
    city: "Mumbai",
    dateTime: new Date("2026-10-24T17:00:00+05:30"),
    price: 199,
    description: "Explore delicious street food from across Maharashtra.",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    isActive: true,
  },
  {
    title: "Corporate Cricket Cup",
    category: "SPORTS",
    city: "Nashik",
    dateTime: new Date("2026-10-25T08:00:00+05:30"),
    price: 299,
    description: "A fun competitive cricket tournament for local teams.",
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da",
    isActive: true,
  },
  {
    title: "Kids Fun Day",
    category: "KIDS",
    city: "Pune",
    dateTime: new Date("2026-10-26T11:00:00+05:30"),
    price: 250,
    description: "Games, activities and entertainment for children.",
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9",
    isActive: true,
  },
  {
    title: "Acoustic Night",
    category: "MUSIC",
    city: "Ahmednagar",
    dateTime: new Date("2026-10-28T19:00:00+05:30"),
    price: 350,
    description: "A relaxing evening of acoustic performances.",
    imageUrl: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b",
    isActive: true,
  },
  {
    title: "Digital Marketing Workshop",
    category: "WORKSHOP",
    city: "Mumbai",
    dateTime: new Date("2026-10-30T14:00:00+05:30"),
    price: 999,
    description: "Learn practical digital marketing strategies.",
    imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72",
    isActive: true,
  },
  {
    title: "Maharashtra Food Expo",
    category: "FOOD",
    city: "Pune",
    dateTime: new Date("2026-11-01T12:00:00+05:30"),
    price: 150,
    description: "Taste traditional and modern food from Maharashtra.",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554",
    isActive: true,
  },
  {
    title: "Badminton Open",
    category: "SPORTS",
    city: "Aurangabad",
    dateTime: new Date("2026-11-05T09:00:00+05:30"),
    price: 399,
    description: "Open badminton competition for amateur players.",
    imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea",
    isActive: true,
  },
  {
    title: "Children's Art Workshop",
    category: "KIDS",
    city: "Nashik",
    dateTime: new Date("2026-11-07T10:30:00+05:30"),
    price: 299,
    description: "Creative drawing and painting activities for children.",
    imageUrl: "https://images.unsplash.com/photo-1561214115-f2f134cc4912",
    isActive: true,
  },
  {
    title: "Indie Bands Live",
    category: "MUSIC",
    city: "Mumbai",
    dateTime: new Date("2026-11-10T19:30:00+05:30"),
    price: 699,
    description: "Live performances by independent music bands.",
    imageUrl: "https://images.unsplash.com/photo-1524650359799-842906ca1c06",
    isActive: true,
  },
  {
    title: "AI for Developers Workshop",
    category: "WORKSHOP",
    city: "Pune",
    dateTime: new Date("2026-11-12T11:00:00+05:30"),
    price: 1200,
    description: "Learn practical AI integration techniques for applications.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    isActive: true,
  },
  {
    title: "Old City Food Walk",
    category: "FOOD",
    city: "Pune",
    dateTime: new Date("2026-09-20T18:00:00+05:30"),
    price: 450,
    description: "A guided walk exploring famous local food spots.",
    imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9",
    isActive: true,
  },
  {
    title: "Previous Tech Meetup",
    category: "WORKSHOP",
    city: "Mumbai",
    dateTime: new Date("2026-09-15T15:00:00+05:30"),
    price: 0,
    description: "A previous community technology meetup.",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
    isActive: true,
  },
  {
    title: "Monsoon Food Fest",
    category: "FOOD",
    city: "Pune",
    dateTime: new Date("2026-10-22T16:00:00+05:30"),
    price: 299,
    description: "A seasonal food festival with local favourites.",
    imageUrl: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f",
    isActive: false,
  },
];

async function main() {
  await prisma.event.deleteMany();

  for (const event of events) {
    await prisma.event.create({
      data: {
        ...event,
        category: event.category as
          | "MUSIC"
          | "WORKSHOP"
          | "FOOD"
          | "SPORTS"
          | "KIDS",
      },
    });
  }

  console.log(`Seeded ${events.length} events.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });