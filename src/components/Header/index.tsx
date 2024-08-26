// import { useContext } from "react";
import { IoReorderThreeOutline } from "react-icons/io5";
import { BsBell } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { signIn, signOut, useSession } from "next-auth/react";
import { HiLogout } from "react-icons/hi";
import Link from "next/link";
// import { GlobalContext } from "@/context/GlobalContextProvider";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function Header() {
  const { status } = useSession();

  // const { setWriteModalOpen } = useContext(GlobalContext);

  return (
    <header className="flex h-20 w-full flex-row items-center justify-around border-b-[1px] border-gray-300">
      <div className="flex items-center space-x-4">
        <menu>
          <IoReorderThreeOutline className="text-2xl" />
        </menu>
        <ThemeSwitcher />
      </div>

      <Link href={"/"} className="cursor-pointer select-none text-xl font-thin">
        Community feed
      </Link>
      {status === "authenticated" ? (
        <div className="flex items-center space-x-4">
          <div>
            <BsBell className="text-2xl text-gray-600" />
          </div>
          <div className="h-5 w-5 rounded-full bg-gray-600">
            <Link href={`/user`}></Link>
          </div>

          {/* The div element below is for the conditionally rendered write button */}
          <div>
            <button
              // onClick={() => setWriteModalOpen(true)}
              className="flex items-center space-x-3 rounded border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 dark:border-gray-500 dark:hover:border-gray-100 dark:hover:text-gray-100"
            >
              {/* <span>Write</span> */}
              <Link href={"/editor"}>Write</Link>
              <span>
                <FiEdit />
              </span>
            </button>
          </div>
          {/* The div below is for the conditionally rendered signout button */}
          <div>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-3 rounded border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 dark:border-gray-500 dark:hover:border-gray-100 dark:hover:text-gray-100"
            >
              <div>Log out</div>
              <div>
                <HiLogout />
              </div>
            </button>
          </div>
        </div>
      ) : (
        //   The div element below is for the sign in button that will be conditionally rendered if the user is not authenticated

        <div>
          <button
            onClick={() => signIn()}
            className="flex items-center space-x-3 rounded border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 dark:border-gray-500 dark:hover:border-gray-100 dark:hover:text-gray-100"
          >
            Sign in
          </button>
        </div>
      )}
    </header>
  );
}
