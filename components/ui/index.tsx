"use client";

import { Tab, useFrame } from "../providers/farcaster-provider";
import { useEffect } from "react";
import { Header } from "./Header";
import { HomeTab } from "./tabs/Home";
import { BottomMenu } from "./BottomMenu";
import EarnTab from "./tabs/Earn";
import AirdropTab from "./tabs/Airdrop";
import AnimatedBackground from "./AnimatedBackground";
import { useNeynarUser } from "@/hooks/useNeynarUser";
import { useNeynarUserActivity } from "@/hooks/useNeynerActivity";
import AdminTab from "./tabs/Admin";

export function App() {
  const { tab, actions, setTab, context } = useFrame();
  const { user: neynarUser } = useNeynarUser(context || undefined);
  const { user } = useNeynarUserActivity(context || undefined);
  useEffect(() => {
    if (actions) {
      actions?.addMiniApp();
    }
  }, [actions]);
  return (
    <>
      <AnimatedBackground />
      <Header />
      {/* Main Content */}
      <div className="relative px-4 pb-6 pt-20">
        {tab === Tab.Home && (
          <HomeTab neynarUser={neynarUser} userActivity={user} />
        )}
        {tab === Tab.Earn && <EarnTab />}
        {tab === Tab.Airdrop && <AirdropTab />}
        {tab === Tab.Admin && <AdminTab />}
      </div>

      <BottomMenu activeTab={tab} setActiveTab={setTab} />
    </>
  );
}
