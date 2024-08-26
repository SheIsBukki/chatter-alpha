import { useRouter } from "next/router";
import { FiEdit } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { BsChat } from "react-icons/bs";
import { CiBookmarkPlus } from "react-icons/ci";
import { CiBookmarkCheck } from "react-icons/ci";
import { useCallback, useState } from "react";
import Image from "next/image";
import { BiImageAdd } from "react-icons/bi";
import { useSession } from "next-auth/react";
import { Interweave } from "interweave";
import { api } from "@/utils/api";
import MainLayout from "@/layouts/MainLayout";
import UnsplashGallery from "@/components/UnsplashGallery";
import CommentSidebar from "@/components/CommentSidebar";
import EditArticle from "@/components/EditArticleModal";
import toast from "react-hot-toast";
import { RiDeleteBinLine } from "react-icons/ri";

export default function ArticlePage() {
  const router = useRouter();
  const articleRoute = api.useUtils().articleRouter;

  const getArticle = api.articleRouter.getArticle.useQuery(
    {
      slug: router.query.slug as string,
    },
    { enabled: Boolean(router.query.slug) },
  );

  const invalidateCurrentArticlePage = useCallback(async () => {
    await articleRoute.getArticle.invalidate({
      slug: router.query.slug as string,
    });
  }, [articleRoute.getArticle, router.query.slug]);

  const likeArticle = api.articleRouter.likeArticle.useMutation({
    onSuccess: async () => {
      await invalidateCurrentArticlePage();
      console.log("Yup! I know you like that");
    },
  });

  const unlikeArticle = api.articleRouter.unlikeArticle.useMutation({
    onSuccess: async () => {
      await invalidateCurrentArticlePage();
      console.log("Well, damn!");
    },
  });

  const [isBookmarked, setBookmark] = useState(
    Boolean(getArticle.data?.bookmarks?.length),
  );

  const bookmarkArticle = api.articleRouter.bookmarkArticle.useMutation({
    onSuccess: async () => {
      await invalidateCurrentArticlePage();
      setBookmark((prev) => !prev);
      console.log("Yup! I know you like that");
    },
  });

  const unbookmarkArticle = api.articleRouter.unbookmarkArticle.useMutation({
    onSuccess: async () => {
      await invalidateCurrentArticlePage();
      setBookmark((prev) => !prev);
      console.log("Well, damn!");
    },
  });

  const [showCommentSidebar, setShowCommentSidebar] = useState(false);

  // The Unsplash image search functionality
  const [isUnsplashModalOpen, setUnsplashModalOpen] = useState(false);
  const { data } = useSession();

  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const deleteArticle = api.articleRouter.deleteArticle.useMutation({
    onSuccess: async () => {
      await invalidateCurrentArticlePage();
      toast.success("Article deleted! 😭");
    },
  });

  return (
    <MainLayout>
      {getArticle.isSuccess && getArticle.data && (
        <UnsplashGallery
          isUnsplashModalOpen={isUnsplashModalOpen}
          setUnsplashModalOpen={setUnsplashModalOpen}
          articleId={getArticle.data?.id}
          slug={getArticle.data.slug}
        />
      )}

      {getArticle.data?.id && (
        <CommentSidebar
          articleId={getArticle.data?.id}
          showCommentSidebar={showCommentSidebar}
          setShowCommentSidebar={setShowCommentSidebar}
        />
      )}

      {getArticle.isLoading && (
        <div className="flex h-full w-full items-center justify-center space-x-4">
          <div>
            <AiOutlineLoading3Quarters className="animate-spin" />
          </div>
          <div>Loading...</div>
        </div>
      )}

      {/* The like, comment, and bookmark functionality */}
      {getArticle.isSuccess && (
        <div className="fixed bottom-10 flex w-full items-center justify-center">
          <div className="group flex items-center justify-center space-x-4 rounded-full border border-gray-400 bg-white px-6 py-2 shadow-2xl transition duration-300 hover:border-gray-800 dark:bg-gray-900">
            {/* Edit article functionality */}

            {data?.user.id === getArticle.data?.authorId && (
              <div className="border-r pr-4 transition duration-300 group-hover:border-gray-800">
                <FiEdit
                  onClick={() => setEditModalOpen(true)}
                  className="cursor-pointer text-xl"
                />
              </div>
            )}

            {/* The like functionality */}
            <div className="border-r pr-4 transition duration-300 group-hover:border-gray-800">
              {getArticle.data?.likes && getArticle.data?.likes.length > 0 ? (
                <FcLike
                  onClick={() =>
                    getArticle.data?.id &&
                    unlikeArticle.mutate({
                      articleId: getArticle.data?.id,
                    })
                  }
                  className="cursor-pointer text-xl"
                />
              ) : (
                <FcLikePlaceholder
                  onClick={() =>
                    getArticle.data?.id &&
                    likeArticle.mutate({
                      articleId: getArticle.data?.id,
                    })
                  }
                  className="cursor-pointer text-xl"
                />
              )}
            </div>

            {/* The comment functionality */}
            <div className="border-r pr-4 transition duration-300 group-hover:border-gray-800">
              <BsChat
                onClickCapture={() => setShowCommentSidebar(true)}
                className="cursor-pointer text-xl"
              />
            </div>

            {/* The bookmark functionality */}
            <div>
              {isBookmarked ||
              (getArticle.data?.bookmarks &&
                getArticle.data?.bookmarks.length > 0) ? (
                <CiBookmarkCheck
                  onClick={() => {
                    return (
                      getArticle.data?.id &&
                      unbookmarkArticle.mutate({
                        articleId: getArticle.data?.id,
                      })
                    );
                  }}
                  className="cursor-pointer text-4xl text-green-500"
                />
              ) : (
                <CiBookmarkPlus
                  onClick={() => {
                    return (
                      getArticle.data?.id &&
                      bookmarkArticle.mutate({ articleId: getArticle.data?.id })
                    );
                  }}
                  className="cursor-pointer text-2xl"
                />
              )}
            </div>

            {/* Delete Article functionality */}
            {data?.user.id === getArticle.data?.authorId && (
              <div>
                <RiDeleteBinLine
                  onClick={() =>
                    deleteArticle.mutateAsync({
                      articleId: getArticle.data?.id ?? "",
                    })
                  }
                  className="cursor-pointer text-2xl text-red-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex h-full w-full flex-col items-center p-10">
        <div className="flex w-full max-w-screen-lg flex-col space-y-8">
          <h1 className="text-center text-4xl">{getArticle.data?.title}</h1>
          <div className="relative h-[60vh] w-full rounded-xl bg-gray-300 shadow-lg">
            {/* Unsplash search image functionality */}
            {data?.user?.id === getArticle.data?.authorId && (
              <div
                onClick={() => setUnsplashModalOpen(true)}
                className="absolute left-2 top-2 z-10 cursor-pointer rounded-lg bg-black/30 p-2 text-white hover:bg-black"
              >
                <BiImageAdd className="text-2xl" />
              </div>
            )}

            {/* Featured image */}
            <div className="absolute mx-auto flex h-full w-full items-center justify-center rounded-xl border">
              {getArticle.data?.featured_image && (
                <Image
                  className="absolute h-full w-full rounded-xl"
                  src={getArticle.data.featured_image}
                  alt={
                    getArticle.data.title ?? "The featured image of the article"
                  }
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
            </div>
          </div>

          <div className="border-l-4 border-gray-800 pl-6">
            {getArticle.data?.description}
          </div>

          <div className="prose lg:prose-xl">
            <Interweave content={getArticle.data?.html} />
            {/* <Interweave content={getArticle.data?.markdown} /> */}
          </div>
        </div>
      </div>
      {getArticle.isSuccess && getArticle.data && (
        <EditArticle
          isEditModalOpen={isEditModalOpen}
          setEditModalOpen={setEditModalOpen}
          articleId={getArticle.data.id}
          slug={getArticle.data.slug}
        />
      )}
    </MainLayout>
  );
}
