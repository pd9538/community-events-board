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
    const reminders = await prisma.reminder.findMany({
      where: {
        userId: user.userId,
      },
      select: {
        eventId: true,
      },
    });

    return NextResponse.json({
      success: true,
      eventIds: reminders.map((reminder) => reminder.eventId),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reminders",
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
    const eventId = Number(body.eventId);

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid eventId is required",
        },
        { status: 400 }
      );
    }

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        isActive: true,
        dateTime: {
          gte: new Date(),
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found or is no longer available",
        },
        { status: 404 }
      );
    }

    const reminder = await prisma.reminder.upsert({
      where: {
        userId_eventId: {
          userId: user.userId,
          eventId,
        },
      },
      update: {},
      create: {
        userId: user.userId,
        eventId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reminder saved successfully",
      reminder: {
        eventId: reminder.eventId,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save reminder",
      },
      { status: 500 }
    );
  }
}