import { useQuery } from "@tanstack/react-query";

export interface NeynarUser {
  fid: number;
  score: number;
  pro: {
    status: string;
  };
  follower_count: number;
  following_count: number;
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
}

export function useNeynarUser(context?: { user?: { fid?: number } }) {
  const fid = context?.user?.fid;
  const { data, isLoading, error } = useQuery({
    queryKey: ["neynar-user", fid],
    enabled: !!fid,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await fetch(`/api/users?fids=${fid}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const body = await res.json();
      return (body.users?.[0] ?? null) as NeynarUser | null;
    },
  });

  return {
    user: data ?? null,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
