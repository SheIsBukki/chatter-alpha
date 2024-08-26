// // "use client";

// import Link from "next/link";
// import { AiOutlineLoading3Quarters } from "react-icons/ai";
// import Image from "next/image";
// import { api } from "@/utils/api";

// export default function ArticleCards() {
//   const getArticles = api.articleRouter.getArticles.useQuery();
//   const regularDate = (dateValue: Date) => {
//     return new Date(dateValue).toLocaleDateString("en-uk", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   return (
//     <div className="flex w-full flex-col justify-center space-y-8">
//       {getArticles.isPending && (
//         <div className="flex h-full w-full items-center justify-center space-x-4">
//           <div>
//             <AiOutlineLoading3Quarters className="animate-spin" />
//           </div>
//           <div>Loading...</div>
//         </div>
//       )}

//       {getArticles.isSuccess &&
//         getArticles.data.map((article) => (
//           <Link
//             href={`/${article.slug}`}
//             key={article.id}
//             className="group flex flex-col space-y-4 border-b border-gray-300 pb-8 last:border-none"
//           >
//             {/* Author's info and publication info */}
//             <div className="flex w-full items-center space-x-2">
//               <div className="relative h-10 w-10 rounded-full bg-gray-400">
//                 {article.author.image && (
//                   <Image
//                     className="h-full w-full rounded-full bg-gray-400"
//                     alt={
//                       `${article.author.name}'s avatar` ?? "No profile picture"
//                     }
//                     src={article.author.image}
//                     width={100}
//                     height={100}
//                   />
//                 )}
//               </div>
//               <div>
//                 <p className="font-semibold">
//                   {article.author.name} &#8226; {regularDate(article.createdAt)}
//                   {/* Bukola Ogunleye &#8226;{" "}
//                         {dayjs(article.createdAt).format("DD/MM/YYYY")} */}
//                 </p>
//                 <p className="text-sm">Software Engineer</p>
//               </div>
//             </div>
//             {/* Article */}
//             <div className="grid w-full grid-cols-12 gap-4">
//               {/* The div below is for the article title and content */}
//               <div className="col-span-8 flex flex-col space-y-4">
//                 <p className="text-2xl font-bold text-gray-800 decoration-green-600 group-hover:underline">
//                   {article.title}
//                 </p>
//                 <p className="break-words text-sm text-gray-500">
//                   {article.description}
//                 </p>
//               </div>

//               {/* The div below is for the article image */}
//               <div className="col-span-4">
//                 <div className="h-full w-full rounded-xl bg-gray-300 transition duration-300 hover:scale-105 hover:shadow-xl"></div>
//                 {/* <Image className="bg-gray-500 w-full rounded-full h-full"
//                         alt="author's avatar"
//                         src={i}
//                         width={100}
//                         height={100}
//                       /> */}
//               </div>
//             </div>

//             {/* Tags related to the rendered feed articles */}
//             <div>
//               <div className="flex w-full items-center justify-start space-x-4">
//                 <div className="flex items-center space-x-2">
//                   {Array.from({ length: 4 }).map((_, i) => (
//                     <div
//                       key={i}
//                       className="rounded-2xl bg-gray-200/50 px-5 py-3"
//                     >
//                       tag {i}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </Link>
//         ))}
//     </div>
//   );
// }
