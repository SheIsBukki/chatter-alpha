import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import slugify from "slugify";
import { WriteFormSchema } from "@/components/lib/schema";

const LIMIT = 10;

export const articleRouter = createTRPCRouter({
  createArticle: protectedProcedure
    .input(
      WriteFormSchema.and(
        z.object({
          tagsIds: z.array(z.object({ id: z.string() })).optional(),
        }),
      ),
    )
    .mutation(
      async ({
        ctx: { db, session },
        input: { title, description, html, markdown, tagsIds },
      }) => {
        // Create a function that checks whether the article with this title exists

        await db.article.create({
          data: {
            title,
            description,
            html,
            markdown,
            slug: slugify(title),
            author: { connect: { id: session.user.id } },
            tags: { connect: tagsIds },
          },
        });
        return;
      },
    ),

  getArticles: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx: { db, session }, input: { cursor } }) => {
      const articles = await db.article.findMany({
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          featured_image: true,
          description: true,
          created_at: true,
          updated_at: true,
          author: {
            select: { name: true, image: true, username: true },
          },
          likes: session?.user?.id
            ? { where: { userId: session?.user?.id }, select: {user: true, userId: true} }
            : false,
          bookmarks: session?.user?.id
            ? {
                where: {
                  userId: session?.user?.id,
              },
              select: {user: true, userId: true}
              }
            : false,
          tags: {
            select: { name: true, id: true, description: true, slug: true },
          },
          _count: {select: {likes: true, bookmarks: true, comments: true}}
        },
        cursor: cursor ? { id: cursor } : undefined,
        take: LIMIT + 1,
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (articles.length > LIMIT) {
        const nextItem = articles.pop();
        if (nextItem) nextCursor = nextItem.id;
      }

      return { articles, nextCursor };
    }),

  getArticle: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx: { db, session }, input: { slug } }) => {
      const article = await db.article.findUnique({
        where: { slug },
        select: {
          id: true,
          description: true,
          authorId: true,
          title: true,
          html: true,
          markdown: true,
          featured_image: true,
          slug: true,
          likes: session?.user?.id
            ? { where: { userId: session?.user?.id }, select: {user: true, userId: true} }
            : false,
          bookmarks: session?.user?.id
            ? {
                where: {
                  userId: session?.user?.id,
              },
              select: {user: true, userId: true}
              }
            : false,
          _count: { select: { bookmarks: true, likes: true, comments: true } },
          created_at: true,
          updated_at: true,
        },
      });

      return article;
    }),

  likeArticle: protectedProcedure
    .input(z.object({ articleId: z.string() }))
    .mutation(async ({ ctx: { db, session }, input: { articleId } }) => {
      await db.like.create({
        data: {
          userId: session.user.id,
          articleId,
        },
      });
      return;
    }),

  unlikeArticle: protectedProcedure
    .input(z.object({ articleId: z.string() }))
    .mutation(async ({ ctx: { db, session }, input: { articleId } }) => {
      await db.like.delete({
        where: {
          userId_articleId: {
            articleId: articleId,
            userId: session.user.id,
          },
        },
      });
      return;
    }),

  bookmarkArticle: protectedProcedure
    .input(z.object({ articleId: z.string() }))
    .mutation(async ({ ctx: { db, session }, input: { articleId } }) => {
      await db.bookmark.create({
        data: {
          userId: session.user.id,
          articleId,
        },
      });
      return;
    }),

  unbookmarkArticle: protectedProcedure
    .input(z.object({ articleId: z.string() }))
    .mutation(async ({ ctx: { db, session }, input: { articleId } }) => {
      await db.bookmark.delete({
        where: {
          userId_articleId: {
            articleId: articleId,
            userId: session.user.id,
          },
        },
      });
      return;
    }),

  submitComment: protectedProcedure
    .input(
      z.object({
        comment: z.string().min(3),
        articleId: z.string(),
      }),
    )
    .mutation(
      async ({ ctx: { db, session }, input: { comment, articleId } }) => {
        await db.comment.create({
          data: {
            comment: comment,
            user: { connect: { id: session.user.id } },
            article: { connect: { id: articleId } },
          },
        });
      },
    ),

  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.string(), commentAuthorId: z.string() }))
    .mutation(async ({ ctx: { db, session }, input: { commentId } }) => {
      const commentData = await db.comment.findUnique({
        where: { id: commentId },
      });
      if (commentData?.userId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Can't delete a comment you didn't write",
        });
      }
      await db.comment.delete({
        where: { id: commentId },
      });
    }),

  getReadingLists: protectedProcedure.query(
    async ({ ctx: { db, session } }) => {
      const readingLists = await db.bookmark.findMany({
        orderBy: { created_at: "desc" },
        where: {
          userId: session.user.id,
        },
        take: 4,
        select: {
          id: true,
          article: {
            select: {
              title: true,
              description: true,
              created_at: true,
              slug: true,
              featured_image: true,
              author: {
                select: { name: true, image: true },
              },
            },
          },
        },
      });

      return readingLists;
    },
  ),

  getComments: publicProcedure
    .input(z.object({ articleId: z.string() }))
    .query(async ({ ctx: { db }, input: { articleId } }) => {
      const comments = await db.comment.findMany({
        where: { articleId },
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          comment: true,
          created_at: true,
          user: { select: {id: true, name: true, username: true, image: true } },
        },
      });

      return comments;
    }),

  updateArticlefeatured_image: protectedProcedure
    .input(z.object({ imageUrl: z.string().url(), articleId: z.string() }))
    .mutation(
      async ({ ctx: { db, session }, input: { imageUrl, articleId } }) => {
        // Check if the user is the owner of the article
        const articleData = await db.article.findUnique({
          where: { id: articleId },
        });

        if (articleData?.authorId !== session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not the owner of this article",
          });
        }

        await db.article.update({
          where: { id: articleId },
          data: { featured_image: imageUrl },
        });
      },
    ),

  updateArticle: protectedProcedure
    .input(
      WriteFormSchema.and(
        z.object({
          tagsIds: z.array(z.object({ id: z.string() })).optional(),
          articleId: z.string(),
        }),
      ),
    )
    .mutation(
      async ({
        ctx: { db, session },
        input: { articleId, title, description, html, markdown, tagsIds },
      }) => {
        // Check if the user is the owner of the article
        const articleData = await db.article.findUnique({
          where: { id: articleId },
        });

        if (articleData?.authorId !== session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not the owner of this article",
          });
        }

        await db.article.update({
          where: { id: articleId },
          data: {
            title,
            description,
            html,
            markdown,
            slug: slugify(title),
            author: { connect: { id: session.user.id } },
            tags: { connect: tagsIds },
          },
        });
      },
    ),

  deleteArticle: protectedProcedure
    .input(z.object({ articleId: z.string() }))
    .mutation(async ({ ctx: { db, session }, input: { articleId } }) => {
      const articleData = await db.article.findUnique({
        where: { id: articleId },
      });

      if (articleData?.authorId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the owner of this article",
        });
      }
      await db.article.delete({
        where: { id: articleId },
      });
    }),

  // editArticle
  // saveArticle
  // updateArticle
});
