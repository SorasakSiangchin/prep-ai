"use server";

import {
  createInterview,
  deleteUserInterview,
  updateInterviewDetail,
} from "@/backend/controller/interview.controller";
import { InterviewBody } from "@/backend/types/interview.types";

export async function newInterview(body: InterviewBody) {
  console.log("body action server : ", body);
  return await createInterview(body);
}

export async function deleteInterview(interviewId: string) {
  return await deleteUserInterview(interviewId);
}

export async function updateInterview(
  interviewId: string,
  durationLeft: string,
  questionId: string,
  answer: string,
  completed?: boolean
) {
  return await updateInterviewDetail(
    interviewId,
    durationLeft,
    questionId,
    answer,
    completed
  );
}
