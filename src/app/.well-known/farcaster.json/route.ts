import { NextResponse } from "next/server";
import { getFarcasterDomainManifest } from "~/lib/utils";

export async function GET() {
  try {
    const config = await getFarcasterDomainManifest();
    const content = {
      ...config,
      baseBuilder: {
        builderAddress: "0xB23955A49c9974a40e68717813a108002072a368",
      },
    };
    return NextResponse.json(content);
  } catch (error) {
    console.error("Error generating metadata:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
