import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/db/mongodb";
import Interview from "@/lib/db/models/Interview";
import { NextRequest as Req } from "next/server";
// @ts-ignore
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function POST(req: Req) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let interviewType, topic, role, resumeText = "", difficulty = "Medium", includeCodingRound = false, duration = 10;

    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      interviewType = formData.get("interviewType") as string;
      role = formData.get("role") as string;
      const resumeFile = formData.get("resumeFile") as File;
      includeCodingRound = formData.get("includeCodingRound") === "true";
      if (formData.get("duration")) {
        duration = parseInt(formData.get("duration") as string, 10);
      }

      if (resumeFile) {
        const buffer = Buffer.from(await resumeFile.arrayBuffer());
        try {
          const pdfData = await pdfParse(buffer);
          resumeText = pdfData.text;
        } catch (err) {
          console.error("PDF Parsing error:", err);
          return NextResponse.json({ error: "Failed to parse PDF file." }, { status: 400 });
        }
      }
    } else {
      const body = await req.json();
      interviewType = body.interviewType;
      topic = body.topic;
      role = body.role;
      resumeText = body.resumeText || "";
      difficulty = body.difficulty || "Medium";
      includeCodingRound = !!body.includeCodingRound;
      if (body.duration) {
        duration = parseInt(body.duration, 10);
      }
    }

    await connectToDatabase();

    const newInterview = await Interview.create({
      userId: session.user.id,
      interviewType,
      topic,
      role,
      resumeText,
      difficulty,
      includeCodingRound,
      duration,
      status: "in-progress",
    });

    return NextResponse.json({ interviewId: newInterview._id }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating interview:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Req) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const interviews = await Interview.find({ userId: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json({ interviews }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
