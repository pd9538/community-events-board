import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const auth = requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await context.params;
    const eventId = Number(id);

    if (!Number.isInteger(eventId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID",
        },
        { status: 400 }
      );
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const allowedData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      allowedData.title = body.title;
    }

    if (body.category !== undefined) {
      allowedData.category = body.category;
    }

    if (body.city !== undefined) {
      allowedData.city = body.city;
    }

    if (body.dateTime !== undefined) {
      allowedData.dateTime = new Date(body.dateTime);
    }

    if (body.price !== undefined) {
      allowedData.price = Number(body.price);
    }

    if (body.description !== undefined) {
      allowedData.description = body.description;
    }

    if (body.imageUrl !== undefined) {
      allowedData.imageUrl = body.imageUrl;
    }

    if (body.isActive !== undefined) {
      allowedData.isActive = Boolean(body.isActive);
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: allowedData,
    });

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update event",
      },
      { status: 500 }
    );
  }
}