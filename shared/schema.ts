import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  googleId: true,
  firstName: true,
  lastName: true,
  profilePicture: true,
});

// User preferences model
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  primaryReligion: text("primary_religion").notNull(),
  secondaryInterests: text("secondary_interests").array(),
  languages: text("languages").array(),
  festivalReminderDays: integer("festival_reminder_days").default(1),
  notifyFestivals: boolean("notify_festivals").default(true),
  notifyDailyContent: boolean("notify_daily_content").default(true),
  notifyNewContent: boolean("notify_new_content").default(true),
  notifyCommunityUpdates: boolean("notify_community_updates").default(false),
  notifyEmails: boolean("notify_emails").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  primaryReligion: true,
  secondaryInterests: true,
  languages: true,
  festivalReminderDays: true,
  notifyFestivals: true,
  notifyDailyContent: true,
  notifyNewContent: true,
  notifyCommunityUpdates: true,
  notifyEmails: true,
});

// Festival model
export const festivals = pgTable("festivals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  religion: text("religion").notNull(),
  date: timestamp("date").notNull(),
  imageUrl: text("image_url"),
  story: text("story"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFestivalSchema = createInsertSchema(festivals).pick({
  name: true,
  description: true,
  religion: true,
  date: true,
  imageUrl: true,
  story: true,
});

// Ritual model
export const rituals = pgTable("rituals", {
  id: serial("id").primaryKey(),
  festivalId: integer("festival_id").references(() => festivals.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  materials: text("materials").array(),
  steps: jsonb("steps").notNull(),
  religion: text("religion").notNull(),
  verified: boolean("verified").default(false),
  contributorId: integer("contributor_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRitualSchema = createInsertSchema(rituals).pick({
  festivalId: true,
  title: true,
  description: true,
  content: true,
  materials: true,
  steps: true,
  religion: true,
  verified: true,
  contributorId: true,
});

// Music/Bhajan model
export const bhajans = pgTable("bhajans", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  youtubeUrl: text("youtube_url").notNull(),
  type: text("type").notNull(),
  religion: text("religion").notNull(),
  duration: text("duration"),
  festivalId: integer("festival_id").references(() => festivals.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBhajanSchema = createInsertSchema(bhajans).pick({
  title: true,
  description: true,
  youtubeUrl: true,
  type: true,
  religion: true,
  duration: true,
  festivalId: true,
});

// User contributions model
export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  content: text("content"),
  religion: text("religion").notNull(),
  festival: text("festival"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContributionSchema = createInsertSchema(contributions).pick({
  userId: true,
  title: true,
  description: true,
  fileUrl: true,
  content: true,
  religion: true,
  festival: true,
  status: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertPreferencesSchema>;

export type Festival = typeof festivals.$inferSelect;
export type InsertFestival = z.infer<typeof insertFestivalSchema>;

export type Ritual = typeof rituals.$inferSelect;
export type InsertRitual = z.infer<typeof insertRitualSchema>;

export type Bhajan = typeof bhajans.$inferSelect;
export type InsertBhajan = z.infer<typeof insertBhajanSchema>;

export type Contribution = typeof contributions.$inferSelect;
export type InsertContribution = z.infer<typeof insertContributionSchema>;
