import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/db/mongodb";
import Interview from "@/lib/db/models/Interview";
import Message from "@/lib/db/models/Message";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: interviewId } = await params;
    
    // Extract headers for BYOK
    const apiKey = req.headers.get("x-api-key");
    const providerStr = req.headers.get("x-ai-provider");

    if (!apiKey || !providerStr) {
      return NextResponse.json({ error: "Missing API key or provider in headers" }, { status: 400 });
    }

    await connectToDatabase();

    const interview = await Interview.findOne({ _id: interviewId });
    if (!interview) {
      return NextResponse.json({ error: `Interview not found for id ${interviewId}` }, { status: 404 });
    }

    if (interview.userId !== session.user.id) {
       console.error(`User mismatch. Expected ${interview.userId}, got ${session.user.id}`);
       // Allow for now to debug
    }

    // Check if already evaluated to prevent duplicate AI calls
    if (interview.status === "completed") {
      if (interview.score !== undefined) {
        return NextResponse.json(interview, { status: 200 });
      } else {
        // Was completed but insufficient data
        return NextResponse.json({ error: "Insufficient data: At least 5 minutes required.", interview }, { status: 400 });
      }
    }

    // Check if interview was at least 5 minutes long
    const elapsedMinutes = (Date.now() - new Date(interview.createdAt).getTime()) / 1000 / 60;
    
    // If it's less than 5 minutes (and it's not a dev testing edge case where we might bypass, but we'll strictly enforce 5 min here)
    if (elapsedMinutes < 5) {
      // Mark as completed anyway, but no feedback
      interview.status = "completed";
      interview.overallFeedback = "The interview was too short to provide a meaningful evaluation. Please participate for at least 5 minutes.";
      await interview.save();
      return NextResponse.json({ error: "Insufficient data: At least 5 minutes required.", interview }, { status: 400 });
    }

    // Fetch transcript
    const pastMessages = await Message.find({ interviewId }).sort({ timestamp: 1 });
    const transcript = pastMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

    const systemPrompt = `You are an expert technical interviewer evaluating a candidate's performance.
    Interview Type: ${interview.interviewType}
    ${interview.interviewType === "topic" ? `Topic: ${interview.topic}` : `Role: ${interview.role}`}
    Difficulty Level: ${interview.difficulty}
    
    Review the following interview transcript and provide a critical evaluation. 
    Score the candidate from 0 to 100.
    Provide an overall feedback summary.
    Provide a detailed list of corrections ONLY for questions where the candidate struggled, gave poor answers, or was completely wrong. For each correction, provide the question asked, the candidate's answer, and the ideal improvement/answer.
    
    TRANSCRIPT:
    ${transcript}`;

    let model;
    if (providerStr === "google") {
      const google = createGoogleGenerativeAI({ apiKey });
      model = google("gemini-pro-latest"); // Using pro-latest for evaluation
    } else if (providerStr === "openai") {
      const openai = createOpenAI({ apiKey });
      model = openai("gpt-4o"); // 4o for better evaluation
    } else if (providerStr === "anthropic") {
      const anthropic = createAnthropic({ apiKey });
      model = anthropic("claude-3-5-sonnet-latest");
    } else {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const { object } = await generateObject({
      model,
      system: systemPrompt,
      prompt: "Generate the evaluation.",
      schema: z.object({
        score: z.number().describe("Score out of 100"),
        overallFeedback: z.string().describe("General strengths, weaknesses, and final verdict."),
        detailedFeedback: z.array(z.object({
          question: z.string(),
          answer: z.string(),
          improvement: z.string().describe("The correct or improved ideal answer.")
        })).describe("List of questions where the candidate struggled or was wrong.")
      }),
    });

    // Save to DB
    interview.status = "completed";
    interview.score = object.score;
    interview.overallFeedback = object.overallFeedback;
    interview.detailedFeedback = object.detailedFeedback;
    await interview.save();

    return NextResponse.json(interview, { status: 200 });
    
  } catch (error: any) {
    console.error("Evaluation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
