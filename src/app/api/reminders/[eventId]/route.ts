import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/require-auth";

export async function DELETE(
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

    await prisma.reminder.deleteMany({
      where: {
        userId: user.userId,
        eventId: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reminder removed successfully",
      eventId: id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove reminder",
      },
      { status: 500 }
    );
  }
}