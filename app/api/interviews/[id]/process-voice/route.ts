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

    // Extract text from JSON body
    const body = await req.json();
    const userTextParam = body.text;

    if (!userTextParam) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Verify interview belongs to user
    const interview = await Interview.findOne({ _id: interviewId, userId: session.user.id });
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // 2. Fetch past messages for context
    const pastMessages = await Message.find({ interviewId }).sort({ timestamp: 1 });
    
    const systemPrompt = `You are an expert technical interviewer. 
    Interview Type: ${interview.interviewType}
    ${interview.interviewType === "topic" ? `Topic: ${interview.topic}` : `Role: ${interview.role}\nResume: ${interview.resumeText}`}
    ${interview.difficulty ? `Difficulty Level: ${interview.difficulty}` : ''}
    ${interview.includeCodingRound ? `Coding Round Enabled: You are encouraged to ask coding questions where the user must implement a solution in code.` : 'No coding round. Keep questions verbal.'}
    
    Conduct a professional, realistic interview. Ask one question at a time. Do not break character. 
    If the user answers, evaluate it implicitly and ask a follow-up or the next question. Ensure your questioning complexity matches the specified Difficulty Level.
    If your next question requires the user to write code (implementation), you MUST set "requiresCoding" to true. Otherwise, set it to false.
    Keep your verbal responses concise, conversational, and natural for a voice-based interaction.`;

    // Initialize provider model
    let model;
    if (providerStr === "google") {
      const google = createGoogleGenerativeAI({ apiKey });
      model = google("gemini-flash-latest");
    } else if (providerStr === "openai") {
      const openai = createOpenAI({ apiKey });
      model = openai("gpt-4o-mini");
    } else if (providerStr === "anthropic") {
      const anthropic = createAnthropic({ apiKey });
      model = anthropic("claude-3-5-sonnet-latest");
    } else {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const history: any[] = pastMessages.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content
    }));

    // Use generateObject to get structured output
    const { object } = await generateObject({
      model,
      system: systemPrompt,
      messages: [
        ...history,
        { role: "user", content: userTextParam }
      ],
      schema: z.object({
        aiResponse: z.string().describe("Your actual conversational response as the interviewer."),
        requiresCoding: z.boolean().describe("Set to true if your response asks the user to write/implement code.")
      }),
    });

    const aiText = object.aiResponse || "I didn't quite catch that.";
    const requiresCoding = object.requiresCoding || false;

    // Save Messages
    await Message.create({ interviewId, role: "user", content: userTextParam });
    await Message.create({ interviewId, role: "ai", content: aiText });

    // Return the JSON directly to the frontend to handle Native TTS
    return NextResponse.json({
      userText: userTextParam,
      aiText,
      requiresCoding
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error processing text:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

