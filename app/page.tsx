import App from "@/components/app";
import { APP_URL } from "@/lib/constants";
import type { Metadata } from "next";

const frame = {
  version: "next",
  imageUrl: `${APP_URL}/feed.png`,
  button: {
    title: "Play",
    action: {
      type: "launch_frame",
      name: "Base Spin",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#1E90FF",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Base Spin",
    openGraph: {
      title: "Base Spin Farcaster MiniGame",
      description: "A base ecosystem mini game for fun and earn!",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
