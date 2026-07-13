import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInterview extends Document {
  userId: string;
  interviewType: "topic" | "resume";
  topic?: string;
  role?: string;
  resumeText?: string;
  difficulty?: string;
  includeCodingRound?: boolean;
  duration: number; // in minutes
  status: "in-progress" | "completed";
  overallFeedback?: string;
  detailedFeedback?: {
    question: string;
    answer: string;
    improvement: string;
  }[];
  score?: number;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema: Schema<IInterview> = new Schema(
  {
    userId: { type: String, required: true },
    interviewType: { type: String, enum: ["topic", "resume"], required: true },
    topic: { type: String },
    role: { type: String },
    resumeText: { type: String },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    includeCodingRound: { type: Boolean, default: false },
    duration: { type: Number, required: true, default: 10 },
    status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
    overallFeedback: { type: String },
    detailedFeedback: [{
      question: { type: String },
      answer: { type: String },
      improvement: { type: String },
    }],
    score: { type: Number },
  },
  {
    timestamps: true,
  }
);

const Interview: Model<IInterview> =
  mongoose.models.Interview || mongoose.model<IInterview>("Interview", InterviewSchema);

export default Interview;
