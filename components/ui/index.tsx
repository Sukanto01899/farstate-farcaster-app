"use client";

import { Tab, useFrame } from "../providers/farcaster-provider";
import { useEffect } from "react";
import { Header } from "./Header";
import { HomeTab } from "./tabs/Home";
import { BottomMenu } from "./BottomMenu";
import AnimatedBackground from "./AnimatedBackground";
import { useNeynarUser } from "@/hooks/useNeynarUser";
import AdminTab from "./tabs/Admin";
import CreateTab from "./tabs/Create";
import Analysis from "./tabs/Rewards";

export function App() {
  const { tab, actions, setTab, context } = useFrame();
  const { user: neynarUser } = useNeynarUser(context || undefined);

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
        {tab === Tab.Home && <HomeTab neynarUser={neynarUser} />}
        {tab === Tab.Create && <CreateTab />}
        {tab === Tab.Analysis && <Analysis />}
        {tab === Tab.Admin && <AdminTab />}
      </div>

      <BottomMenu activeTab={tab} setActiveTab={setTab} />
    </>
  );
}
