import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { Inter } from "next/font/google";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

const inter = Inter({ subsets: ["latin"] });

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/sequences");
  }

  return (
    <main>
        <div>
          <a href="/api/auth/signin">Sign in</a>
        </div>
    </main>
  );
}
