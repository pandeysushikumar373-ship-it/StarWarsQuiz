import { type SearchItem, type InsertSearchItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getSearchItems(): Promise<SearchItem[]>;
  addSearchItem(item: InsertSearchItem): Promise<SearchItem>;
}

export class MemStorage implements IStorage {
  private searchItems: SearchItem[];
  private nextId: number;

  constructor() {
    this.nextId = 11;
    this.searchItems = [
      { id: 1, title: "Coffee Culture: A Short History", description: "Explore coffee shops, origins and rituals across the world.", tags: ["coffee", "culture", "history"], date: "2024-12-02" },
      { id: 2, title: "Metaverse UX Patterns", description: "Design principles for immersive experiences and social spaces.", tags: ["ux", "metaverse", "design"], date: "2025-03-10" },
      { id: 3, title: "AI for Creators", description: "How small creators leverage AI to scale content workflow.", tags: ["ai", "creators", "productivity"], date: "2024-09-30" },
      { id: 4, title: "Street Food Guide", description: "A lovingly curated guide to the best street food in your city.", tags: ["food", "guide", "local"], date: "2023-05-20" },
      { id: 5, title: "Photography: Light & Mood", description: "Techniques to capture mood using natural and artificial light.", tags: ["photography", "camera", "light"], date: "2025-01-15" },
      { id: 6, title: "Cryptic Puzzles", description: "A book of puzzles to stretch your mind and patience.", tags: ["puzzles", "games", "brain"], date: "2022-11-01" },
      { id: 7, title: "Sustainable Architecture", description: "Design strategies that prioritize ecology and people.", tags: ["architecture", "sustainability"], date: "2024-06-14" },
      { id: 8, title: "Guide to Freelancing", description: "Practical advice for building a freelance career online.", tags: ["freelance", "career", "guide"], date: "2025-02-21" },
      { id: 9, title: "Gardening in Small Spaces", description: "How to grow a thriving garden on balconies and windowsills.", tags: ["gardening", "home", "plants"], date: "2023-07-09" },
      { id: 10, title: "Beginner's Guide to JavaScript", description: "Learn modern JavaScript fundamentals with hands-on examples.", tags: ["javascript", "programming", "guide"], date: "2025-04-02" },
    ];
  }

  async getSearchItems(): Promise<SearchItem[]> {
    return this.searchItems;
  }

  async addSearchItem(insertItem: InsertSearchItem): Promise<SearchItem> {
    const item: SearchItem = {
      ...insertItem,
      id: this.nextId++,
    };
    this.searchItems.push(item);
    return item;
  }
}

export const storage = new MemStorage();
