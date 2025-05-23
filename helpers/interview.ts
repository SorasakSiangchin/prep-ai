import { IQuestion } from "@/backend/models/interview.model";

// function นี้เป็นการเก็บข้อมูลคำตอบที่กรอกลงใน question ใน local storage
export const saveAnswerToLocalStorage = (
  interviewId: string,
  questionId: string,
  answer: string
) => {
  const key = `interview-${interviewId}-answers`;
  const storedAnswers = JSON.parse(localStorage.getItem(key) || "{}");
  storedAnswers[questionId] = answer;
  localStorage.setItem(key, JSON.stringify(storedAnswers));
};

// ดึงคำตอบใน local storage (single)
export const getAnswerFromLocalStorage = (
  interviewId: string,
  questionId: string
) => {
  const key = `interview-${interviewId}-answers`;
  const storedAnswers = JSON.parse(localStorage.getItem(key) || "{}");
  return storedAnswers[questionId] || "";
};

// ดึงคำตอบใน local storage (list)
export const getAnswersFromLocalStorage = (interviewId: string) => {
  const key = `interview-${interviewId}-answers`;
  const storedAnswers = localStorage.getItem(key);
  return storedAnswers ? JSON.parse(storedAnswers) : null;
};

// ดึงแบบทดสอบที่ยังทำไม่เสร็จอันแรก
export const getFirstIncompleteQuestionIndex = (questions: IQuestion[]) => {
  const firstIncompleteIndex = questions.findIndex(
    (question) => !question?.completed
  );

  return firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0;
};
