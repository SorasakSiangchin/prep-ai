import dbConnect from "../config/dbConnect";
import { catchAsyncErrors } from "../midlewares/catchAsyncErrors";
import Interview, { IInterview } from "../models/interview.model";
import { evaluateAnswer, generateQuestions } from "../openai/openai";
import { InterviewBody } from "../types/interview.types";
import { getCurrentUser } from "../utils/auth";

const mockQuestions = (numOfQuestions: number) => {
  const questions = [];

  // จำนวนแบบทดสอบมาวนลูป
  for (let i = 0; i < numOfQuestions; i++) {
    questions.push({
      question: `Mock question ${i + 1}`,
      answer: `Mock answer ${i + 1}`,
    });
  }

  return questions;
};

export const createInterview = catchAsyncErrors(async (body: InterviewBody) => {
  await dbConnect();

  const {
    difficulty,
    duration,
    industry,
    numOfQuestions,
    role,
    topic,
    type,
    user,
  } = body;

  // question จาก open AI
  const questions = await generateQuestions(
    industry,
    topic,
    type,
    role,
    numOfQuestions,
    duration,
    difficulty
  );

  // create interview
  const newInterview = await Interview.create({
    difficulty,
    duration: duration * 60,
    durationLeft: duration * 60,
    industry,
    numOfQuestions,
    role,
    topic,
    type,
    user,
    questions,
  });

  console.log("newInterview backend : ", newInterview);

  return newInterview?._id
    ? { created: true }
    : (() => {
        throw new Error("Interview not created.");
      })();
});

// get all
export const getInterviews = catchAsyncErrors(async (request: Request) => {
  await dbConnect();

  const user = await getCurrentUser(request);

  const interviews = await Interview.find({ user: user?._id });

  return { interviews };
});

// get by id
export const getInterviewById = catchAsyncErrors(async (id: string) => {
  await dbConnect();

  const interview = await Interview.findById(id);

  return { interview };
});

export const deleteUserInterview = catchAsyncErrors(
  async (interviewId: string) => {
    await dbConnect();

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      throw new Error("Interview not found.");
    }

    await interview.deleteOne();

    return { deleted: true };
  }
);

export const updateInterviewDetail = catchAsyncErrors(
  async (
    interviewId: string,
    durationLeft: string,
    questionId: string,
    answer: string,
    completed?: boolean
  ) => {
    await dbConnect();

    const interview = (await Interview.findById(interviewId)) as IInterview;

    if (!interview) {
      throw new Error("Interview not found.");
    }

    if (answer) {
      const questionIndex = interview?.questions?.findIndex(
        (question) => question._id.toString() === questionId
      );

      if (questionIndex === -1) {
        throw new Error("Question not found.");
      }

      // หาคำถามจาก interview
      const question = interview?.questions[questionIndex];

      let overallScore = 0;
      let clarity = 0;
      let relevance = 0;
      let completeness = 0;
      let suggestion = "No suggestion provided";

      if (answer !== "pass") {
        // ส่งคำถามและคำตอบให้ AI ประเมิน
        ({ clarity, completeness, overallScore, relevance, suggestion } =
          await evaluateAnswer(question.question, answer));
      }

      //
      if (!question?.completed) {
        interview.answered += 1;
      }

      // set คำตอบ
      question.answer = answer;
      question.completed = true;

      // set ผลลัพธ์ที่ได้จาก AI
      question.result = {
        clarity,
        completeness,
        overallScore,
        relevance,
        suggestion,
      };

      // set ระยะเวลา
      interview.durationLeft = Number(durationLeft);
    }

    // ถ้าจำนวนคำภามที่ถูก = จำนวนคำถามทั้งหมด
    if (interview?.answered === interview?.questions?.length) {
      interview.status = "completed";
    }

    if (durationLeft === "0") {
      interview.durationLeft = Number(durationLeft);
      interview.status = "completed";
    }

    if (completed) {
      interview.status = "completed";
    }

    await interview.save();

    return { updated: true };
  }
);
