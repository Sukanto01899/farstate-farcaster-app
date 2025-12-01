import {
  AwardIcon,
  CheckCircle,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

export const APP_URL = process.env.NEXT_PUBLIC_URL;

if (!APP_URL) {
  throw new Error("NEXT_PUBLIC_URL or NEXT_PUBLIC_VERCEL_URL is not set");
}

export const notificationsBtn = [
  {
    id: 1,
    name: "Draw Started",
    title: "🎉 New Draw started",
    body: "Join now to win big rewards 💰!",
  },
  {
    id: 2,
    name: "Winner Selected",
    title: "🏆 Lottery Winners selected!",
    body: "Check and claim rewards from lottery tab 🥇!",
  },
  {
    id: 3,
    name: "Giveaway Started",
    title: "🎉 Claim your prize now!",
    body: "FCFS giveaway started. Open app and claim now ⚡!",
  },
  {
    id: 4,
    name: "Daily spin",
    title: "🎡 You forgot to spin!",
    body: "Open app and claim daily free spin ⚡!",
  },
  {
    id: 5,
    name: "Mint NFT",
    title: "🎉 MINT your Warplet Monster!",
    body: "Get Exclusive rewards and utilities for Holder ⚡!",
  },
  {
    id: 6,
    name: "Unclaimed",
    title: "🎗️ Unclaimed rewards reminder!",
    body: "Open app and check for any unclaimed rewards ⚡!",
  },
  {
    id: 7,
    name: "Invite started",
    title: "🎉 Invite & Earn rewards!",
    body: "Invite your friends & earn more BXP ⚡!",
  },
  {
    id: 8,
    name: "Draw ending",
    title: "🚩 Draw is ending soon!",
    body: "Hurry up and participate before end! 🏃‍➡️",
  },
  {
    id: 8,
    name: "Weekly Airdrop",
    title: "✔️ Check Airdrop Eligibility!",
    body: "Weekly airdrop program enabled, check now! ✨",
  },
];

export const APP_NAME = "Farstate Ai";
export const APP_DESCRIPTION =
  "Farstate Ai helps you track your Farcaster engagement metrics, wallet information, and generate cast with Ai, with detailed analytics and insights.";
export const APP_OG_IMAGE_URL = `${APP_URL}/feed.png`;
export const APP_BUTTON_TEXT = "Check State";
export const APP_SPLASH_URL = `${APP_URL}/splash.png`;
export const APP_ICON_URL = `${APP_URL}/icon.png`;
export const APP_SPLASH_BACKGROUND_COLOR = "#cb6ce6";
export const APP_PRIMARY_CATEGORY = "social";
export const APP_TAGS = [
  "neynar",
  "farcaster",
  "analytics",
  "reputation",
  "ai",
];
export const APP_WEBHOOK_URL = `${APP_URL}/api/webhook`;
export const APP_ACCOUNT_ASSOCIATION = {
  header:
    "eyJmaWQiOjMxNzI2MSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDQ5ZWUzMjNFYTFCYjY1RjY4RkE3NWRmMGM2RDQ0MWQyMGQ4M0E4Q2QifQ",
  payload: "eyJkb21haW4iOiJmYXJzdGF0ZS52ZXJjZWwuYXBwIn0",
  signature:
    "TAFouFoy5C5A5APwUo+lvqNqvNj/RuSC9DCZ2eeFAwZgbQwABnOPl9+WcoYE4Z0PvC0ycFEJxYQQdidCGZwL5hw=",
};

export const castCategories = [
  {
    id: 1,
    name: "Tech News",
    icon: Zap,
    color: "bg-blue-900 border-blue-600",
  },
  {
    id: 2,
    name: "Crypto Updates",
    icon: TrendingUp,
    color: "bg-emerald-900 border-emerald-600",
  },
  {
    id: 3,
    name: "Motivational",
    icon: AwardIcon,
    color: "bg-amber-900 border-amber-600",
  },
  {
    id: 4,
    name: "Community",
    icon: MessageSquare,
    color: "bg-purple-900 border-purple-600",
  },
  {
    id: 5,
    name: "Meme",
    icon: Sparkles,
    color: "bg-pink-900 border-pink-600",
  },
  {
    id: 6,
    name: "Question",
    icon: CheckCircle,
    color: "bg-indigo-900 border-indigo-600",
  },
];
