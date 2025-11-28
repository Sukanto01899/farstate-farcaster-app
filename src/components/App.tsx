"use client";

import { useEffect } from "react";
import { useMiniApp } from "@neynar/react";
import { Header } from "~/components/ui/Header";
import { Footer } from "~/components/ui/Footer";
import {
  HomeTab,
  ActionsTab,
  ContextTab,
  WalletTab,
} from "~/components/ui/tabs";
import { USE_WALLET } from "~/lib/constants";
import LoadingPage from "./ui/LoadingPage";
import { useNeynarUser } from "~/hooks/useNeynarUser";

// --- Types ---
export enum Tab {
  Home = "home",
  Earn = "earn",
  Airdrop = "airdrop",
}

export interface AppProps {
  title?: string;
}

/**
 * App component serves as the main container for the mini app interface.
 *
 * This component orchestrates the overall mini app experience by:
 * - Managing tab navigation and state
 * - Handling Farcaster mini app initialization
 * - Coordinating wallet and context state
 * - Providing error handling and loading states
 * - Rendering the appropriate tab content based on user selection
 *
 * The component integrates with the Neynar SDK for Farcaster functionality
 * and Wagmi for wallet management. It provides a complete mini app
 * experience with multiple tabs for different functionality areas.
 *
 * Features:
 * - Tab-based navigation (Home, Actions, Context, Wallet)
 * - Farcaster mini app integration
 * - Wallet connection management
 * - Error handling and display
 * - Loading states for async operations
 *
 * @param props - Component props
 * @param props.title - Optional title for the mini app (defaults to "Neynar Starter Kit")
 *
 * @example
 * ```tsx
 * <App title="My Mini App" />
 * ```
 */
export default function App(
  { title }: AppProps = { title: "Neynar Starter Kit" }
) {
  // --- Hooks ---
  const {
    isSDKLoaded,
    context,
    setInitialTab,
    setActiveTab,
    currentTab,
    actions,
  } = useMiniApp();
  const { loading } = useNeynarUser(context || undefined);

  // --- Effects ---
  /**
   * Sets the initial tab to "home" when the SDK is loaded.
   *
   * This effect ensures that users start on the home tab when they first
   * load the mini app. It only runs when the SDK is fully loaded to
   * prevent errors during initialization.
   */
  useEffect(() => {
    if (isSDKLoaded) {
      setInitialTab(Tab.Home);
      actions?.addMiniApp();
    }
  }, [isSDKLoaded, setInitialTab, actions]);

  // --- Early Returns ---
  if (!isSDKLoaded || loading) {
    return <LoadingPage />;
  }

  // --- Render ---
  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
      className="min-h-screen bg-slate-950 pb-20"
    >
      {/* Header should be full width */}
      <Header />

      {/* Main Content */}
      <div className="relative px-4 py-6">
        {currentTab === Tab.Home && <HomeTab />}
      </div>

      {/* Footer */}
      <Footer activeTab={currentTab} setActiveTab={setActiveTab} />
    </div>
  );
}
