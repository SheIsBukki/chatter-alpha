import { api } from "@/utils/api";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Suggestions() {
  const suggestions = api.userRouter.getSuggestions.useQuery();

  const followUser = api.userRouter.followUser.useMutation({
    onSuccess: () => {
      toast.success("User followed 🎉");
    },
  });

  return (
    <div>
      <h3 className="my-6 text-lg font-semibold">
        People you might be interested in
      </h3>
      <div className="flex flex-col space-y-4">
        {suggestions.isSuccess &&
          suggestions.data.map((user) => (
            <div key={user.id} className="flex flex-row items-center space-x-5">
              <div className="h-10 w-10 flex-none rounded-full bg-gray-300">
                {user.image && (
                  <Image
                    src={user.image}
                    alt={`${user.name} avatar`}
                    width={40}
                    height={40}
                    className="h-auto w-auto rounded-full"
                    // fill
                    // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
              </div>

              <div>
                <Link
                  href={`/user/${user.username}`}
                  className="text-sm font-bold decoration-green-500 hover:underline"
                >
                  {user.name}
                </Link>
                <div className="text-xs">{user.username}</div>
              </div>
              <div>
                <button
                  onClick={() =>
                    followUser.mutate({ followingUserId: user.id })
                  }
                  className="flex items-center space-x-3 rounded border border-gray-400/50 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 dark:border-gray-500 dark:hover:border-gray-100 dark:hover:text-gray-100"
                >
                  Follow
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
