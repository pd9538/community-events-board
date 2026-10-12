import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/require-auth";

const validCategories = [
  "MUSIC",
  "WORKSHOP",
  "FOOD",
  "SPORTS",
  "KIDS",
] as const;

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
    const favourites = await prisma.categoryPreference.findMany({
      where: {
        userId: user.userId,
      },
      select: {
        category: true,
      },
      orderBy: {
        category: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      categories: favourites.map((item) => item.category),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch favourite categories",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    const body = await request.json();
    const categories = body.categories;

    if (!Array.isArray(categories)) {
      return NextResponse.json(
        {
          success: false,
          message: "categories must be an array",
        },
        { status: 400 }
      );
    }

    const invalidCategories = categories.filter(
      (category: string) => !validCategories.includes(category as any)
    );

    if (invalidCategories.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category provided",
          invalidCategories,
        },
        { status: 400 }
      );
    }

    const uniqueCategories = [
      ...new Set(categories),
    ] as (typeof validCategories)[number][];

    await prisma.$transaction(async (tx) => {
      await tx.categoryPreference.deleteMany({
        where: {
          userId: user.userId,
        },
      });

      if (uniqueCategories.length > 0) {
        await tx.categoryPreference.createMany({
          data: uniqueCategories.map((category) => ({
            userId: user.userId,
            category,
          })),
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Favourite categories updated successfully",
      categories: uniqueCategories,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update favourite categories",
      },
      { status: 500 }
    );
  }
}