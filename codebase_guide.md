# AI Interviewer Codebase Guide

Welcome to the AI Interviewer codebase! This guide is designed for developers who are familiar with Node.js but new to **Next.js**. Next.js introduces several new concepts (like Server Components, Client Components, Server Actions, and file-based routing) that change how we write React and Node.js applications.

We will walk through the code in a logical order, just as you would if you were building it from scratch, explaining things line-by-line with a focus on Next.js specific paradigms.

---

## 1. Project Configuration

### `package.json`
This is standard Node.js. 

```json
{
  "name": "ai_interviewer",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "16.2.10",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    // ...
  }
}
```
**Explanation:** 
- Next.js is built on top of React. Running `next dev` starts the local development server with Hot Module Replacement (HMR).

### `auth.ts`
To allow users to log in (e.g., via Google, GitHub, or Email), we configure **NextAuth**.

```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }),
    GitHub({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub; // Inject user ID into the session
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: { strategy: "jwt" },
});
```
**Line-by-Line Explanation:** 
- **`export const { handlers, signIn, signOut, auth } = NextAuth(...)`**: NextAuth acts as a unified layer for authentication. It returns `handlers` (which Next.js uses for the API endpoints like `/api/auth/[...nextauth]`), and helper functions (`signIn`, `signOut`, `auth`) that we can use anywhere in our Next.js app to check if a user is logged in or to log them out.
- The **`callbacks`** section is standard logic to ensure the user's ID is attached to the JWT token so we can query our MongoDB database later.

---

## 2. Database & Models
Before building the UI, we need a place to store data. We use MongoDB.

### `lib/db/mongodb.ts`
This file sets up a connection to MongoDB using Mongoose.

```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

export default connectToDatabase;
```
**Line-by-Line Explanation:** 
- **Next.js Note**: In a traditional Express.js app, you connect to MongoDB once when the server starts. Next.js, however, is designed to run in serverless environments (like AWS Lambda or Vercel). This means the server might boot up and shut down frequently.
- **`let cached = (global as any).mongoose;`**: To prevent Next.js from creating a new database connection on every single page load or API request, we attach the connection to the Node.js `global` object. 
- If `cached.conn` exists, we return it immediately. Otherwise, we create a new connection. This ensures connection pooling works properly in Next.js.

*(Note: The Mongoose Models like `lib/db/models/Interview.ts` are standard Mongoose schemas and don't contain Next.js specific logic, so they are omitted for brevity).*

---

## 3. The User Interface (UI) - App Router

Next.js uses a **File-System Based Router**. Any file named `page.tsx` inside the `app` directory becomes a route. Any file named `layout.tsx` wraps the pages inside that folder.

### `app/layout.tsx`
This wraps all your pages. It replaces the traditional `index.html`.

```tsx
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "AI Interviewer",
  description: "Ace your next interview with AI-powered mock interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} font-sans dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
```
**Line-by-Line Explanation:** 
- **`import { DM_Sans } from "next/font/google";`**: Next.js has a built-in font optimizer. It downloads Google Fonts at build time and serves them locally, preventing layout shifts and improving performance.
- **`export const metadata: Metadata = { ... }`**: This is how Next.js handles SEO. Instead of manually editing `<head>` tags, you export a `metadata` object. Next.js automatically generates the correct meta tags for you.
- **`export default function RootLayout({ children })`**: This is a React component that wraps your entire application. The `{children}` prop represents whatever specific page the user is navigating to.

### `app/page.tsx`
This is the homepage (mapped to the `/` route). By default, all components in Next.js are **React Server Components (RSC)**. This means this code executes *on the Node.js server*, not in the browser!

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">
          Welcome back, {session.user?.name}
        </h1>
        {/* ... dashboard links ... */}
        
        <form action={async () => { 
          "use server"; 
          await signOut(); 
        }}>
          <Button variant="ghost" type="submit">Sign Out</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* ... beautiful landing page ... */}
      <form action={async () => { 
        "use server"; 
        await signIn(); 
      }}>
        <Button type="submit" size="lg">Start Practicing for Free</Button>
      </form>
    </div>
  );
}
```
**Line-by-Line Explanation:** 
- **`export default async function Home()`**: Notice this is an `async` function. Standard React doesn't allow `async` components, but Next.js Server Components do! Because this runs on the server, we can fetch data directly without using `useEffect` or loading spinners.
- **`const session = await auth();`**: We securely check if the user is logged in on the server. The browser never sees this logic. If they are logged in, we render the dashboard. If not, we render the marketing landing page.
- **`"use server";`**: This is a massive feature in Next.js called **Server Actions**. Traditionally, to log a user out, you'd create a separate Node.js route (e.g., `/api/logout`), make an `onClick` handler, and send a `fetch` request. With Next.js, you just add `"use server"` inside a function. When the form is submitted, Next.js automatically creates a secure, hidden API endpoint behind the scenes and executes the Node.js code (`await signIn()` or `await signOut()`) securely on the server!

---

## 4. Setting up an Interview

When a user clicks "Topic Based Interview", they are taken to `/setup/topic`. Let's look at `app/setup/topic/page.tsx`.

### `app/setup/topic/page.tsx`
This page requires user interaction (typing in an input field). Because Server Components run on the server, they cannot use browser APIs like `useState` or `onClick`. Therefore, we must convert this into a **Client Component**.

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TopicSetupPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewType: "topic", topic }),
      });
      const data = await res.json();
      if (data.interviewId) {
        router.push(`/interview/${data.interviewId}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
      <Button type="submit">Start Interview</Button>
    </form>
  );
}
```
**Line-by-Line Explanation:** 
- **`"use client";`**: This directive tells Next.js: "Send the JavaScript for this component to the browser". This allows us to use standard React hooks like `useState` and `onSubmit`.
- **`const router = useRouter();`**: This is Next.js's programmatic router.
- **`fetch("/api/interviews")`**: Just like standard React, we use `fetch` to send data to our backend API (which we'll look at next).
- **`router.push(...)`**: After the backend responds with a success message, we redirect the user to the active interview page without doing a full page reload.

---

## 5. The API Routes

In an Express.js app, you use `app.post('/api/interviews', ...)`. In Next.js, API routes are also file-based. Any file named `route.ts` inside the `app/api/...` folder becomes an API endpoint.

### `app/api/interviews/route.ts`
This file corresponds to `http://localhost:3000/api/interviews`.

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/db/mongodb";
import Interview from "@/lib/db/models/Interview";
import { NextRequest as Req } from "next/server";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function POST(req: Req) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let interviewType, topic, role, resumeText = "";
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      interviewType = formData.get("interviewType") as string;
      const resumeFile = formData.get("resumeFile") as File;
      // ... parse PDF using pdfParse ...
    } else {
      const body = await req.json();
      interviewType = body.interviewType;
      topic = body.topic;
    }

    await connectToDatabase();

    const newInterview = await Interview.create({
      userId: session.user.id,
      interviewType,
      topic,
      role,
      resumeText,
      status: "in-progress",
    });

    return NextResponse.json({ interviewId: newInterview._id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```
**Line-by-Line Explanation:** 
- **`export async function POST(req: Req)`**: Next.js automatically maps HTTP methods (GET, POST, PUT, DELETE) to exported functions with those names.
- **`const session = await auth();`**: We securely verify the user's session token here.
- **`req.formData()` and `req.json()`**: Next.js uses standard Web API `Request` and `Response` objects (instead of Express `req` / `res`). 
- **`NextResponse.json(...)`**: This is how we send JSON data and HTTP status codes back to the client.

---

## 6. Dynamic Routing: Conducting the Interview

Once an interview is created, the user is redirected to `/interview/12345`. How do we catch that `12345` ID? Using brackets in folder names!

### `app/interview/[id]/page.tsx`
The `[id]` folder tells Next.js this is a **Dynamic Route**.

```tsx
"use client";

import { use, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";

export default function InterviewRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processVoice(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
    }
  };

  const processVoice = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const response = await fetch(`/api/interviews/${id}/process-voice`, {
      method: "POST",
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.aiText) {
      const utterance = new SpeechSynthesisUtterance(data.aiText);
      window.speechSynthesis.speak(utterance);
    }
    
    // ... update messages state ...
  };

  return (
    // ... UI with Mic Button ...
  );
}
```
**Line-by-Line Explanation:** 
- **`"use client";`**: We need this again because we are using `useState` and accessing the browser's microphone (`navigator.mediaDevices`).
- **`{ params }: { params: Promise<{ id: string }> }`**: Next.js automatically passes a `params` object to dynamic routes.
- **`const { id } = use(params);`**: We use React's new `use` hook to resolve the `params` promise and extract the `id` from the URL (e.g., if the URL is `/interview/12345`, `id` is `'12345'`).
- The rest of the file uses standard browser APIs (`MediaRecorder` to record audio and `SpeechSynthesisUtterance` to make the browser speak back the AI's text).

By understanding how Next.js handles Server vs Client components, file-based routing, and server actions, this codebase behaves exactly like a modern Node.js application, just with less boilerplate!
