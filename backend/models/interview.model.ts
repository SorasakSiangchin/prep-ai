import {
  industries,
  industryTopics,
  interviewDifficulties,
  interviewTypes,
} from "@/constants/data";
import mongoose, { Document } from "mongoose";

export interface IQuestion extends Document {
  _id: string;
  question: string;
  answer: string; // คำตอบ
  completed: boolean; // สมบูรณ์
  result: {
    overallScore: number; // คะแนนโดยรวม
    clarity: number; // ความชัดเจน
    completeness: number; // ความสมบูรณ์
    relevence: number; // ความเกี่ยวข้อง
    suggestion: string; // คำแนะนำ
  };
}

export interface IInterview extends Document {
  _id: string;
  user: mongoose.Schema.Types.ObjectId;
  industry: string;
  type: string;
  topic: string;
  role: string;
  numOfQuestions: number; // จำนวนคำถาม
  answered: number; // จำนวนคำถามที่ถูกต้อง
  diffuculty: string; // ระดับความยาก
  duration: number;
  durationLeft: number;
  status: string;
  questions: IQuestion[];
}

// Sub model
const questionSchema = new mongoose.Schema<IQuestion>({
  question: {
    type: String,
    required: true,
  },
  answer: String,
  completed: {
    type: Boolean,
    default: false,
  },
  result: {
    overallScore: {
      type: Number,
      default: 0,
    },
    clarity: {
      type: Number,
      default: 0,
    },
    completeness: {
      type: Number,
      default: 0,
    },
    relevence: {
      type: Number,
      default: 0,
    },
    suggestion: String,
  },
});

// Root model
const interviewSchema = new mongoose.Schema<IInterview>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // referent
      required: true,
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      enum: industries,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: interviewTypes,
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
      validate: {
        // custom validator
        validator: function (this: IInterview, value: string) {
          // this => instance ของ IIntervie
          // value => ค่าที่ต้องตรวจสอบ หรือ 'ค่าที่ user กรอกเข้ามา'
          return (industryTopics as Record<string, string[]>)[
            this.industry
          ].includes(value);
          // คืนค่า true ถ้า topic ที่ได้รับเป็นหนึ่งใน topics ของ industry นั้น ๆ และคืน false หากไม่พบ
        },
        message: (props) => `${props.value} is not a valid topic this industry`,
      },
    },
    role: {
      type: String,
      required: [true, "Role is required"],
    },
    numOfQuestions: {
      type: Number,
      required: [true, "Number of questions is required"],
    },
    answered: {
      type: Number,
      default: 0,
    },
    diffuculty: {
      type: String,
      required: [true, "Difficulty is required"],
      enum: interviewDifficulties,
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      minlength: [2 * 60, `Duration must be at least ${2 * 60} seconds`],
    },
    durationLeft: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    questions: {
      type: [questionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ถ้าไม่มี model ให้สร้าง
const Interview =
  mongoose.models.Interview ||
  mongoose.model<IInterview>("Interview", interviewSchema);

export default Interview;

// diagram
// https://drive.google.com/uc?id=1XIFMSfa25Q9KgGGVoZe2yvf3CP7KIkF8
