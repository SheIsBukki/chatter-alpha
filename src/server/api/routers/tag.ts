import { protectedProcedure, createTRPCRouter } from "../trpc";
import slugify from "slugify";
import { TRPCError } from "@trpc/server";
import { TagCreateSchema } from "@/components/lib/schema";

export const tagRouter = createTRPCRouter({
  createTag: protectedProcedure
    .input(
      TagCreateSchema
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const tag = await db.tag.findUnique({
        where: { name: input.name },
      });

      if (tag) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tag already exists!",
        });
      }

      await db?.tag.create({
        data: { ...input, slug: slugify(input.name) },
      });
    }),
  
  getTags: protectedProcedure.query(async ({ ctx: { db } }) => {
    return await db.tag.findMany()
  })
  
  
  
});
