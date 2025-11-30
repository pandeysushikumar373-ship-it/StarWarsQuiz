import { z } from "zod";

export const searchItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  date: z.string(),
});

export const insertSearchItemSchema = searchItemSchema.omit({ id: true });

export type SearchItem = z.infer<typeof searchItemSchema>;
export type InsertSearchItem = z.infer<typeof insertSearchItemSchema>;

export const searchResultSchema = z.object({
  item: searchItemSchema,
  matches: z.array(z.object({
    key: z.string(),
    indices: z.array(z.tuple([z.number(), z.number()])),
  })).optional(),
  score: z.number().optional(),
});

export type SearchResult = z.infer<typeof searchResultSchema>;
