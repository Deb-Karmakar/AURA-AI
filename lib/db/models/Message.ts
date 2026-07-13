import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  interviewId: mongoose.Types.ObjectId;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    interviewId: { type: Schema.Types.ObjectId, ref: "Interview", required: true },
    role: { type: String, enum: ["user", "ai"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
