import { CiSearch } from "react-icons/ci";
import { HiChevronDown } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import InfiniteScroll from "react-infinite-scroll-component";
import { BiLoaderCircle } from "react-icons/bi";
import { api } from "@/utils/api";
import Article from "../Article";

export default function MainSection() {
  const getArticles = api.articleRouter.getArticles.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  // console.log(getArticles.data?.pages.flatMap((page) => page.articles));

  return (
    <main className="col-span-8 h-full w-full border-r border-gray-300 px-24">
      <div className="flex w-full flex-col space-y-4 py-10">
        <div className="flex w-full items-center space-x-4">
          {/* The label element below is for the search functional */}

          <label
            htmlFor="searchBar"
            className="relative w-full rounded-3xl border border-gray-800 dark:border-gray-50"
          >
            <div className="absolute left-2 flex h-full items-center">
              <CiSearch />
            </div>
            <input
              placeholder="Search..."
              type="text"
              name="search"
              id="searchBar"
              className="w-full rounded-3xl px-4 py-1 pl-8 text-sm outline-none placeholder:text-xs placeholder:text-gray-300"
            />
          </label>

          {/* The div element below is for the topic tags */}

          <div className="flex w-full items-center justify-end space-x-4">
            <div>My Topics:</div>
            <div className="flex items-center space-x-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-3xl bg-gray-200/50 px-4 py-3"
                >
                  tag {index}
                </div>
              ))}
            </div>
          </div>

          {/* Another functionality here */}
        </div>

        <div className="flex w-full items-center justify-between border-b border-gray-300 pb-8">
          <div>Articles</div>
          <div>
            <button className="flex items-center space-x-2 rounded-3xl border border-gray-800 px-4 py-1.5 font-semibold">
              <div>Following</div>
              <div>
                <HiChevronDown className="text-xl" />
              </div>
            </button>
          </div>
        </div>
      </div>
      {/* The div element below is for the article cards in the feed section */}
      <div className="flex w-full flex-col justify-center space-y-8">
        {getArticles.isLoading && (
          <div className="flex h-full w-full items-center justify-center space-x-4">
            <div>
              <AiOutlineLoading3Quarters className="animate-spin" />
            </div>
            <div>Loading...</div>
          </div>
        )}
        <InfiniteScroll
          dataLength={
            getArticles.data?.pages.flatMap((page) => page.articles).length ?? 0
          } //This is important field to render the next data
          next={getArticles.fetchNextPage}
          hasMore={Boolean(getArticles.hasNextPage)}
          loader={
            <div className="flex h-full w-full items-center justify-center">
              <BiLoaderCircle className="animate-spin" />
            </div>
          }
          endMessage={
            <p className="text-center">
              <b>Yay! You have seen it all</b>
            </p>
          }
        >
          {getArticles.isSuccess &&
            getArticles.data?.pages
              .flatMap((page) => page.articles)
              .map((article) => <Article {...article} key={article.id} />)}
        </InfiniteScroll>
      </div>
    </main>
  );
}
