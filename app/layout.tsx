import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/providers";
import { APP_URL } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL as string),
  title: "Base Farcaster MiniApp Template",
  description: "A template for building mini-apps on Farcaster and Base",
  other: {
    "talentapp:project_verification":
      "5d324d1817f3897d25b0b84dfa7ee6a7bdc67aeb3008b204857c826fc8e71f2302d49e1ed825190eeba978852b760c8580d60415f5695546e20f6e78e37118dc",
  },
};
const config = {
  rpcUrl: "https://base-rpc.publicnode.com",
  domain: process.env.DOMAIN,
  siweUri: process.env.DOMAIN,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
