import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { AiOutlineAccountBook } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import { WriteFormSchema } from "@/components/lib/schema";
import type {
  WriteFormType,
  TAG,
  EditArticleProps,
} from "@/components/lib/definitions";
import { api } from "@/utils/api";
import Modal from "@/components/Modal";
import TagFormModal from "@/components/TagFormModal";
import TagsAutoCompletion from "@/components/TagsAutocompletion";
import { useState } from "react";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function EditArticle({
  articleId,
  slug,
  isEditModalOpen,
  setEditModalOpen,
}: EditArticleProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<WriteFormType>({
    resolver: zodResolver(WriteFormSchema),
  });

  // const articleRoute = api.useUtils().articleRouter;
  const utils = api.useUtils();
  const editArticle = api.articleRouter.updateArticle.useMutation({
    onSuccess: async () => {
      toast.success("Article updated created!");
      reset();
      await utils.articleRouter.getArticle.invalidate({ slug });
    },
  });

  // This is for the tag functionality
  const [selectedTags, setSelectedTags] = useState<TAG[]>([]);
  const [isTagCreateModalOpen, setTagCreateModalOpen] = useState(false);
  const getTags = api.tagRouter.getTags.useQuery();

  const onSubmit = (data: WriteFormType) => {
    editArticle.mutate({
      title: data.title,
      description: data.description,
      html: data.html,
      articleId,
      tagsIds: selectedTags,
      markdown: data.markdown,
    });
  };

  return (
    <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
      <>
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
        <form
          className="relative flex flex-col items-center justify-center space-y-4"
          action=""
          onSubmit={handleSubmit((data) => {
            console.log(data);
            onSubmit(data);
          })}
        >
          {editArticle.isPending && (
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
          <div className="flex">
            <Controller
              aria-describedby="html-error"
              name="html"
              control={control}
              render={({ field }) => (
                <div className="h-full w-full">
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
          </div>

          {errors.html && (
            <p
              id="html-error"
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
              Update
            </button>
          </div>
        </form>
      </>
    </Modal>
  );
}
