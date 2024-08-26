/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Image from "next/image";
import Link from "next/link";
import { CiBookmarkPlus } from "react-icons/ci";
import { CiBookmarkCheck } from "react-icons/ci";
import { useState } from "react";
import { api } from "@/utils/api";
import { type ArticleProps } from "@/components/lib/definitions";
import { regularDate } from "@/components/lib/utils";

export default function Article({ ...article }: ArticleProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const [isBookmarked, setBookmark] = useState(
    Boolean(article.bookmarks?.length),
  );

  const bookmarkArticle = api.articleRouter.bookmarkArticle.useMutation({
    onSuccess: () => {
      setBookmark((prev) => !prev);
      console.log("Yup! I know you like that");
    },
  });

  const unbookmarkArticle = api.articleRouter.unbookmarkArticle.useMutation({
    onSuccess: () => {
      setBookmark((prev) => !prev);
      console.log("Well, damn!");
    },
  });

  return (
    <div
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      key={article.id}
      className="flex flex-col space-y-4 border-b border-gray-300 pb-8 last:border-none"
    >
      {/* Author's info and publication info */}
      <div className="group flex w-full cursor-pointer items-center space-x-2">
        <div className="relative h-10 w-10 rounded-full bg-gray-400">
          {article.author.image && (
            <Image
              className="rounded-full"
              alt={`${article.author.name}'s avatar` ?? "No profile picture"}
              src={article.author.image}
              width={100}
              height={100}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
        <div>
          <p className="font-semibold">
            <Link
              href={`/user/${article.author.username}`}
              className="decoration-green-500 group-hover:underline"
            >
              {article.author.name}
            </Link>{" "}
            <span>&#8226; {regularDate(article.created_at)}</span>
          </p>
          <p className="text-sm">Software Engineer</p>
        </div>
      </div>
      {/* Article */}
      <div className="group grid h-44 w-full grid-cols-12 gap-4 overflow-hidden">
        {/* The div below is for the article title and content */}
        <div className="col-span-8 flex h-full w-full flex-col space-y-4">
          <Link
            href={`/${article.slug}`}
            className="text-2xl font-bold text-gray-800 decoration-green-500 group-hover:underline dark:text-gray-50"
          >
            {article.title}
          </Link>
          <p className="m-w-sm w-full truncate break-words text-sm text-gray-500 dark:text-gray-100">
            {article.description}
          </p>
        </div>

        {/* The div below is for the article image */}
        <div className="col-span-4">
          <div className="h-full w-full transform rounded-xl bg-gray-300 transition duration-300 hover:scale-105 hover:shadow-xl">
            {article.featured_image && (
              <Image
                className="w-full rounded-lg"
                alt={article.title ?? "The featured image of the article"}
                src={article.featured_image}
                fill
                // width={240}
                // height={240}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </div>
        </div>
      </div>

      {/* Tags related to the rendered feed articles */}
      <div>
        <div className="flex w-full items-center justify-between ">
          {/* The tags related to the articles */}
          <div className="flex items-center space-x-2">
            {article.tags.map((tag) => (
              <div
                key={tag.id}
                onClick={() => {
                  // Redirect the user to a tag page where all the articles with the the clicked tag are rendered
                }}
                className="rounded-2xl bg-gray-200/50 px-5 py-3"
              >
                {tag.name}
              </div>
            ))}
          </div>
          {/* The bookmark functionality */}
          <div className="flex space-x-2 items-center justify-between">
            <span className="">{article._count.likes} likes &#8226;</span>
            <span className="">{article._count.comments} comments &#8226;</span>
            {isBookmarked ? (
              <CiBookmarkCheck
                onClick={() => {
                  unbookmarkArticle.mutate({ articleId: article.id });
                }}
                className="cursor-pointer text-4xl text-green-500"
              />
            ) : (
              <CiBookmarkPlus
                onClick={() => {
                  bookmarkArticle.mutate({ articleId: article.id });
                }}
                className="cursor-pointer text-4xl"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
