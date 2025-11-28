import { useEffect, useState } from "react";

export interface UserActivityStats {
  totalCasts: number;
  totalLikesReceived: number;
  totalRecastsReceived: number;
  totalCommentsReceived: number;
  isComplete: boolean;
}

export function useUserActivity(context?: { user?: { fid?: number } }) {
  const [user, setUser] = useState<UserActivityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!context?.user?.fid) {
      setUser(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/user-activity?fids=${context.user.fid}`)
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.users?.[0]) {
          setUser({ ...data.users[0], userStats: data.userStats });
        } else {
          setUser(null);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [context?.user?.fid]);

  return { user, loading, error };
}
