import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-auth";

export async function GET(request: Request) {
  const auth = requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  try {
    const events = await prisma.event.findMany({
      orderBy: {
        dateTime: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      events,
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
export async function POST(request: Request) {
  const auth = requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();

    const {
      title,
      category,
      city,
      dateTime,
      price,
      description,
      imageUrl,
    } = body;

    if (
      !title ||
      !category ||
      !city ||
      !dateTime ||
      price === undefined ||
      !description ||
      !imageUrl
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All event fields are required",
        },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        category,
        city,
        dateTime: new Date(dateTime),
        price: Number(price),
        description,
        imageUrl,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create event",
      },
      { status: 500 }
    );
  }
}