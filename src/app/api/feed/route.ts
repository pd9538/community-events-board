import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/require-auth";

export async function GET(request: Request) {
  const user = getAuthUser(request);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication required",
      },
      { status: 401 }
    );
  }

  try {
    // Get user's favourite categories
    const favourites = await prisma.categoryPreference.findMany({
      where: {
        userId: user.userId,
      },
      select: {
        category: true,
      },
    });

    const categories = favourites.map((item) => item.category);

    // No favourite categories yet
    if (categories.length === 0) {
      return NextResponse.json({
        success: true,
        categories: [],
        events: [],
        message: "Please select your favourite categories.",
      });
    }

    // Get upcoming active events from favourite categories
    const events = await prisma.event.findMany({
      where: {
        isActive: true,
        dateTime: {
          gte: new Date(),
        },
        category: {
          in: categories,
        },
      },
      orderBy: {
        dateTime: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      categories,
      events,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch your feed",
      },
      { status: 500 }
    );
  }
}