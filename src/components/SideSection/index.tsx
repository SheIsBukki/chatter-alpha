import Link from "next/link";
import Image from "next/image";
import { api } from "@/utils/api";
import { regularDate } from "@/components/lib/utils";
import Suggestions from "@/components/Suggestions";

export default function SideSection() {
  const getReadingLists = api.articleRouter.getReadingLists.useQuery();

  return (
    <aside className="col-span-4 flex h-full w-full flex-col space-y-4 p-6">
      {/* The div below is for the people suggestion */}
      <Suggestions />

      {/* The div below is for the articles bookmarked by the user */}

      <div className="sticky top-20">
        <h3 className="my-6 text-lg font-semibold">My reading list</h3>
        <div className="flex flex-col space-y-8">
          {/* {Array.from({ length: 4 }).map((_, i) => ( */}
          {getReadingLists.data?.map((bookmark) => (
            <div
              key={bookmark.id}
              className="group flex items-center space-x-6 text-xs"
            >
              <div className="aspect-square h-full w-2/5 rounded-xl bg-gray-300">
                {bookmark.article.featured_image && (
                  <Image
                    className="aspect-square h-full w-full rounded-xl"
                    src={bookmark.article.featured_image}
                    alt="The featured image of the article"
                    width={240}
                    height={240}
                  />
                )}
              </div>
              <div className="flex w-3/5 flex-col space-y-2">
                <Link
                  href={bookmark.article.slug}
                  className="text-md font-semibold decoration-green-500 group-hover:underline"
                >
                  {bookmark.article.title}
                </Link>
                <p className="text-md truncate">
                  {bookmark.article.description}
                </p>
                <div className="flex w-full items-center space-x-4">
                  <div className="h-8 w-8 rounded-full bg-gray-300">
                    {bookmark.article.author.image && (
                      <Image
                        className="h-8 w-8 rounded-full"
                        src={bookmark.article.author.image}
                        width={40}
                        height={40}
                        alt={`${bookmark.article.author.name}'s avatar`}
                      />
                    )}
                  </div>
                  <p>{bookmark.article.author.name} &#8226;</p>
                  <p>{regularDate(bookmark.article.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
