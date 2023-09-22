import { z } from "zod";

export const getServerConfig = () =>
  z
    .object({
      EDGEDB_AUTH_BASE_URL: z.string(),
      YOUTUBE_API_KEY: z.string(),
    })
    .parse({
      EDGEDB_AUTH_BASE_URL: process.env.EDGEDB_AUTH_BASE_URL,
      YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    });
