import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import type { TagFormProps, TagFormType } from "@/components/lib/definitions";
import { api } from "@/utils/api";
import Modal from "@/components/Modal";

export const TagCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
});

export default function TagFormModal({ isOpen, onClose }: TagFormProps) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<TagFormType>({
    resolver: zodResolver(TagCreateSchema),
  });

  const createTag = api.tagRouter.createTag.useMutation({
    onSuccess: () => {
      toast.success("Tag created successfully 🎉");
      reset();
      onClose();
    },
  });

  return (
    <Modal title="Create a tag" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit((data) => createTag.mutate(data))}>
        <input
          aria-describedby="name-error"
          type="text"
          id="name"
          className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
          placeholder="Enter tag name"
          {...register("name")}
        />
        <p
          id="name-error"
          className="w-full pb-4 pt-1 text-left text-sm text-red-500"
        >
          {errors.name?.message}
        </p>
        <input
          aria-describedby="description-error"
          type="text"
          id="description"
          className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
          placeholder="Describe your tag"
          {...register("description")}
        />
        <p
          id="description-error"
          className="w-full pb-4 pt-1 text-left text-sm text-red-500"
        >
          {errors.description?.message}
        </p>
        <div className="flex w-full justify-end">
          <button
            type="submit"
            className="w-fit space-x-3 whitespace-nowrap rounded border border-gray-200 px-4 py-2 text-right text-sm transition hover:border-gray-900 hover:text-gray-900 dark:border-gray-500 dark:hover:border-gray-100 dark:hover:text-gray-100"
          >
            Create tag
          </button>
        </div>
      </form>
    </Modal>
  );
}
