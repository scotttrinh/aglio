import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import EdgeDBAdapter from "@/authAdapter";
import { getServerConfig } from "@/config";
import { client } from "@/client";

const { GOOGLE_ID, GOOGLE_SECRET } = getServerConfig();

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_ID,
      clientSecret: GOOGLE_SECRET,
    }),
  ],
  adapter: EdgeDBAdapter(client),
};
