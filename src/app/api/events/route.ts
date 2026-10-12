import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const search = searchParams.get("search");

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 6, 1),
      20
    );

    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      dateTime: {
        gte: new Date(),
      },

      ...(category
        ? {
            category: category as
              | "MUSIC"
              | "WORKSHOP"
              | "FOOD"
              | "SPORTS"
              | "KIDS",
          }
        : {}),

      ...(city
        ? {
            city: {
              equals: city,
              mode: "insensitive" as const,
            },
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                description: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                city: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: {
          dateTime: "asc",
        },
        skip,
        take: limit,
      }),

      prisma.event.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch events",
      },
      { status: 500 }
    );
  }
}