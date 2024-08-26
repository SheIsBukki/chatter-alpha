import { HiXMark } from "react-icons/hi2";
import { RiDeleteBinLine } from "react-icons/ri";
import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import type {
  CommentFormType,
  CommentSidebarProps,
} from "@/components/lib/definitions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Image from "next/image";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";

export const commentFormSchema = z.object({
  comment: z.string().min(3),
});

export default function CommentSidebar({
  showCommentSidebar,
  setShowCommentSidebar,
  articleId,
}: CommentSidebarProps) {
  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset,
  } = useForm<CommentFormType>({
    resolver: zodResolver(commentFormSchema),
  });

  const articleRoute = api.useUtils().articleRouter;

  const submitComment = api.articleRouter.submitComment.useMutation({
    onSuccess: async () => {
      toast.success("🚀");
      await articleRoute.getComments.invalidate({ articleId });
      reset();
    },
    onError: (error) => {
      console.log(error.message);
      toast.error(error.message);
      toast.error(`Something went wrong, please confirm that you're signed in`);
    },
  });

  const getComments = api.articleRouter.getComments.useQuery({ articleId });

  dayjs.extend(relativeTime);

  const deleteComment = api.articleRouter.deleteComment.useMutation({
    onSuccess: async () => {
      toast.success("Comment deleted! 😭");
      await articleRoute.getComments.invalidate({ articleId });
      reset();
    },
    onError: (error) => toast.error(error.message),
  });

  const currentUser = useSession();

  return (
    <Transition show={showCommentSidebar} as={Fragment}>
      <Dialog
        as="div"
        // open={showCommentSidebar}
        onClose={() => setShowCommentSidebar(false)}
      >
        <div className="fixed right-0 top-0">
          <TransitionChild
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
            enter="transition duration-1000"
            leave="transition duration-500"
          >
            <DialogPanel className="relative h-screen w-[200px] bg-white text-black shadow-md sm:w-[400px] dark:bg-black dark:text-white">
              <div className="flex h-full w-full flex-col overflow-scroll px-6">
                {/* Comment */}
                <div className="mb-5 mt-10 flex items-center justify-between text-xl">
                  <h2 className="font-medium">
                    Comments ({getComments.data?.length})
                  </h2>
                  <div className="">
                    <HiXMark
                      className="cursor-pointer"
                      onClick={() => setShowCommentSidebar(false)}
                    />
                  </div>
                </div>
                {/* Comment input box */}
                <div>
                  <form
                    onSubmit={handleSubmit((data) => {
                      submitComment.mutate({ ...data, articleId });
                    })}
                    className="my-6 flex flex-col items-end space-y-5"
                  >
                    <textarea
                      id="comment"
                      rows={3}
                      {...register("comment")}
                      placeholder="Share your thoughts..."
                      className="w-full rounded-xl border border-gray-300 p-4 shadow-lg outline-none focus:border-gray-600"
                    ></textarea>
                    {isValid && (
                      <button
                        className="flex items-center space-x-3 rounded border border-gray-300 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 dark:hover:border-gray-50 dark:hover:text-gray-50"
                        type="submit"
                      >
                        Comment
                      </button>
                    )}
                  </form>
                </div>
                {/* People's comments */}
                <div className="flex flex-col items-center justify-center space-y-6">
                  {getComments.isSuccess &&
                    getComments.data.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex w-full flex-col space-y-2 border-b border-b-gray-300 pb-4 last:border-none"
                      >
                        {/* Commenter's profile */}
                        <div className="flex w-full items-center space-x-2 text-xs">
                          <div className="relative h-8 w-8 rounded-full bg-gray-400">
                            {comment.user.image && (
                              <Image
                                className="rounded-full"
                                src={comment.user.image}
                                width={40}
                                height={40}
                                alt={`${comment.user.name}'s avatar`}
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {comment.user.username ?? comment.user.name}
                            </p>
                            <p className="">
                              {dayjs().to(dayjs(comment.created_at))}
                            </p>
                          </div>
                        </div>
                        {/* The actual comments */}
                        <div className="flex w-full justify-between space-x-1">
                          <div className="text-sm">{comment.comment}</div>
                          {/* Delete comment functionality */}
                          <>
                            {currentUser.data?.user.id === comment.user.id && (
                              <RiDeleteBinLine
                                onClick={() =>
                                  deleteComment.mutate({
                                    commentId: comment.id,
                                    commentAuthorId: comment.user.id ?? "",
                                  })
                                }
                                className="w-2/4 cursor-pointer text-red-500"
                              />
                            )}
                          </>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
