import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT as string,
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const authParams = imagekit.getAuthenticationParameters();

    return NextResponse.json(authParams);
  } catch (error) {
    return NextResponse.json(
      { error: error, message: "Failed to get auth params for image kit" },
      { status: 500 }
    );
  }
}
