import { useRouter } from "next/router";
import { SlShareAlt } from "react-icons/sl";
import Image from "next/image";
import { api } from "@/utils/api";
import { BiEdit } from "react-icons/bi";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
// import { createClient } from "@supabase/supabase-js";
// import { env } from "@/env";
import { useState } from "react";
import Modal from "@/components/Modal";
import Article from "@/components/Article";
import MainLayout from "@/layouts/MainLayout";

// export const supabase = createClient(
//   env.NEXT_PUBLIC_SUPABASE_URL,
//   env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY,
// );

export default function UserProfilePage() {
  const router = useRouter();

  const currentUser = useSession();

  const userProfile = api.userRouter.getUserProfile.useQuery(
    {
      username: router.query.username as string,
    },
    // This ensures that the server doesn't try to get the userprofile when the username is not available
    { enabled: !!router.query.username, },
  );

  const userArticles = api.userRouter.getUserArticles.useQuery(
    {
      username: router.query.username as string,
    },
    { enabled: !!router.query.username },
  );

  const [objectImage, setObjectImage] = useState("");

  const userRoute = api.useUtils().userRouter;

  const uploadAvatar = api.userRouter.uploadAvatar.useMutation({
    onSuccess: async () => {
      if (userProfile.data?.username) {
        await userRoute.getUserProfile.invalidate({
          username: userProfile.data.username,
        });
        toast.success("avatar updated 🎉");
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      // This if statememt ensures that the file the user uploads isn't larger than 5MB
      if (file.size > 5 * 1000000) {
        return toast.error("image size should not be larger than 5MB");
      }

      // This lets the user see the image they selected
      setObjectImage(URL.createObjectURL(file));

      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onloadend = () => {
        if (fileReader.result && userProfile.data?.username) {
          uploadAvatar.mutate({
            imageAsDataUrl: fileReader.result as string,
            username: userProfile?.data?.username,
            mimetype: file.type,
          });
        }
      };

      fileReader.readAsDataURL(file);
    }
  };

  const [isFollowModalOpen, setFollowModalOpen] = useState({
    isOpen: false,
    modalType: "followers",
  });

  const followers = api.userRouter.getAllFollowers.useQuery(
    { userId: userProfile.data?.id ?? "" },
    { enabled: Boolean(userProfile.data?.id) },
  );

  const following = api.userRouter.getAllFollowing.useQuery(
    { userId: userProfile.data?.id ?? "" },
    { enabled: Boolean(userProfile.data?.id) },
  );

  const followUser = api.userRouter.followUser.useMutation({
    onSuccess: async () => {
      await userRoute.getAllFollowers.invalidate();
      await userRoute.getAllFollowing.invalidate();
      await userRoute.getUserProfile.invalidate();
      toast.success("User followed 🎉");
    },
    onError: (error) => toast.error(error.message),
  });

  const unfollowUser = api.userRouter.unfollowUser.useMutation({
    onSuccess: async () => {
      await userRoute.getAllFollowers.invalidate();
      await userRoute.getAllFollowing.invalidate();
      await userRoute.getUserProfile.invalidate();
      toast.success("User unfollowed 😭");
    },
  });

  return (
    <MainLayout>
      {/*The modal for displaying all the following*/}
      {followers.isSuccess && following.isSuccess && (
        <Modal
          isOpen={isFollowModalOpen.isOpen}
          onClose={() =>
            setFollowModalOpen((prev) => ({ ...prev, isOpen: false }))
          }
        >
          <div className="flex w-full flex-col items-center justify-center space-y-4">
            {isFollowModalOpen.modalType === "followers" && (
              <>
                <h3 className="text-xl">Followers</h3>
                {followers.data?.followedBy.map((user) => (
                  <div
                    key={user.id}
                    className="my-1 flex w-full items-center justify-between rounded-xl bg-gray-200 px-4 py-2"
                  >
                    <p>{user.name}</p>

                    <button
                      onClick={() =>
                        user.followedBy.length > 0
                          ? unfollowUser.mutate({ followingUserId: user.id })
                          : followUser.mutate({ followingUserId: user.id })
                      }
                      className="flex items-center space-x-3 rounded border border-gray-400/50 bg-white px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 dark:border-gray-500 dark:hover:border-gray-100 dark:hover:text-gray-100"
                    >
                      {user.followedBy.length > 0 ? "Unfollow" : "Follow"}
                    </button>
                  </div>
                ))}
              </>
            )}

            {isFollowModalOpen.modalType === "following" && (
              <>
                <h3 className="text-xl">Following</h3>
                {following.data?.following.map((user) => (
                  <div
                    key={user.id}
                    className="flex w-full items-center justify-between rounded-xl bg-gray-200 px-4 py-2"
                  >
                    <p>{user.name}</p>

                    <button
                      onClick={() =>
                        unfollowUser.mutate({ followingUserId: user.id })
                      }
                      className="flex items-center space-x-3 rounded border border-gray-400/50 bg-white px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 dark:border-gray-500 dark:hover:border-gray-100 dark:hover:text-gray-100"
                    >
                      Unfollow
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </Modal>
      )}

      <div className="flex w-full items-center justify-center">
        <div className="my-10 flex h-full w-full flex-col items-center justify-center lg:max-w-screen-md xl:max-w-screen-lg">
          <div className="flex w-full flex-col rounded-3xl bg-white shadow-md dark:bg-black">
            <div className="relative h-44 w-full rounded-t-3xl bg-gradient-to-r from-rose-100 to-teal-100 dark:from-purple-800 dark:to-indigo-800">
              <div className="absolute -bottom-10 left-12">
                {/* Userprofile header */}
                <div className="group relative h-28 w-28 rounded-full border-2 border-white bg-gray-100">
                  {/* This ensures that only the owner can edit their user profile */}
                  {currentUser.data?.user?.id === userProfile.data?.id && (
                    <label
                      htmlFor="avatarFile"
                      className="absolute z-10 flex h-full w-full cursor-pointer items-center justify-center rounded-full transition group-hover:bg-black/40"
                    >
                      <BiEdit className="hidden text-3xl text-white group-hover:block" />

                      <input
                        type="file"
                        name="avatarFile"
                        id="avatarFile"
                        className="sr-only"
                        // accept=".jpg, .jpeg, .png"
                        accept=".png"
                        onChange={handleImageChange}
                        multiple={false}
                      />
                    </label>
                  )}
                  {!objectImage && userProfile.data?.image && (
                    <Image
                      src={userProfile.data?.image}
                      alt={`${userProfile.data.name ?? "User"}'s avatar`}
                      // fill
                      width={120}
                      height={120}
                      className="rounded-full"
                    />
                  )}
                  {objectImage && (
                    <Image
                      src={objectImage}
                      alt={userProfile.data?.name ?? ""}
                      // fill
                      width={120}
                      height={120}
                      className="rounded-full"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="ml-12 mt-8 flex flex-col space-y-0.5 rounded-b-3xl py-5">
              <div className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {userProfile.data?.name}
              </div>
              <div className="text-gray-600 dark:text-gray-200">
                <p>@{userProfile.data?.username}</p>
              </div>
              <div className="flex flex-col text-gray-600 dark:text-gray-200">
                <p>{userProfile.data?._count.articles} published articles</p>

                {userProfile.data?.created_at && (
                  <span className="text-xs text-gray-500">
                    Joined:{" "}
                    {dayjs(userProfile.data.created_at).format("MMM YYYY")}
                  </span>
                )}
              </div>

              {/*This shows the following and follower count*/}
              <div className="flex items-center space-x-4">
                {/*The followers functionality*/}
                <button
                  onClick={() =>
                    setFollowModalOpen({ isOpen: true, modalType: "followers" })
                  }
                  className="cursor-pointer text-gray-700 hover:text-gray-900 focus:outline-none dark:text-gray-300 dark:hover:text-gray-100"
                >
                  <p className="">
                    {userProfile.data?._count.followedBy} Followers
                  </p>
                </button>

                {/*The following functionality*/}
                <button
                  onClick={() =>
                    setFollowModalOpen({ isOpen: true, modalType: "following" })
                  }
                  className="cursor-pointer text-gray-700 hover:text-gray-900 focus:outline-none dark:text-gray-300 dark:hover:text-gray-100"
                >
                  <p className="">
                    {userProfile.data?._count.following} Following
                  </p>
                </button>
              </div>

              {/* Share button and Follow/Unfollow button */}
              <div className="flex w-full items-center space-x-8 pt-2">
                {/* Share button functionality */}
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(window.location.href);
                    toast.success("URL copied to clipboard 🚀");
                  }}
                  className="flex transform items-center space-x-3 rounded border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 active:scale-95 dark:border-gray-500 dark:hover:border-gray-100 dark:hover:text-gray-100"
                >
                  <span>Share</span>
                  <span>
                    <SlShareAlt />
                  </span>
                </button>
                {/* Follow button functionality */}
                {userProfile.isSuccess && userProfile.data?.followedBy && (
                  <button
                    onClick={() => {
                      if (userProfile.data?.id) {
                        if (userProfile.data.followedBy.length > 0) {
                          return unfollowUser.mutate({
                            followingUserId: userProfile.data?.id,
                          });
                        } else {
                          return followUser.mutate({
                            followingUserId: userProfile.data?.id,
                          });
                        }
                      }
                    }}
                    className="flex transform items-center space-x-3 rounded border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 active:scale-95 dark:border-gray-500 dark:hover:border-gray-100 dark:hover:text-gray-100"
                  >
                    {userProfile.data?.followedBy.length > 0
                      ? "Unfollow"
                      : "Follow"}
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* This will fetch the user's articles */}
          <div className="my-10">
            {userArticles.isSuccess &&
              userArticles.data?.articles.map((userArticle) => (
                <Article {...userArticle} key={userArticle.id} />
              ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
