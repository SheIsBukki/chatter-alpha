import { z } from "zod";
import { decode } from "base64-arraybuffer";
import isDataURI from "validator/lib/isDataURI";
import { protectedProcedure, publicProcedure, createTRPCRouter } from "@/server/api/trpc";
import type { tagObjectType } from "@/components/lib/definitions";
import { TRPCError } from "@trpc/server";
import { supabase } from "@/pages/user/[username]";

export const userRouter = createTRPCRouter({
  getUserProfile: publicProcedure
    .input(z.object({ username: z.string().optional(), userId: z.string().optional() }))
    .query(async ({ ctx: { db, session }, input: { username } }) => {
      return await db.user.findUnique({
        where: {
          username: username,
        },
        select: {
          name: true,
          id: true,
          username: true,
          image: true,
          created_at: true,
          _count: {
            select: { articles: true, followedBy: true, following: true },
          },
          followedBy: session?.user?.id ? {where: {id: session.user.id}} : false,
        },
      });
    }),

  getUserArticles: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx: { db, session }, input: { username } }) => {
      return await db.user.findUnique({
        where: { username: username },
        select: {
          articles: {
            select: {
              id: true,
              title: true,
              featured_image: true,
              slug: true,
              description: true,
              created_at: true,
              updated_at: true,
              author: { select: { name: true, image: true, username: true } },
              bookmarks: session?.user?.id
                ? { where: { userId: session?.user?.id } }
                : false,
              comments: session?.user?.id
                ? { where: { userId: session?.user?.id } }
                : false,
              tags: {
                select: { name: true, id: true, description: true, slug: true },
              },
              // tags: true,
              likes: true,
              _count: {
                select: {
                likes: true, comments: true, bookmarks: true,
              }}
            },
            orderBy: { created_at: "desc" },
          },
        },
      });
    }),

  uploadAvatar: protectedProcedure
    .input(
      z.object({
        imageAsDataUrl: z.string().refine((val) => isDataURI(val)),
        mimetype: z.string(), // Because png will suffice
        username: z.string(),
      })
    )
    .mutation(async ({ ctx: { db, session }, input }) => {

      // image here is a base64 encoded data URL, it's not a base64 string, so the actual base64 string will be extracted from it
      //  check mdn DATA URL scheme page to learn more
      // the regex will remove the "data:image/jpeg;base64,"

      const imageBase64Str = input.imageAsDataUrl.replace(/^.+,/, "");
      console.log(decode(imageBase64Str));

      const { data, error } = await supabase.storage
        .from("public")
        .upload(`avatars/${input.username}.png`, decode(imageBase64Str), {
          contentType: "image/png",
          upsert: true,
        });
      console.log({ data, error });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "upload to supabase failed",
        });
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(data?.path);
      console.log(publicUrl);

      await db.user.update({
        where: { id: session?.user.id },
        data: { image: publicUrl },
      });
    }),

  getSuggestions: protectedProcedure.query(
    async ({ ctx: { db, session } }) => {
      // This will generate an array of users, those users will have liked, commented or bookmarked the same articles.

      // This can also work by extracting the tags each user has ever interacted with —— getting users who have interacted with articles that have the same tags

      const tagQuery = {
        where: { userId: session.user.id },
        select: { article: { select: { tags: { select: { name: true } } } } },
        take: 10,
      };

      const likedArticleTags = await db.like.findMany(tagQuery);

      const bookmarkedArticleTags = await db.bookmark.findMany(tagQuery);

      const commentedArticleTags = await db.comment.findMany(tagQuery);

      const interestedTags: string[] = [];

      const pushedTags = (tagObject: tagObjectType, tagArray: string[]) => {
        tagArray.push(...tagObject.article.tags.map((tag) => tag.name));
      };

      likedArticleTags.forEach((likeTag) => {
        pushedTags(likeTag, interestedTags);
      });

      bookmarkedArticleTags.forEach((bookmarkTag) => {
        pushedTags(bookmarkTag, interestedTags);
      });

      commentedArticleTags.forEach((commentTag) => {
        pushedTags(commentTag, interestedTags);
      });

      // This is here so that i won't forogt  how to push the tags collected from likes, bookmarks and comments without using this approach with the pushedTags function. I will have to create code below for bookmarks and comments
      // likedArticleTags.forEach((likeTag) => {
      //   interestedTags.push(...likeTag.article.tags.map((tag) => tag.name));
      // });

      const suggestionsQueryObject = {
        some: {
          article: { tags: { some: { name: { in: interestedTags } } } },
        },
      };

      const suggestions = await db.user.findMany({
        where: {
          OR: [
            {
              likes: suggestionsQueryObject,
            },
            {
              bookmarks: suggestionsQueryObject,
            },
            {
              comments: suggestionsQueryObject,
            },
          ],
          NOT: { id: session.user.id },
        },
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
        },
        take: 4,
        orderBy: { created_at: "desc" },
      });

      return suggestions;
    }
  ),

  followUser: protectedProcedure
    .input(
      z.object({
        followingUserId: z.string(),
      })
    )
    .mutation(
      async ({ ctx: { db, session }, input: { followingUserId } }) => {
        if (followingUserId === session.user.id) {
          throw new TRPCError({code: 'BAD_REQUEST', message: "You can't follow yourself"})
        }
        await db.user.update({
          where: { id: session.user.id },
          data: { following: { connect: { id: followingUserId } } },
        });
      }
    ),

  unfollowUser: protectedProcedure
    .input(z.object({ followingUserId: z.string() }))
    .mutation(
      async ({ ctx: { db, session }, input: { followingUserId } }) => {
        await db.user.update({
          where: { id: session.user.id },
          data: { following: { disconnect: { id: followingUserId } } },
        });
      }
    ),

  getAllFollowers: protectedProcedure.input(
    z.object({userId: z.string()})
  ).query(
    async ({ ctx: { db, session }, input: {userId} }) => {
      return await db.user.findUnique({
        // where: { id: session.user.id },
        where: { id: userId },
        select: {
          followedBy: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              followedBy: {
                where: {
                id: session.user.id
              }}
            },
          },
        },
      });
    }
  ),

  getAllFollowing: protectedProcedure.input(
    z.object({userId: z.string()})
  ).query(
    async ({ ctx: { db }, input: {userId} }) => {
      return await db.user.findUnique({
        where: { id: userId },
        select: {
          following: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });
    }
  ),
});
