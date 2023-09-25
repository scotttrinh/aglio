import { redirect } from "next/navigation";
import { Inter } from "next/font/google";
import clsx from "clsx";

import { getSession } from "@/getSession";

const inter = Inter({ subsets: ["latin"] });

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect("/sequences");
  }

  return (
    <h1 className={clsx("text-3xl")}>
      Welcome to Aglio, a fragrant focus timer.
    </h1>
  );
}
