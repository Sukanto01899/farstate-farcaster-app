import { useFrame } from "@/components/providers/farcaster-provider";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export type StatusType = {
  tier: string;
  expiresAt: number;
  text_limit: number;
  image_limit: number;
  text_used: number;
  image_used: number;
  text_remaining: number;
  image_remaining: number;
};

const useAiLimitStatus = () => {
  const { context } = useFrame();
  const fid = context && context?.user?.fid;
  const {
    data: status,
    isLoading: isStatusLoading,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: [fid],
    refetchOnReconnect: true,
    queryFn: async () => {
      if (!fid) return;
      const res = await fetch("/api/ai/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fid: fid,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      // parse and return JSON so onSuccess receives the parsed object (with `success`)
      return (await res.json()) as StatusType;
    },
  });
  return { status, isStatusLoading, refetchStatus };
};

export default useAiLimitStatus;
