import { z } from "zod";

export const getServerConfig = () =>
  z
    .object({
      GOOGLE_ID: z.string(),
      GOOGLE_SECRET: z.string(),
      YOUTUBE_API_KEY: z.string(),
    })
    .parse({
      GOOGLE_ID: process.env.GOOGLE_ID,
      GOOGLE_SECRET: process.env.GOOGLE_SECRET,
      YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    });
