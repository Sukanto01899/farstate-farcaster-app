import { quickAuth } from "@farcaster/miniapp-sdk";
import { useMutation } from "@tanstack/react-query";

export interface CastData {
  contentType: string;
  cast: string;
  message: string;
  remaining: number;
  date: string;
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
      const res = await fetch("/api/create-cast", {
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
  return {
    generateCast,
    castData: data,
    isCastCreating,
    isCastCreatingSuccess,
    isCastCreatingError,
    castCreatingError,
  };
};

export default useCreateCast;
