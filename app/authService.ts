import { z } from "zod";

import { getServerConfig } from "@/config";

export const TOKEN_URL = new URL(
  "token",
  getServerConfig().EDGEDB_AUTH_BASE_URL
);

export const makeTokenUrl = (code: string, verifier: string) => {
  const url = new URL(TOKEN_URL);
  url.searchParams.set("code", code);
  url.searchParams.set("verifier", verifier);
  return url;
};

export const AUTHENTICATE_URL = new URL(
  "authenticate",
  getServerConfig().EDGEDB_AUTH_BASE_URL
);

export const CodeResponse = z.object({
  code: z.string(),
});

export const TokenResponse = z.object({
  auth_token: z.string(),
  identity_id: z.string(),
});
