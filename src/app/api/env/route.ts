import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Simple protection: only show this if the secret matches or in dev
  if (process.env.NODE_ENV === "production" && secret !== "selim-debug-2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const envs = {
    DATABASE_URL: {
      set: !!process.env.DATABASE_URL,
      length: process.env.DATABASE_URL?.length || 0,
    },
    JWT_SECRET: {
      set: !!process.env.JWT_SECRET,
      length: process.env.JWT_SECRET?.length || 0,
    },
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: {
      set: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      value: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || null,
    },
    CLOUDINARY_API_KEY: {
      set: !!process.env.CLOUDINARY_API_KEY,
      length: process.env.CLOUDINARY_API_KEY?.length || 0,
    },
    CLOUDINARY_API_SECRET: {
      set: !!process.env.CLOUDINARY_API_SECRET,
      length: process.env.CLOUDINARY_API_SECRET?.length || 0,
    },
    NEXT_PUBLIC_APP_URL: {
      set: !!process.env.NEXT_PUBLIC_APP_URL,
      value: process.env.NEXT_PUBLIC_APP_URL || null,
    },
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: !!process.env.VERCEL,
  };

  return NextResponse.json({
    message: "Environment Variables Diagnostics",
    timestamp: new Date().toISOString(),
    envs,
  });
}
