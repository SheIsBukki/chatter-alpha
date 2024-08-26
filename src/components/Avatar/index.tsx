import Image from "next/image";
import React from "react";

type AvatarPropsType = {
  src: string;
  alt: string;
};

export default function Avatar({ src, alt }: AvatarPropsType) {
  return <Image src={src} alt={alt} fill className="rounded-full" />;
}
