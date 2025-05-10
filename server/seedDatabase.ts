import { db } from "./db";
import { 
  users,
  userPreferences,
  festivals, 
  rituals, 
  bhajans,
  contributions
} from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  try {
    // First, clear existing data
    await db.delete(contributions);
    await db.delete(bhajans);
    await db.delete(rituals);
    await db.delete(userPreferences);
    await db.delete(festivals);
    await db.delete(users);
    
    console.log("Database cleared.");

    // Create a test user
    const [user] = await db.insert(users).values({
      username: "testuser",
      email: "test@example.com",
      googleId: "123456789",
      firstName: "Test",
      lastName: "User",
      createdAt: new Date()
    }).returning();
    
    console.log("Created user:", user.id);

    // Create user preferences
    await db.insert(userPreferences).values({
      userId: user.id,
      primaryReligion: "Hinduism",
      secondaryInterests: ["Buddhism", "Jainism"],
      languages: ["English", "Hindi"],
      festivalReminderDays: 3,
      notifyFestivals: true,
      notifyBhajans: true,
      notifyRituals: true,
      notifySMS: false,
      notifyEmails: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log("Created user preferences");

    // Create Hindu festivals
    const [diwali] = await db.insert(festivals).values({
      name: "Diwali",
      description: "Festival of lights celebrating the victory of light over darkness",
      religion: "Hinduism",
      date: new Date("2024-10-31"), // Diwali 2024
      imageUrl: "https://example.com/diwali.jpg",
      story: "Diwali celebrates Lord Rama's return to Ayodhya after defeating Ravana",
      createdAt: new Date()
    }).returning();
    
    const [navratri] = await db.insert(festivals).values({
      name: "Navratri",
      description: "Nine nights dedicated to the worship of Goddess Durga",
      religion: "Hinduism",
      date: new Date("2024-10-03"), // Navratri 2024 start
      imageUrl: "https://example.com/navratri.jpg",
      story: "Navratri celebrates the victory of Goddess Durga over the demon Mahishasura",
      createdAt: new Date()
    }).returning();
    
    const [holi] = await db.insert(festivals).values({
      name: "Holi",
      description: "Festival of colors celebrating the arrival of spring",
      religion: "Hinduism",
      date: new Date("2025-03-12"), // Holi 2025
      imageUrl: "https://example.com/holi.jpg",
      story: "Holi celebrates the divine love of Radha and Krishna, and the victory of good over evil",
      createdAt: new Date()
    }).returning();
    
    console.log("Created festivals");

    // Create rituals for Diwali
    await db.insert(rituals).values({
      title: "Lakshmi Puja",
      description: "Prayer to Goddess Lakshmi for prosperity and wealth",
      religion: "Hinduism",
      festivalId: diwali.id,
      content: "Detailed steps for performing Lakshmi Puja on Diwali",
      materials: ["Flowers", "Incense", "Ghee lamp", "Sweets", "Coins"],
      steps: JSON.stringify([
        "Clean and decorate your home",
        "Set up the puja thali",
        "Light the lamp and incense",
        "Offer flowers and sweets",
        "Recite Lakshmi mantras",
        "Perform aarti"
      ]),
      verified: true,
      contributorId: null,
      createdAt: new Date()
    });
    
    await db.insert(rituals).values({
      title: "Diwali Home Decoration",
      description: "Traditional ways to decorate home for Diwali",
      religion: "Hinduism",
      festivalId: diwali.id,
      content: "Guide for decorating your home for Diwali celebrations",
      materials: ["Rangoli colors", "Diyas", "Candles", "Flowers", "Fairy lights"],
      steps: JSON.stringify([
        "Clean the entire house thoroughly",
        "Create rangoli designs at the entrance",
        "Place diyas around the house",
        "Hang lights and lanterns",
        "Decorate with flowers and torans"
      ]),
      verified: true,
      contributorId: null,
      createdAt: new Date()
    });
    
    console.log("Created rituals");

    // Create bhajans for Diwali
    await db.insert(bhajans).values({
      title: "Om Jai Jagdish Hare",
      type: "Aarti",
      description: "Popular aarti sung during Diwali",
      religion: "Hinduism",
      festivalId: diwali.id,
      youtubeUrl: "https://www.youtube.com/watch?v=TXLrJ4zCcbI",
      duration: "5:30",
      createdAt: new Date()
    });
    
    await db.insert(bhajans).values({
      title: "Jai Lakshmi Mata",
      type: "Bhajan",
      description: "Devotional song dedicated to Goddess Lakshmi",
      religion: "Hinduism",
      festivalId: diwali.id,
      youtubeUrl: "https://www.youtube.com/watch?v=OBl4RzX2d9I",
      duration: "4:45",
      createdAt: new Date()
    });
    
    console.log("Created bhajans");

    // Create a contribution
    await db.insert(contributions).values({
      userId: user.id,
      title: "Navratri Garba Dance Steps",
      religion: "Hinduism",
      description: "Traditional Garba dance steps for Navratri celebrations",
      content: "A detailed guide on performing Garba dance during Navratri festival",
      status: "approved",
      fileUrl: "https://example.com/garba-guide.pdf",
      festival: "Navratri",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log("Created contributions");

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

seed();