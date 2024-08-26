import { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { AiOutlineAccountBook } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";
import type { TAG, WriteFormType } from "@/components/lib/definitions";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";
import { WriteFormSchema } from "@/components/lib/schema";
import { GlobalContext } from "@/context/GlobalContextProvider";
import { api } from "@/utils/api";
import Modal from "@/components/Modal";
import TagFormModal from "@/components/TagFormModal";
import TagsAutoCompletion from "@/components/TagsAutocompletion";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

export default function WriteFormModal() {
  const { isWriteModalOpen, setWriteModalOpen } = useContext(GlobalContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<WriteFormType>({
    resolver: zodResolver(WriteFormSchema),
  });

  const articleRoute = api.useUtils().articleRouter;

  const createArticle = api.articleRouter.createArticle.useMutation({
    onSuccess: async () => {
      toast.success("article successfully created!");
      setWriteModalOpen(false);
      reset();
      await articleRoute.getArticle.invalidate();
    },
  });

  // This is for the tag functionality
  const [selectedTags, setSelectedTags] = useState<TAG[]>([]);

  const onSubmit = (data: WriteFormType) => {
    console.log(data);
    createArticle.mutate(
      selectedTags.length > 0 ? { ...data, tagsIds: selectedTags } : data,
    );
  };

  // This is for the tag functionality

  const [isTagCreateModalOpen, setTagCreateModalOpen] = useState(false);

  const getTags = api.tagRouter.getTags.useQuery();

  return (
    <>
      <Modal
        isOpen={isWriteModalOpen}
        onClose={() => {
          setWriteModalOpen(false);
        }}
      >
        {getTags.isSuccess && (
          <>
            {" "}
            <TagFormModal
              isOpen={isTagCreateModalOpen}
              onClose={() => setTagCreateModalOpen(false)}
            />
            {/* This is for tags autocompletion and tags creation */}
            <div className="my-4 flex w-full items-center space-x-4">
              <div className="z-10 w-4/5">
                <TagsAutoCompletion
                  tags={getTags.data}
                  setSelectedTags={setSelectedTags}
                  selectedTags={selectedTags}
                />
              </div>

              <button
                onClick={() => setTagCreateModalOpen(true)}
                className="space-x-3 whitespace-nowrap rounded border border-gray-200 px-4 py-2 text-sm transition hover:border-gray-900 hover:text-gray-900 dark:border-gray-500 dark:hover:border-gray-100 dark:hover:text-gray-100"
              >
                Create tag
              </button>
            </div>
            <div className="my-4 flex w-full flex-wrap items-center">
              {selectedTags.map((tag) => (
                <div
                  key={tag.id}
                  className="m-2 flex items-center justify-center space-x-2 whitespace-nowrap rounded-2xl bg-gray-200/50 px-5 py-3"
                >
                  <div>{tag.name}</div>
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedTags((prev) =>
                        prev.filter((currTag) => currTag.id !== tag.id),
                      )
                    }
                  >
                    <FaTimes />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* The write modal form */}
        <form
          className="relative flex flex-col items-center justify-center space-y-4"
          action=""
          onSubmit={handleSubmit((data) => {
            console.log(data);
            onSubmit(data);
          })}
        >
          {createArticle.isPending && (
            <div className="absolute flex h-full w-full items-center justify-center">
              <AiOutlineAccountBook className="animate-spin" />
            </div>
          )}
          <input
            aria-describedby="title-error"
            type="text"
            // name="title" // We don't have to use this anymore because the register variable does the work
            id="title"
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
            placeholder="Title of the blog"
            {...register("title")}
          />
          {errors.title && (
            <p
              id="title-error"
              className="w-full pb-4 text-left text-sm text-red-500"
            >
              {errors.title?.message}
            </p>
          )}

          <input
            aria-describedby="description-error"
            placeholder="Short description about your article..."
            type="text"
            // name="shortDescription"
            {...register("description")}
            id="shortDescription"
            className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
          />
          {errors.description && (
            <p
              id="description-error"
              className="w-full pb-4 text-left text-sm text-red-500"
            >
              {errors.description?.message}
            </p>
          )}

          {/* Rich text editor using Quill */}
          <Controller
            name="html"
            control={control}
            render={({ field }) => (
              <div className="w-full">
                <ReactQuill
                  theme="snow"
                  {...field}
                  value={field.value}
                  placeholder="Start writing..."
                  onChange={(value) => field.onChange(value)}
                />
              </div>
            )}
          />

          {errors.html && (
            <p
              id="text-error"
              className="w-full pb-4 text-left text-sm text-red-500"
            >
              {errors.html?.message}
            </p>
          )}

          <div className="flex w-full justify-end">
            <button
              type="submit"
              className="flex items-center space-x-3 rounded border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900"
            >
              Publish
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
