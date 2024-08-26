import { z } from "zod";

export const TagCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
});

export const WriteFormSchema = z.object({
  title: z.string().min(20),
  description: z.string().min(60),
  html: z.string().min(100),
  markdown: z.string().min(100).optional(),
});

export const unsplashSearchRouteSchema = z.object({
  searchQuery: z.string().min(3),
});
