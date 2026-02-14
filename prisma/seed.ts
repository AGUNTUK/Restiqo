import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@restiqo.com" },
    update: {},
    create: {
      email: "admin@restiqo.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      phone: "+880 1700-000001",
    },
  });
  console.log("Created admin user:", admin.email);

  // Create demo user
  const userPassword = await bcrypt.hash("demo123", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@restiqo.com" },
    update: {},
    create: {
      email: "demo@restiqo.com",
      name: "Demo User",
      password: userPassword,
      role: "USER",
      phone: "+880 1700-000002",
    },
  });
  console.log("Created demo user:", demoUser.email);

  // Create host user
  const hostPassword = await bcrypt.hash("host123", 10);
  const hostUser = await prisma.user.upsert({
    where: { email: "host@restiqo.com" },
    update: {},
    create: {
      email: "host@restiqo.com",
      name: "Ahmed Rahman",
      password: hostPassword,
      role: "HOST",
      phone: "+880 1712-345678",
    },
  });
  console.log("Created host user:", hostUser.email);

  // Create host profile
  const hostProfile = await prisma.hostProfile.upsert({
    where: { userId: hostUser.id },
    update: {},
    create: {
      userId: hostUser.id,
      hostType: "APARTMENT",
      companyName: "Gulshan Properties Ltd.",
      description: "Premium apartment rentals in Dhaka",
      status: "APPROVED",
      totalRevenue: 0,
    },
  });
  console.log("Created host profile:", hostProfile.companyName);

  // Create properties
  const properties = [
    {
      hostId: hostProfile.id,
      name: "Luxury Apartment in Gulshan",
      type: "APARTMENT",
      city: "Dhaka",
      location: "Gulshan",
      address: "123 Gulshan Avenue, Gulshan 2, Dhaka 1212",
      description:
        "Experience luxury living in the heart of Dhaka's most prestigious neighborhood. This beautifully designed apartment offers stunning city views, modern amenities, and easy access to the best restaurants, shopping, and entertainment in Gulshan.",
      capacity: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      price: 150,
      amenities: JSON.stringify(["wifi", "ac", "kitchen", "parking", "pool", "gym", "security", "tv"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1522708323598-d08c74b8f0a2?w=800",
        "https://images.unsplash.com/photo-1560448204-e02f9c1d1150?w=800",
        "https://images.unsplash.com/photo-1502672290453-46166849d9a6?w=800",
      ]),
      latitude: 23.7925,
      longitude: 90.4078,
      rating: 4.8,
      reviewCount: 24,
      isFeatured: true,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Seaside Resort in Cox's Bazar",
      type: "RESORT",
      city: "Cox's Bazar",
      location: "Marine Drive",
      address: "456 Marine Drive, Cox's Bazar 4700",
      description:
        "Stunning seaside resort with ocean views, private beach access, and world-class facilities. Perfect for families and couples looking for a relaxing beach getaway.",
      capacity: 6,
      bedrooms: 3,
      beds: 3,
      bathrooms: 2,
      price: 250,
      amenities: JSON.stringify(["wifi", "pool", "beach", "restaurant", "spa", "parking"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        "https://images.unsplash.com/photo-1566073721258-4eaa1aa1a06c?w=800",
      ]),
      latitude: 21.4272,
      longitude: 92.0059,
      rating: 4.9,
      reviewCount: 56,
      isFeatured: true,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Boutique Hotel in Sylhet",
      type: "HOTEL",
      city: "Sylhet",
      location: "Zindabazar",
      address: "789 Zindabazar, Sylhet 3100",
      description:
        "Charming boutique hotel in the tea garden region with personalized service and authentic local cuisine.",
      capacity: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      price: 100,
      amenities: JSON.stringify(["wifi", "breakfast", "room-service", "parking"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1566073721258-4eaa1aa1a06c?w=800",
      ]),
      latitude: 24.8949,
      longitude: 91.8687,
      rating: 4.7,
      reviewCount: 18,
      isFeatured: false,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Hillside Cottage in Bandarban",
      type: "COTTAGE",
      city: "Bandarban",
      location: "Nilgiri",
      address: "Nilgiri Hill Top, Bandarban 4600",
      description:
        "Peaceful cottage in the hills with breathtaking mountain views and hiking trails nearby.",
      capacity: 8,
      bedrooms: 4,
      beds: 4,
      bathrooms: 3,
      price: 180,
      amenities: JSON.stringify(["wifi", "kitchen", "parking", "garden"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1518780664697-55e3ad93723fa?w=800",
      ]),
      latitude: 22.1953,
      longitude: 92.2184,
      rating: 4.6,
      reviewCount: 12,
      isFeatured: true,
      isVerified: false,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Heritage Guesthouse in Old Dhaka",
      type: "GUESTHOUSE",
      city: "Dhaka",
      location: "Old Dhaka",
      address: "321 Old City Street, Dhaka 1100",
      description:
        "Traditional guesthouse with authentic Bangladeshi architecture and local cuisine.",
      capacity: 3,
      bedrooms: 1,
      beds: 2,
      bathrooms: 1,
      price: 60,
      amenities: JSON.stringify(["wifi", "breakfast", "kitchen"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1555834830-8e6eb29570a3?w=800",
      ]),
      latitude: 23.7104,
      longitude: 90.4074,
      rating: 4.4,
      reviewCount: 8,
      isFeatured: false,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Beach Villa in Kuakata",
      type: "VILLA",
      city: "Kuakata",
      location: "Beach Road",
      address: "567 Beach Road, Kuakata 8600",
      description:
        "Private beachfront villa with stunning sunrise and sunset views over the Bay of Bengal.",
      capacity: 10,
      bedrooms: 5,
      beds: 5,
      bathrooms: 4,
      price: 350,
      amenities: JSON.stringify(["wifi", "pool", "beach", "kitchen", "parking", "garden"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1499793983623-e8bcb8bfc5e3?w=800",
      ]),
      latitude: 21.8167,
      longitude: 90.1167,
      rating: 4.9,
      reviewCount: 32,
      isFeatured: true,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "City View Apartment in Banani",
      type: "APARTMENT",
      city: "Dhaka",
      location: "Banani",
      address: "55 Road 11, Banani, Dhaka 1213",
      description:
        "Modern apartment with panoramic city views in the heart of Banani.",
      capacity: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      price: 120,
      amenities: JSON.stringify(["wifi", "ac", "kitchen", "parking", "gym"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1502672290453-46166849d9a6?w=800",
      ]),
      latitude: 23.7937,
      longitude: 90.4066,
      rating: 4.5,
      reviewCount: 15,
      isFeatured: false,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Riverside Resort in Sundarbans",
      type: "RESORT",
      city: "Khulna",
      location: "Sundarbans",
      address: "Sundarbans Entry Point, Khulna 9000",
      description:
        "Eco-friendly resort at the edge of the world's largest mangrove forest.",
      capacity: 6,
      bedrooms: 3,
      beds: 3,
      bathrooms: 2,
      price: 200,
      amenities: JSON.stringify(["wifi", "restaurant", "garden", "boat-tours"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1506905925146-9b3b6c4be0d1?w=800",
      ]),
      latitude: 22.5,
      longitude: 89.3333,
      rating: 4.7,
      reviewCount: 22,
      isFeatured: true,
      isVerified: true,
      status: "ACTIVE",
    },
  ];

  for (const property of properties) {
    await prisma.property.create({ data: property });
  }
  console.log(`Created ${properties.length} properties`);

  // Create tours
  const tours = [
    {
      hostId: hostProfile.id,
      name: "Sundarbans Adventure",
      location: "Sundarbans, Khulna",
      duration: "3 days, 2 nights",
      description:
        "Explore the world's largest mangrove forest, home to the Royal Bengal Tiger. This adventure includes boat cruises, wildlife safaris, and authentic local cuisine.",
      pricePerPerson: 350,
      maxGroupSize: 12,
      highlights: JSON.stringify([
        "Wildlife Safari",
        "Boat Cruise",
        "Royal Bengal Tiger Spotting",
        "Local Seafood",
        "Bird Watching",
        "Village Visit",
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1506905925146-9b3b6c4be0d1?w=800",
        "https://images.unsplash.com/photo-1544735728-9a64d7a667c7?w=800",
      ]),
      included: JSON.stringify([
        "Transportation from Dhaka",
        "All meals",
        "Boat accommodation",
        "Guide",
        "Entry permits",
      ]),
      excluded: JSON.stringify(["Personal expenses", "Tips", "Travel insurance"]),
      rating: 4.9,
      reviewCount: 42,
      isFeatured: true,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Sreemangal Tea Garden Tour",
      location: "Sreemangal, Sylhet",
      duration: "2 days, 1 night",
      description:
        "Discover the tea capital of Bangladesh. Visit lush tea gardens, Lawachara National Park, and experience tribal culture.",
      pricePerPerson: 180,
      maxGroupSize: 8,
      highlights: JSON.stringify([
        "Tea Garden Visit",
        "Lawachara National Park",
        "Tribal Village Experience",
        "Seven Layer Tea",
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1564890368449-1b3c853e1e1a?w=800",
      ]),
      included: JSON.stringify(["Transportation", "Accommodation", "Guide", "Tea tasting"]),
      excluded: JSON.stringify(["Meals", "Personal expenses"]),
      rating: 4.8,
      reviewCount: 28,
      isFeatured: true,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Cox's Bazar Beach Escape",
      location: "Cox's Bazar",
      duration: "3 days, 2 nights",
      description:
        "Experience the world's longest unbroken beach. Enjoy beach activities, visit Himchari National Park, and explore the vibrant local culture.",
      pricePerPerson: 250,
      maxGroupSize: 15,
      highlights: JSON.stringify([
        "World's Longest Beach",
        "Himchari National Park",
        "Inani Beach",
        "Seafood Feast",
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      ]),
      included: JSON.stringify(["Hotel accommodation", "Breakfast", "Local transportation", "Guide"]),
      excluded: JSON.stringify(["Lunch & Dinner", "Personal activities", "Tips"]),
      rating: 4.7,
      reviewCount: 56,
      isFeatured: true,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Bandarban Hill Adventure",
      location: "Bandarban, Chittagong Hill Tracts",
      duration: "4 days, 3 nights",
      description:
        "Trek through the beautiful hills of Bandarban. Visit Golden Temple, Nilgiri, and experience indigenous culture.",
      pricePerPerson: 300,
      maxGroupSize: 10,
      highlights: JSON.stringify([
        "Hill Trekking",
        "Golden Temple",
        "Nilgiri Sunrise",
        "Indigenous Culture",
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1518780664697-55e3ad93723fa?w=800",
      ]),
      included: JSON.stringify([
        "All transportation",
        "Resort accommodation",
        "All meals",
        "Trekking guide",
        "Entry fees",
      ]),
      excluded: JSON.stringify(["Personal shopping", "Tips"]),
      rating: 4.9,
      reviewCount: 34,
      isFeatured: false,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Old Dhaka Heritage Walk",
      location: "Old Dhaka",
      duration: "1 day",
      description:
        "Walk through the historic streets of Old Dhaka. Visit Lalbagh Fort, Ahsan Manzil, and taste authentic Bengali street food.",
      pricePerPerson: 50,
      maxGroupSize: 20,
      highlights: JSON.stringify([
        "Lalbagh Fort",
        "Ahsan Manzil",
        "Street Food Tour",
        "Local Markets",
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1596895331957-f493c81c6a3a?w=800",
      ]),
      included: JSON.stringify(["Guide", "Street food tasting", "Entry fees"]),
      excluded: JSON.stringify(["Transportation", "Personal shopping"]),
      rating: 4.6,
      reviewCount: 89,
      isFeatured: false,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Ratargul Swamp Forest Tour",
      location: "Sylhet",
      duration: "2 days, 1 night",
      description:
        "Explore Bangladesh's only freshwater swamp forest. Boat through submerged trees, visit Jaflong, and experience the natural beauty of Sylhet.",
      pricePerPerson: 160,
      maxGroupSize: 10,
      highlights: JSON.stringify([
        "Ratargul Swamp Forest",
        "Jaflong Stone Collection",
        "Boat Safari",
        "Tea Garden Visit",
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544735728-9a64d7a667c7?w=800",
      ]),
      included: JSON.stringify(["Transportation", "Boat ride", "Guide", "Accommodation"]),
      excluded: JSON.stringify(["Meals", "Personal expenses"]),
      rating: 4.7,
      reviewCount: 23,
      isFeatured: false,
      isVerified: false,
      status: "ACTIVE",
    },
  ];

  for (const tour of tours) {
    await prisma.tour.create({ data: tour });
  }
  console.log(`Created ${tours.length} tours`);

  // Create hotels
  const hotels = [
    {
      hostId: hostProfile.id,
      name: "Radisson Blu Dhaka Water Garden",
      type: "HOTEL",
      city: "Dhaka",
      location: "Airport Road",
      address: "Airport Road, Dhaka 1212",
      description:
        "5-star luxury hotel in the heart of Dhaka with stunning water gardens, world-class dining, and exceptional service. Features multiple restaurants, spa, fitness center, and outdoor pool.",
      capacity: 500,
      bedrooms: 200,
      beds: 300,
      bathrooms: 200,
      price: 180,
      amenities: JSON.stringify(["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Parking", "Breakfast", "Room Service"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1566073721258-4eaa1aa1a06c?w=800",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
      ]),
      latitude: 23.8507,
      longitude: 90.4004,
      rating: 4.8,
      reviewCount: 156,
      isFeatured: true,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Le Méridien Dhaka",
      type: "HOTEL",
      city: "Dhaka",
      location: "Gulshan",
      address: "79/A, Satmasjid Road, Gulshan 2, Dhaka 1212",
      description:
        "Contemporary luxury hotel in Gulshan with sophisticated rooms, multiple dining options, and modern amenities. Perfect for business and leisure travelers.",
      capacity: 300,
      bedrooms: 150,
      beds: 200,
      bathrooms: 150,
      price: 150,
      amenities: JSON.stringify(["WiFi", "Pool", "Restaurant", "Gym", "Parking", "Breakfast", "Spa"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      ]),
      latitude: 23.7925,
      longitude: 90.4078,
      rating: 4.7,
      reviewCount: 98,
      isFeatured: true,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Sea Pearl Beach Resort & Spa",
      type: "HOTEL",
      city: "Cox's Bazar",
      location: "Marine Drive",
      address: "Marine Drive, Cox's Bazar 4700",
      description:
        "Beachfront luxury resort with private beach access, infinity pool, and world-class spa. Enjoy stunning ocean views and direct beach access.",
      capacity: 400,
      bedrooms: 180,
      beds: 250,
      bathrooms: 180,
      price: 200,
      amenities: JSON.stringify(["WiFi", "Pool", "Beach", "Spa", "Restaurant", "Gym", "Parking"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      ]),
      latitude: 21.4272,
      longitude: 92.0059,
      rating: 4.9,
      reviewCount: 234,
      isFeatured: true,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "The Peninsula Chittagong",
      type: "HOTEL",
      city: "Chittagong",
      location: "GEC Circle",
      address: "88 GEC Circle, Chittagong 4000",
      description:
        "Premium business hotel in Chittagong with modern facilities, rooftop restaurant, and excellent service. Ideal for business travelers.",
      capacity: 200,
      bedrooms: 100,
      beds: 150,
      bathrooms: 100,
      price: 120,
      amenities: JSON.stringify(["WiFi", "Restaurant", "Gym", "Parking", "Breakfast", "Room Service"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
      ]),
      latitude: 22.3569,
      longitude: 91.7832,
      rating: 4.6,
      reviewCount: 67,
      isFeatured: false,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Grand Sultan Tea Resort",
      type: "HOTEL",
      city: "Sylhet",
      location: "Sreemangal",
      address: "Sreemangal Tea Garden, Sylhet 3210",
      description:
        "Luxury resort set amidst lush tea gardens. Experience tranquility, tea tasting, and nature walks in the tea capital of Bangladesh.",
      capacity: 150,
      bedrooms: 60,
      beds: 80,
      bathrooms: 60,
      price: 140,
      amenities: JSON.stringify(["WiFi", "Pool", "Restaurant", "Spa", "Garden", "Parking"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1564890368449-1b3c853e1e1a?w=800",
      ]),
      latitude: 24.3065,
      longitude: 91.7294,
      rating: 4.8,
      reviewCount: 89,
      isFeatured: true,
      isVerified: true,
      status: "ACTIVE",
    },
    {
      hostId: hostProfile.id,
      name: "Long Beach Hotel",
      type: "HOTEL",
      city: "Cox's Bazar",
      location: "Kolatoli",
      address: "Kolatoli Beach Road, Cox's Bazar 4700",
      description:
        "Modern beachfront hotel with direct beach access, rooftop infinity pool, and multiple dining options. Perfect for family vacations.",
      capacity: 350,
      bedrooms: 160,
      beds: 220,
      bathrooms: 160,
      price: 160,
      amenities: JSON.stringify(["WiFi", "Pool", "Beach", "Restaurant", "Gym", "Parking", "Breakfast"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      ]),
      latitude: 21.4395,
      longitude: 91.9878,
      rating: 4.7,
      reviewCount: 178,
      isFeatured: false,
      isVerified: true,
      status: "ACTIVE",
    },
  ];

  for (const hotel of hotels) {
    await prisma.property.create({ data: hotel });
  }
  console.log(`Created ${hotels.length} hotels`);

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });