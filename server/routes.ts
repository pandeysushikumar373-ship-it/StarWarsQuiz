import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSearchItemSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/items", (req, res) => {
    res.set({
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "ETag": "items-v1",
    });
    
    storage.getSearchItems().then(items => {
      res.json(items);
    }).catch(err => {
      res.status(500).json({ error: "Failed to fetch items" });
    });
  });

  app.post("/api/items", async (req, res) => {
    try {
      const parsed = insertSearchItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid item data" });
        return;
      }
      const item = await storage.addSearchItem(parsed.data);
      res.set("Cache-Control", "no-cache");
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create item" });
    }
  });

  return httpServer;
}
