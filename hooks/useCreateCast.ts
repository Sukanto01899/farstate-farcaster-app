import { quickAuth } from "@farcaster/miniapp-sdk";
import { useMutation } from "@tanstack/react-query";

export interface CastData {
  contentType: string;
  cast: string;
  message: string;
  remaining: number;
  date: string;
}
export interface ThumbnailData {
  contentType: string;
  imageBase64: string;
  message: string;
  remaining: number;
  date: string;
  limit: number;
  imageUrl: string;
}

const useCreateCast = () => {
  const {
    mutateAsync: generateCast,
    isPending: isCastCreating,
    isSuccess: isCastCreatingSuccess,
    isError: isCastCreatingError,
    data,
    error: castCreatingError,
  } = useMutation({
    mutationFn: async (prompt: string): Promise<CastData> => {
      if (!quickAuth) {
        throw new Error("QuickAuth is not available");
      }
      const { token } = await quickAuth.getToken();
      const res = await fetch("/api/ai/create-cast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      // parse and return JSON so onSuccess receives the parsed object (with `success`)
      return (await res.json()) as CastData;
    },
  });
  const {
    mutateAsync: generateThumbnail,
    isPending: isThumbnailCreating,
    isSuccess: isThumbnailCreatingSuccess,
    isError: isThumbnailCreatingError,
    data: thumbnail,
    error: thumbnailCreatingError,
  } = useMutation({
    mutationFn: async (prompt: string): Promise<ThumbnailData> => {
      if (!quickAuth) {
        throw new Error("QuickAuth is not available");
      }
      const { token } = await quickAuth.getToken();
      const res = await fetch("/api/ai/create-thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      // parse and return JSON so onSuccess receives the parsed object (with `success`)
      return (await res.json()) as ThumbnailData;
    },
  });

  return {
    generateCast,
    generateThumbnail,
    isThumbnailCreating,
    isThumbnailCreatingSuccess,
    isThumbnailCreatingError,
    thumbnailCreatingError,
    thumbnail,
    castData: data,
    isCastCreating,
    isCastCreatingSuccess,
    isCastCreatingError,
    castCreatingError,
  };
};

export default useCreateCast;
