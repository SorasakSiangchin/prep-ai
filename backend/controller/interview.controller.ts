import dbConnect from "../config/dbConnect";
import { catchAsyncErrors } from "../midlewares/catchAsyncErrors";
import Interview from "../models/interview.model";
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

  const questions = mockQuestions(numOfQuestions);

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

  return newInterview?._id
    ? { created: true }
    : (() => {
        throw new Error("Interview not created.");
      })();
});

export const getInterviews = catchAsyncErrors(async (request: Request) => {
  await dbConnect();

  const user = await getCurrentUser(request);

  const interviews = await Interview.find({ user: user?._id });

  return { interviews };
});
