import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
// import { z } from "zod";
import type { UnsplashGalleryProps } from "@/components/lib/definitions";
import { BiLoaderAlt } from "react-icons/bi";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import useDebounce from "@/hooks/UseDebounce";
import Modal from "@/components/Modal";
import { unsplashSearchRouteSchema } from "@/components/lib/schema";

export default function UnsplashGallery({
  isUnsplashModalOpen,
  setUnsplashModalOpen,
  articleId,
  slug,
}: UnsplashGalleryProps) {
  const { register, watch, reset } = useForm<{ searchQuery: string }>({
    resolver: zodResolver(unsplashSearchRouteSchema),
  });

  const watchSearchQuery = watch("searchQuery");
  const debouncedSearchQuery = useDebounce(watchSearchQuery, 3000);

  const [selectedImage, setSelectedImage] = useState("");

  const fetchUnsplashImages = api.unsplashRouter.getImages.useQuery(
    {
      searchQuery: debouncedSearchQuery,
    },
    {
      enabled: Boolean(debouncedSearchQuery),
    },
  );

  const utils = api.useUtils();

  const updateFeaturedImage =
    api.articleRouter.updateArticlefeatured_image.useMutation({
      onSuccess: async () => {
        await utils.articleRouter.getArticle.invalidate({ slug });
        reset();
        setUnsplashModalOpen(false);
        toast.success("Featured image updated 🎉");
      },
    });

  return (
    <Modal
      isOpen={isUnsplashModalOpen}
      onClose={() => setUnsplashModalOpen(false)}
    >
      <div className="flex w-full flex-col items-center justify-center space-y-4 rounded-xl">
        <input
          {...register("searchQuery")}
          placeholder="Type to search for an image..."
          type="text"
          id="searchImage"
          className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
        />
        {debouncedSearchQuery && fetchUnsplashImages.isLoading && (
          <div className="flex h-64 w-full items-center justify-center">
            <BiLoaderAlt className="animate-spin" />
          </div>
        )}

        {/* The unsplash image search result will display here */}
        <div className="relative grid h-96 w-full grid-cols-3 place-items-center gap-4 overflow-y-scroll">
          {fetchUnsplashImages.isSuccess &&
            fetchUnsplashImages.data?.results.map((imageData) => (
              <div
                key={imageData.id}
                onClick={() => setSelectedImage(imageData.urls.full)}
                className="group relative aspect-video h-full w-full cursor-pointer rounded-md"
              >
                <div
                  className={`absolute inset-0 z-10 h-full w-full rounded-md group-hover:bg-black/40 ${
                    selectedImage === imageData.urls.full && "bg-black/40"
                  }`}
                ></div>

                <Image
                  className="h-auto w-auto rounded-md"
                  fill={true}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  // sizes="(max-width: 768px) 100vw, 33vw"
                  src={imageData.urls.regular}
                  alt={imageData.alt_description ?? ""}
                />
              </div>
            ))}
        </div>

        {selectedImage && (
          <button
            onClick={() => {
              // Update the database with the blog id and the chosen image
              updateFeaturedImage.mutate({
                imageUrl: selectedImage,
                articleId,
              });
            }}
            disabled={updateFeaturedImage.isPending}
            type="submit"
            className="flex items-center space-x-3 rounded border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900"
          >
            {updateFeaturedImage.isPending ? "Loading..." : "Choose image"}
          </button>
        )}
      </div>
    </Modal>
  );
}
