import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/db/mongodb";
import Interview from "@/lib/db/models/Interview";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const interview = await Interview.findOne({ _id: id, userId: session.user.id }).lean();
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    return NextResponse.json(interview, { status: 200 });
  } catch (error: any) {
    console.error("GET Interview error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
