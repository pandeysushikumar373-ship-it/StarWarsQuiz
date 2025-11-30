import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSearchItemSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all search items
  app.get("/api/items", async (req, res) => {
    try {
      const items = await storage.getSearchItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  // Add new search item
  app.post("/api/items", async (req, res) => {
    try {
      const parsed = insertSearchItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid item data" });
        return;
      }
      const item = await storage.addSearchItem(parsed.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create item" });
    }
  });

  return httpServer;
}
