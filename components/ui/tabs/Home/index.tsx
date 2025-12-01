"use client";

import { NeynarUser } from "@/hooks/useNeynarUser";
import FarcasterProfile from "./FarcasetrProfile";
import { UserActivityStats } from "@/hooks/useNeynerActivity";

/**
 * HomeTab component displays the main landing content for the mini app.
 *
 * This is the default tab that users see when they first open the mini app.
 * It provides a simple welcome message and placeholder content that can be
 * customized for specific use cases.
 *
 * @example
 * ```tsx
 * <HomeTab />
 * ```
 */
type HomeTabProps = {
  neynarUser: NeynarUser | null;
};

export function HomeTab({ neynarUser }: HomeTabProps) {
  return (
    <div className="space-y-4 animate-fadeIn">
      <FarcasterProfile neynarUser={neynarUser} />
    </div>
  );
}
