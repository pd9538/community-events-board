import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/require-auth";

const validThemes = [
  "SUNSET",
  "MIDNIGHT",
  "MINT",
] as const;

const validStickers = [
  "🎵",
  "🎉",
  "🍕",
  "🏆",
  "👨‍👩‍👧‍👦",
] as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
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
    const { eventId } = await context.params;
    const id = Number(eventId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID",
        },
        { status: 400 }
      );
    }

    const design = await prisma.cardDesign.findUnique({
      where: {
        userId_eventId: {
          userId: user.userId,
          eventId: id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      design: design
        ? {
            theme: design.theme,
            stickers: design.stickers,
          }
        : null,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch card design",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
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
    const { eventId } = await context.params;
    const id = Number(eventId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID",
        },
        { status: 400 }
      );
    }

    // Make sure the event exists
    const event = await prisma.event.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const theme = body.theme;
    const stickers = body.stickers;

    // Validate theme
    if (!validThemes.includes(theme)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid theme",
          allowedThemes: validThemes,
        },
        { status: 400 }
      );
    }

    // Validate stickers
    if (!Array.isArray(stickers)) {
      return NextResponse.json(
        {
          success: false,
          message: "stickers must be an array",
        },
        { status: 400 }
      );
    }

    if (stickers.length > 3) {
      return NextResponse.json(
        {
          success: false,
          message: "You can select maximum 3 stickers",
        },
        { status: 400 }
      );
    }

    const invalidStickers = stickers.filter(
      (sticker: string) =>
        !validStickers.includes(sticker as (typeof validStickers)[number])
    );

    if (invalidStickers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid sticker provided",
          allowedStickers: validStickers,
        },
        { status: 400 }
      );
    }

    const uniqueStickers = [...new Set(stickers)];

    const design = await prisma.cardDesign.upsert({
      where: {
        userId_eventId: {
          userId: user.userId,
          eventId: id,
        },
      },
      update: {
        theme,
        stickers: uniqueStickers,
      },
      create: {
        userId: user.userId,
        eventId: id,
        theme,
        stickers: uniqueStickers,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Card design saved successfully",
      design: {
        theme: design.theme,
        stickers: design.stickers,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save card design",
      },
      { status: 500 }
    );
  }
}