import { getServerConfig } from "@/config";

const { YOUTUBE_API_KEY } = getServerConfig();

export async function getYouTubePlaylist(url: string): Promise<{
  title: string;
  thumbnail: string;
  providerMeta: string;
}> {
  const playlistId = new URL(url).searchParams.get("list");

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `YouTube API returned ${response.status}: ${
        response.statusText
      }: ${await response.text()}`
    );
  }

  const json = await response.json();

  const { title, thumbnails } = json.items[0].snippet;

  return {
    title,
    thumbnail: thumbnails.high.url,
    providerMeta: JSON.stringify(json.items[0].snippet),
  };
}
