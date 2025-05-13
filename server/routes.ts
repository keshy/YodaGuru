import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { z } from "zod";
import { insertUserSchema, insertPreferencesSchema, insertContributionSchema } from "@shared/schema";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as fs from 'fs';
import OpenAI from "openai";
import MemoryStoreFactory from 'memorystore';

// Setup OpenAI for document categorization
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Setup middleware for session
const setupSessionMiddleware = (app: Express) => {
  const MemoryStore = MemoryStoreFactory(session);
  app.use(session({
    cookie: { maxAge: 86400000 }, // 24 hours
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'spiritual-connect-secret'
  }));
};

// Setup auth middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Extract text from PDF
async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  // This is a placeholder for PDF parsing functionality
  // In a real implementation, we would use a library like pdf.js or pdfjs-dist
  return "Extracted PDF text would appear here";
}

// Categorize document using OpenAI
async function categorizeDocument(text: string): Promise<{ religion: string, festival: string }> {
  try {
    const prompt = `
      Analyze the following ritual document and identify:
      1. Which religion it belongs to (e.g., Hinduism, Buddhism, Christianity, etc.)
      2. Which festival or occasion it is associated with
      
      Text: ${text.substring(0, 1000)}
      
      Return the results in JSON format with "religion" and "festival" fields.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { religion: "Unknown", festival: "Unknown" };
    }
    
    const result = JSON.parse(content);
    return {
      religion: result.religion || "Unknown",
      festival: result.festival || "Unknown"
    };
  } catch (error) {
    console.error("Error categorizing document:", error);
    return { religion: "Unknown", festival: "Unknown" };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session
  setupSessionMiddleware(app);
  
  // Auth routes
  app.post('/api/auth/google', async (req, res) => {
    try {
      const { googleId, email, username, firstName, lastName, profilePicture } = req.body;
      
      // Check if user exists
      let user = await storage.getUserByGoogleId(googleId);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          googleId,
          email,
          username,
          firstName,
          lastName,
          profilePicture
        });
        
        // Set default preferences
        await storage.createUserPreferences({
          userId: user.id,
          primaryReligion: "Hinduism",
          secondaryInterests: [],
          languages: ["English"],
          festivalReminderDays: 3,
          notifyFestivals: true,
          notifyDailyContent: true,
          notifyNewContent: true,
          notifyCommunityUpdates: false,
          notifyEmails: true
        });
      }
      
      // Set session
      req.session.userId = user.id;
      
      res.status(200).json({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture
      });
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });
  
  app.get('/api/auth/session', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.status(200).json({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture
      });
    } catch (error) {
      console.error('Session error:', error);
      res.status(500).json({ message: "Session check failed" });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // User routes
  app.get('/api/user', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture
      });
    } catch (error) {
      console.error('User fetch error:', error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  app.put('/api/user', isAuthenticated, async (req, res) => {
    try {
      const { firstName, lastName } = req.body;
      
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const updatedUser = await storage.updateUser(req.session.userId, {
        firstName,
        lastName
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        profilePicture: updatedUser.profilePicture
      });
    } catch (error) {
      console.error('User update error:', error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Preferences routes
  app.get('/api/preferences', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const preferences = await storage.getUserPreferences(req.session.userId);
      
      if (!preferences) {
        return res.status(404).json({ message: "Preferences not found" });
      }
      
      res.status(200).json(preferences);
    } catch (error) {
      console.error('Preferences fetch error:', error);
      res.status(500).json({ message: "Failed to get preferences" });
    }
  });
  
  app.put('/api/preferences', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const prefSchema = insertPreferencesSchema.pick({
        primaryReligion: true,
        secondaryInterests: true,
        languages: true,
        festivalReminderDays: true,
        notifyFestivals: true,
        notifyDailyContent: true,
        notifyNewContent: true,
        notifyCommunityUpdates: true,
        notifyEmails: true
      });
      
      const validatedData = prefSchema.parse(req.body);
      
      let preferences = await storage.getUserPreferences(req.session.userId);
      
      if (!preferences) {
        // Create preferences if they don't exist
        preferences = await storage.createUserPreferences({
          userId: req.session.userId,
          ...validatedData
        });
      } else {
        // Update existing preferences
        preferences = await storage.updateUserPreferences(preferences.id, validatedData);
      }
      
      res.status(200).json(preferences);
    } catch (error) {
      console.error('Preferences update error:', error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });
  
  // Festival routes
  app.get('/api/festivals', async (req, res) => {
    try {
      const religion = req.query.religion as string;
      let festivals;
      
      if (religion) {
        festivals = await storage.getFestivalsByReligion(religion);
      } else {
        festivals = await storage.getAllFestivals();
      }
      
      res.status(200).json(festivals);
    } catch (error) {
      console.error('Festivals fetch error:', error);
      res.status(500).json({ message: "Failed to get festivals" });
    }
  });
  
  app.get('/api/festivals/today', async (req, res) => {
    try {
      const today = new Date();
      const festivals = await storage.getFestivalsByDate(today);
      
      res.status(200).json(festivals);
    } catch (error) {
      console.error('Today\'s festivals fetch error:', error);
      res.status(500).json({ message: "Failed to get today's festivals" });
    }
  });
  
  app.get('/api/festivals/upcoming', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const preferences = await storage.getUserPreferences(req.session.userId);
      
      if (!preferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }
      
      const limit = parseInt(req.query.limit as string) || 5;
      const festivals = await storage.getUpcomingFestivals(preferences.primaryReligion, limit);
      
      res.status(200).json(festivals);
    } catch (error) {
      console.error('Upcoming festivals fetch error:', error);
      res.status(500).json({ message: "Failed to get upcoming festivals" });
    }
  });
  
  app.get('/api/festivals/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const festival = await storage.getFestival(id);
      
      if (!festival) {
        return res.status(404).json({ message: "Festival not found" });
      }
      
      res.status(200).json(festival);
    } catch (error) {
      console.error('Festival fetch error:', error);
      res.status(500).json({ message: "Failed to get festival" });
    }
  });
  
  // Ritual routes
  app.get('/api/rituals/festival/:festivalId', async (req, res) => {
    try {
      const festivalId = parseInt(req.params.festivalId);
      const rituals = await storage.getRitualsByFestival(festivalId);
      
      res.status(200).json(rituals);
    } catch (error) {
      console.error('Rituals fetch error:', error);
      res.status(500).json({ message: "Failed to get rituals" });
    }
  });
  
  app.get('/api/rituals/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ritual = await storage.getRitual(id);
      
      if (!ritual) {
        return res.status(404).json({ message: "Ritual not found" });
      }
      
      res.status(200).json(ritual);
    } catch (error) {
      console.error('Ritual fetch error:', error);
      res.status(500).json({ message: "Failed to get ritual" });
    }
  });
  
  // Bhajan routes
  app.get('/api/bhajans/festival/:festivalId', async (req, res) => {
    try {
      const festivalId = parseInt(req.params.festivalId);
      const bhajans = await storage.getBhajansByFestival(festivalId);
      
      res.status(200).json(bhajans);
    } catch (error) {
      console.error('Bhajans fetch error:', error);
      res.status(500).json({ message: "Failed to get bhajans" });
    }
  });
  
  // Contribution routes
  app.get('/api/contributions', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const contributions = await storage.getContributionsByUser(req.session.userId);
      
      res.status(200).json(contributions);
    } catch (error) {
      console.error('Contributions fetch error:', error);
      res.status(500).json({ message: "Failed to get contributions" });
    }
  });
  
  app.post('/api/contributions', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { title, description, content, religion, festival } = req.body;
      
      const newContribution = await storage.createContribution({
        userId: req.session.userId,
        title,
        description,
        content,
        religion,
        festival,
        status: "pending",
        fileUrl: null
      });
      
      res.status(201).json(newContribution);
    } catch (error) {
      console.error('Contribution creation error:', error);
      res.status(500).json({ message: "Failed to create contribution" });
    }
  });
  
  // ElevenLabs voice synthesis route
  app.post('/api/synthesize', isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { text, voiceId } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Text is required" });
      }
      
      if (!process.env.ELEVENLABS_API_KEY) {
        return res.status(500).json({ 
          message: "ElevenLabs API key is not configured",
          success: false 
        });
      }
      
      // Call the ElevenLabs API
      const voice_id = voiceId || "21m00Tcm4TlvDq8ikWAM"; // Rachel voice is default
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', errorText);
        return res.status(response.status).json({ 
          message: "Error from ElevenLabs API", 
          success: false,
          details: errorText
        });
      }
      
      // Get the audio data from the response
      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
      
      res.status(200).json({ 
        message: "Voice synthesis successful",
        success: true,
        audioUrl
      });
    } catch (error) {
      console.error('Voice synthesis error:', error);
      res.status(500).json({ 
        message: "Failed to synthesize voice", 
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
