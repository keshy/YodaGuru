import {
  users, type User, type InsertUser,
  userPreferences, type UserPreferences, type InsertUserPreferences,
  festivals, type Festival, type InsertFestival,
  rituals, type Ritual, type InsertRitual,
  bhajans, type Bhajan, type InsertBhajan,
  contributions, type Contribution, type InsertContribution
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, update: Partial<User>): Promise<User | undefined>;

  // User preferences methods
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(id: number, update: Partial<UserPreferences>): Promise<UserPreferences | undefined>;

  // Festival methods
  getFestival(id: number): Promise<Festival | undefined>;
  getFestivalsByDate(date: Date): Promise<Festival[]>;
  getFestivalsByReligion(religion: string): Promise<Festival[]>;
  getAllFestivals(): Promise<Festival[]>;
  getUpcomingFestivals(religion: string, limit: number): Promise<Festival[]>;
  createFestival(festival: InsertFestival): Promise<Festival>;

  // Ritual methods
  getRitual(id: number): Promise<Ritual | undefined>;
  getRitualsByFestival(festivalId: number): Promise<Ritual[]>;
  getRitualsByReligion(religion: string): Promise<Ritual[]>;
  createRitual(ritual: InsertRitual): Promise<Ritual>;
  updateRitual(id: number, update: Partial<Ritual>): Promise<Ritual | undefined>;

  // Bhajan methods
  getBhajan(id: number): Promise<Bhajan | undefined>;
  getBhajansByFestival(festivalId: number): Promise<Bhajan[]>;
  createBhajan(bhajan: InsertBhajan): Promise<Bhajan>;

  // Contribution methods
  getContribution(id: number): Promise<Contribution | undefined>;
  getContributionsByUser(userId: number): Promise<Contribution[]>;
  createContribution(contribution: InsertContribution): Promise<Contribution>;
  updateContribution(id: number, update: Partial<Contribution>): Promise<Contribution | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userPreferences: Map<number, UserPreferences>;
  private festivals: Map<number, Festival>;
  private rituals: Map<number, Ritual>;
  private bhajans: Map<number, Bhajan>;
  private contributions: Map<number, Contribution>;
  
  private userIdCounter: number;
  private preferencesIdCounter: number;
  private festivalIdCounter: number;
  private ritualIdCounter: number;
  private bhajanIdCounter: number;
  private contributionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.userPreferences = new Map();
    this.festivals = new Map();
    this.rituals = new Map();
    this.bhajans = new Map();
    this.contributions = new Map();
    
    this.userIdCounter = 1;
    this.preferencesIdCounter = 1;
    this.festivalIdCounter = 1;
    this.ritualIdCounter = 1;
    this.bhajanIdCounter = 1;
    this.contributionIdCounter = 1;
    
    // Initialize with sample festival data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample festivals for Hinduism
    const diwali: InsertFestival = {
      name: "Diwali",
      description: "Diwali, the festival of lights, symbolizes the spiritual victory of light over darkness, good over evil, and knowledge over ignorance.",
      religion: "Hinduism",
      date: new Date("2023-11-12"),
      imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5",
      story: "According to Hindu mythology, Diwali commemorates the return of Lord Rama, his wife Sita, and brother Lakshmana to their kingdom Ayodhya after 14 years of exile and after defeating the demon king Ravana."
    };
    const govardhan: InsertFestival = {
      name: "Govardhan Puja",
      description: "Govardhan Puja is a Hindu festival to worship Govardhan Hill and celebrate the victory of Lord Krishna over Indra.",
      religion: "Hinduism",
      date: new Date("2023-10-26"),
      imageUrl: "https://images.unsplash.com/photo-1631265515161-7e561b874ee8",
      story: "According to Hindu scriptures, Lord Krishna protected the villagers of Vrindavan from a devastating rainstorm sent by the rain god Indra by lifting the Govardhan Hill."
    };
    const bhaiDooj: InsertFestival = {
      name: "Bhai Dooj",
      description: "Bhai Dooj is a festival celebrating the bond between brothers and sisters.",
      religion: "Hinduism",
      date: new Date("2023-10-29"),
      imageUrl: "https://images.unsplash.com/photo-1598303127949-c3c51f7b7826",
      story: "It is believed that Goddess Yamuna welcomed her brother Yama, the God of Death, with a tilak ceremony and by preparing a feast for him."
    };
    
    this.createFestival(diwali);
    this.createFestival(govardhan);
    this.createFestival(bhaiDooj);
    
    // Sample bhajans for Diwali
    const aarti: InsertBhajan = {
      title: "Lakshmi Aarti",
      description: "Traditional aarti for Goddess Lakshmi during Diwali celebrations",
      youtubeUrl: "https://www.youtube.com/watch?v=SampleLakshmiAarti",
      type: "Traditional",
      religion: "Hinduism",
      duration: "5:28",
      festivalId: 1 // Diwali
    };
    const omJaiJagdish: InsertBhajan = {
      title: "Om Jai Jagdish Hare",
      description: "Classical hymn dedicated to Lord Vishnu",
      youtubeUrl: "https://www.youtube.com/watch?v=SampleOmJaiJagdishHare",
      type: "Classical",
      religion: "Hinduism",
      duration: "7:12",
      festivalId: 1 // Diwali
    };
    
    this.createBhajan(aarti);
    this.createBhajan(omJaiJagdish);
    
    // Sample ritual for Diwali
    const diwaliPuja: InsertRitual = {
      festivalId: 1, // Diwali
      title: "Diwali Puja Vidhi",
      description: "Complete ritual procedure for Diwali Puja",
      content: "Detailed instructions for performing Diwali Puja at home",
      materials: [
        "A small statue or picture of Goddess Lakshmi and Lord Ganesha",
        "A red cloth to place the deities",
        "Incense sticks (agarbatti) and holder",
        "Camphor (kapur) and holder",
        "Ghee lamp or oil lamp with cotton wicks",
        "Gangajal (holy water) or clean water",
        "Roli (kumkum), haldi (turmeric), chandan (sandalwood paste)",
        "Akshat (rice grains mixed with turmeric)",
        "Flowers and garlands",
        "Sweets and fruits for offering (prasad)",
        "Bell (ghanti)",
        "Conch shell (shankh)"
      ],
      steps: JSON.stringify([
        "Begin by cleaning the puja area and taking a bath. Place a red cloth on a raised platform and arrange the idols.",
        "Light the incense sticks and the lamp. Invoke Lord Ganesha first to remove all obstacles.",
        "Offer water, akshata, flowers, and garlands to the deities while chanting their names.",
        "Light the lamp with ghee or oil and offer it to the deities.",
        "Recite the mantras and prayers for Goddess Lakshmi and Lord Ganesha.",
        "Offer sweets and fruits as prasad.",
        "Perform aarti with the lamp."
      ]),
      religion: "Hinduism",
      verified: true,
      contributorId: null
    };
    
    this.createRitual(diwaliPuja);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.googleId === googleId) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...update };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // User preferences methods
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    for (const pref of this.userPreferences.values()) {
      if (pref.userId === userId) {
        return pref;
      }
    }
    return undefined;
  }

  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const id = this.preferencesIdCounter++;
    const createdAt = new Date();
    const updatedAt = createdAt;
    const userPreferences: UserPreferences = { ...preferences, id, createdAt, updatedAt };
    this.userPreferences.set(id, userPreferences);
    return userPreferences;
  }

  async updateUserPreferences(id: number, update: Partial<UserPreferences>): Promise<UserPreferences | undefined> {
    const preferences = this.userPreferences.get(id);
    if (!preferences) return undefined;
    
    const updatedPreferences = { ...preferences, ...update, updatedAt: new Date() };
    this.userPreferences.set(id, updatedPreferences);
    return updatedPreferences;
  }

  // Festival methods
  async getFestival(id: number): Promise<Festival | undefined> {
    return this.festivals.get(id);
  }

  async getFestivalsByDate(date: Date): Promise<Festival[]> {
    // Simple date comparison (ignoring time component)
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return Array.from(this.festivals.values()).filter(festival => {
      const festivalDate = new Date(festival.date);
      festivalDate.setHours(0, 0, 0, 0);
      return festivalDate.getTime() === targetDate.getTime();
    });
  }

  async getFestivalsByReligion(religion: string): Promise<Festival[]> {
    return Array.from(this.festivals.values()).filter(
      festival => festival.religion.toLowerCase() === religion.toLowerCase()
    );
  }

  async getAllFestivals(): Promise<Festival[]> {
    return Array.from(this.festivals.values());
  }

  async getUpcomingFestivals(religion: string, limit: number): Promise<Festival[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.festivals.values())
      .filter(festival => {
        const festivalDate = new Date(festival.date);
        festivalDate.setHours(0, 0, 0, 0);
        return (
          festivalDate.getTime() >= today.getTime() && 
          festival.religion.toLowerCase() === religion.toLowerCase()
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }

  async createFestival(festival: InsertFestival): Promise<Festival> {
    const id = this.festivalIdCounter++;
    const createdAt = new Date();
    const newFestival: Festival = { ...festival, id, createdAt };
    this.festivals.set(id, newFestival);
    return newFestival;
  }

  // Ritual methods
  async getRitual(id: number): Promise<Ritual | undefined> {
    return this.rituals.get(id);
  }

  async getRitualsByFestival(festivalId: number): Promise<Ritual[]> {
    return Array.from(this.rituals.values()).filter(
      ritual => ritual.festivalId === festivalId
    );
  }

  async getRitualsByReligion(religion: string): Promise<Ritual[]> {
    return Array.from(this.rituals.values()).filter(
      ritual => ritual.religion.toLowerCase() === religion.toLowerCase()
    );
  }

  async createRitual(ritual: InsertRitual): Promise<Ritual> {
    const id = this.ritualIdCounter++;
    const createdAt = new Date();
    const newRitual: Ritual = { ...ritual, id, createdAt };
    this.rituals.set(id, newRitual);
    return newRitual;
  }

  async updateRitual(id: number, update: Partial<Ritual>): Promise<Ritual | undefined> {
    const ritual = this.rituals.get(id);
    if (!ritual) return undefined;
    
    const updatedRitual = { ...ritual, ...update };
    this.rituals.set(id, updatedRitual);
    return updatedRitual;
  }

  // Bhajan methods
  async getBhajan(id: number): Promise<Bhajan | undefined> {
    return this.bhajans.get(id);
  }

  async getBhajansByFestival(festivalId: number): Promise<Bhajan[]> {
    return Array.from(this.bhajans.values()).filter(
      bhajan => bhajan.festivalId === festivalId
    );
  }

  async createBhajan(bhajan: InsertBhajan): Promise<Bhajan> {
    const id = this.bhajanIdCounter++;
    const createdAt = new Date();
    const newBhajan: Bhajan = { ...bhajan, id, createdAt };
    this.bhajans.set(id, newBhajan);
    return newBhajan;
  }

  // Contribution methods
  async getContribution(id: number): Promise<Contribution | undefined> {
    return this.contributions.get(id);
  }

  async getContributionsByUser(userId: number): Promise<Contribution[]> {
    return Array.from(this.contributions.values()).filter(
      contribution => contribution.userId === userId
    );
  }

  async createContribution(contribution: InsertContribution): Promise<Contribution> {
    const id = this.contributionIdCounter++;
    const createdAt = new Date();
    const updatedAt = createdAt;
    const newContribution: Contribution = { ...contribution, id, createdAt, updatedAt };
    this.contributions.set(id, newContribution);
    return newContribution;
  }

  async updateContribution(id: number, update: Partial<Contribution>): Promise<Contribution | undefined> {
    const contribution = this.contributions.get(id);
    if (!contribution) return undefined;
    
    const updatedContribution = { ...contribution, ...update, updatedAt: new Date() };
    this.contributions.set(id, updatedContribution);
    return updatedContribution;
  }
}

// Use MemStorage for development if DATABASE_URL is not set
// export const storage = new MemStorage();

// Use DatabaseStorage for production
import { DatabaseStorage } from "./databaseStorage";
export const storage = new DatabaseStorage();
