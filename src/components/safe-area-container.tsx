import { useMiniApp } from "@neynar/react";

export interface SafeAreaInsets {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

interface SafeAreaContainerProps {
  children: React.ReactNode;
}

export const SafeAreaContainer = ({ children }: SafeAreaContainerProps) => {
  const { context } = useMiniApp();

  return (
    <main
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
      className="min-h-screen bg-slate-950 pb-20"
    >
      {children}
    </main>
  );
};
