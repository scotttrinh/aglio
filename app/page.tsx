import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { Inter } from "next/font/google";
import clsx from "clsx";

import { authOptions } from "@/authOptions";

const inter = Inter({ subsets: ["latin"] });

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/sequences");
  }

  return <h1 className={clsx("text-3xl")}>Welcome to Aglio, a fragrant focus timer.</h1>;
}
