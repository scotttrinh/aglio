import { getServerConfig } from "@/config";
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const { GOOGLE_ID, GOOGLE_SECRET } = getServerConfig();

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_ID,
      clientSecret: GOOGLE_SECRET,
    }),
  ],
}

export default NextAuth(authOptions);
