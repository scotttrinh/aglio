import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import * as edgedb from "edgedb";

import EdgeDBAdapter from "@/authAdapter";
import { getServerConfig } from "@/config";

const { GOOGLE_ID, GOOGLE_SECRET } = getServerConfig();

const edgeDBClient = edgedb.createClient();

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_ID,
      clientSecret: GOOGLE_SECRET,
    }),
  ],
  adapter: EdgeDBAdapter(edgeDBClient)
}
