import { 
  users, 
  userPreferences,
  festivals,
  rituals,
  bhajans,
  contributions,
  type User, 
  type InsertUser,
  type UserPreferences,
  type InsertUserPreferences,
  type Festival,
  type InsertFestival,
  type Ritual,
  type InsertRitual,
  type Bhajan,
  type InsertBhajan,
  type Contribution,
  type InsertContribution
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, sql, inArray } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User | undefined> {
    const updateData = { ...update };
    // Set updatedAt manually if it exists in the schema
    if ('updatedAt' in users) {
      Object.assign(updateData, { updatedAt: new Date() });
    }
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // User preferences methods
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences || undefined;
  }

  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [userPref] = await db
      .insert(userPreferences)
      .values(preferences)
      .returning();
    return userPref;
  }

  async updateUserPreferences(id: number, update: Partial<UserPreferences>): Promise<UserPreferences | undefined> {
    const updateData = { ...update };
    // Set updatedAt manually if it exists in the schema
    if ('updatedAt' in userPreferences) {
      Object.assign(updateData, { updatedAt: new Date() });
    }
    
    const [updatedPreferences] = await db
      .update(userPreferences)
      .set(updateData)
      .where(eq(userPreferences.id, id))
      .returning();
    return updatedPreferences || undefined;
  }

  // Festival methods
  async getFestival(id: number): Promise<Festival | undefined> {
    const [festival] = await db
      .select()
      .from(festivals)
      .where(eq(festivals.id, id));
    return festival || undefined;
  }

  async getFestivalsByDate(date: Date): Promise<Festival[]> {
    const dateStr = date.toISOString().split('T')[0];
    
    return db
      .select()
      .from(festivals)
      .where(
        sql`DATE(${festivals.date}) = DATE(${dateStr})`
      );
  }

  async getFestivalsByReligion(religion: string): Promise<Festival[]> {
    return db
      .select()
      .from(festivals)
      .where(eq(festivals.religion, religion));
  }

  async getAllFestivals(): Promise<Festival[]> {
    return db.select().from(festivals);
  }

  async getUpcomingFestivals(religion: string, limit: number): Promise<Festival[]> {
    const today = new Date();
    
    return db
      .select()
      .from(festivals)
      .where(
        and(
          eq(festivals.religion, religion),
          gte(festivals.date, today)
        )
      )
      .orderBy(festivals.date)
      .limit(limit);
  }

  async createFestival(festival: InsertFestival): Promise<Festival> {
    const [newFestival] = await db
      .insert(festivals)
      .values(festival)
      .returning();
    return newFestival;
  }

  // Ritual methods
  async getRitual(id: number): Promise<Ritual | undefined> {
    const [ritual] = await db
      .select()
      .from(rituals)
      .where(eq(rituals.id, id));
    return ritual || undefined;
  }

  async getRitualsByFestival(festivalId: number): Promise<Ritual[]> {
    return db
      .select()
      .from(rituals)
      .where(eq(rituals.festivalId, festivalId));
  }

  async getRitualsByReligion(religion: string): Promise<Ritual[]> {
    // First get festivals with the given religion
    const religionFestivals = await db
      .select()
      .from(festivals)
      .where(eq(festivals.religion, religion));
    
    // Get festival IDs
    const festivalIds = religionFestivals.map(festival => festival.id);
    
    if (festivalIds.length === 0) {
      return [];
    }
    
    // For each festival, get the rituals
    const results: Ritual[] = [];
    
    for (const festivalId of festivalIds) {
      const festivalRituals = await db
        .select()
        .from(rituals)
        .where(eq(rituals.festivalId, festivalId))
        .orderBy(desc(rituals.createdAt));
      
      results.push(...festivalRituals);
    }
    
    return results;
  }

  async createRitual(ritual: InsertRitual): Promise<Ritual> {
    const [newRitual] = await db
      .insert(rituals)
      .values(ritual)
      .returning();
    return newRitual;
  }

  async updateRitual(id: number, update: Partial<Ritual>): Promise<Ritual | undefined> {
    const updateData = { ...update };
    // Set updatedAt manually if it exists in the schema
    if ('updatedAt' in rituals) {
      Object.assign(updateData, { updatedAt: new Date() });
    }
    
    const [updatedRitual] = await db
      .update(rituals)
      .set(updateData)
      .where(eq(rituals.id, id))
      .returning();
    return updatedRitual || undefined;
  }

  // Bhajan methods
  async getBhajan(id: number): Promise<Bhajan | undefined> {
    const [bhajan] = await db
      .select()
      .from(bhajans)
      .where(eq(bhajans.id, id));
    return bhajan || undefined;
  }

  async getBhajansByFestival(festivalId: number): Promise<Bhajan[]> {
    return db
      .select()
      .from(bhajans)
      .where(eq(bhajans.festivalId, festivalId));
  }

  async createBhajan(bhajan: InsertBhajan): Promise<Bhajan> {
    const [newBhajan] = await db
      .insert(bhajans)
      .values(bhajan)
      .returning();
    return newBhajan;
  }

  // Contribution methods
  async getContribution(id: number): Promise<Contribution | undefined> {
    const [contribution] = await db
      .select()
      .from(contributions)
      .where(eq(contributions.id, id));
    return contribution || undefined;
  }

  async getContributionsByUser(userId: number): Promise<Contribution[]> {
    return db
      .select()
      .from(contributions)
      .where(eq(contributions.userId, userId))
      .orderBy(desc(contributions.createdAt));
  }

  async createContribution(contribution: InsertContribution): Promise<Contribution> {
    const [newContribution] = await db
      .insert(contributions)
      .values(contribution)
      .returning();
    return newContribution;
  }

  async updateContribution(id: number, update: Partial<Contribution>): Promise<Contribution | undefined> {
    const updateData = { ...update };
    // Set updatedAt manually if it exists in the schema
    if ('updatedAt' in contributions) {
      Object.assign(updateData, { updatedAt: new Date() });
    }
    
    const [updatedContribution] = await db
      .update(contributions)
      .set(updateData)
      .where(eq(contributions.id, id))
      .returning();
    return updatedContribution || undefined;
  }
}