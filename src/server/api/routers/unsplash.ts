import { protectedProcedure, createTRPCRouter } from "@/server/api/trpc";
import { createApi } from "unsplash-js";
import { env } from "@/env";
import { TRPCError } from "@trpc/server";
import { unsplashSearchRouteSchema } from "@/components/lib/schema";

const unsplash = createApi({
  accessKey: env.UNSPLASH_API_ACCESS_KEY,
});

export const unsplashRouter = createTRPCRouter({
  getImages: protectedProcedure
    .input(unsplashSearchRouteSchema)
    .query(async ({ input: { searchQuery } }) => {
      try {
        const imagesData = await unsplash.search.getPhotos({
          query: searchQuery,
          orientation: "landscape",
          perPage: 12,
        });

        return imagesData.response;
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unsplash API search failed",
        });
      }
    }),
});
