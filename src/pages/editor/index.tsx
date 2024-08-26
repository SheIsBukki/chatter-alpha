import dynamic from "next/dynamic";
import { Controller, useForm } from "react-hook-form";
import "react-quill/dist/quill.snow.css";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineAccountBook } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import MainLayout from "@/layouts/MainLayout";
import type { WriteFormType, TAG } from "@/components/lib/definitions";
import TagFormModal from "@/components/TagFormModal";
import { WriteFormSchema } from "@/components/lib/schema";
import TagsAutoCompletion from "@/components/TagsAutocompletion";
// import { commands } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
// import rehypeSanitize from "node_modules/rehype-sanitize/lib";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
// const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
// const rehypeSanitize = dynamic(() => import("rehype-sanitize"), { ssr: false });
// document.documentElement.setAttribute("data-color-mode", "dark");
// document.documentElement.setAttribute("data-color-mode", "light");

export default function WritePage() {
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
      toast.success("Article successfully created!");
      reset();
      await articleRoute.getArticle.invalidate();
    },
  });

  const [isTagCreateModalOpen, setTagCreateModalOpen] = useState(false);
  const getTags = api.tagRouter.getTags.useQuery();
  const [selectedTags, setSelectedTags] = useState<TAG[]>([]);

  const onSubmit = (data: WriteFormType) => {
    console.log(data);
    createArticle.mutate(
      selectedTags.length > 0 ? { ...data, tagsIds: selectedTags } : data,
    );
  };

  return (
    <MainLayout>
      <main className="mx-auto h-full w-[80vw]">
        <>
          {/* <UnsplashGallery
            isUnsplashModalOpen={isUnsplashModalOpen}
            setUnsplashModalOpen={setUnsplashModalOpen}
          /> */}

          {/* <div
            onClick={() => setUnsplashModalOpen(true)}
            className="absolute left-2 top-2 z-10 cursor-pointer rounded-lg bg-black/30 p-2 text-white hover:bg-black"
          >
            <BiImageAdd className="text-2xl" />
          </div> */}
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
        </>
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
              <>
                <div className="w-full">
                  <ReactQuill
                    theme="snow"
                    {...field}
                    value={field.value}
                    placeholder="Start writing..."
                    onChange={(value) => field.onChange(value)}
                  />
                </div>
                {/* <div data-color-mode="light" className="h-full w-full">
                  <MDEditor
                    className="wmde-markdown-var"
                    aria-describedby="markdown-error"
                    {...field}
                    value={field.value}
                    height={500}
                    visiableDragbar={false}
                    onChange={(value) => field.onChange(value)}
                    previewOptions={{
                      rehypePlugins: [[rehypeSanitize]],
                    }}
                    textareaProps={{
                      placeholder: "Start writing in markdown...",
                    }}
                    aria-placeholder="Start writing in markdown..."
                    commands={[
                      commands.bold,
                      commands.italic,
                      commands.link,
                      commands.strikethrough,
                      commands.codePreview,
                      commands.fullscreen,
                      commands.divider,
                      commands.code,
                      commands.codeBlock,
                      commands.codeEdit,
                      commands.hr,
                      commands.image,
                      commands.quote,
                      commands.orderedListCommand,
                      commands.unorderedListCommand,
                    ]}
                  />
                </div> */}
              </>
            )}
          />

          {errors.html && (
            <p
              id="html-error"
              className="w-full text-left text-sm text-red-500"
            >
              {errors.html?.message}
            </p>
          )}

          {/* {errors.markdown && (
            <p
              id="markdown-error"
              className="w-full text-left text-sm text-red-500"
            >
              {errors.markdown?.message}
            </p>
          )} */}

          <div className="flex w-full justify-end">
            <button
              type="submit"
              className="flex items-center space-x-3 rounded border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900"
            >
              Publish
            </button>
          </div>
        </form>
      </main>
    </MainLayout>
  );
}
