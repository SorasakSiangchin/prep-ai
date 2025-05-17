"use client";

import React, { useEffect, useState } from "react";
import { Progress, Button, Alert, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { IInterview, IQuestion } from "@/backend/models/interview.model";
import { formatTime } from "@/helpers/helpers";
import PromptInputWithBottomActions from "./PromptInputWithBottomActions";
import {
  getAnswerFromLocalStorage,
  getAnswersFromLocalStorage,
  getFirstIncompleteQuestionIndex,
  saveAnswerToLocalStorage,
} from "@/helpers/interview";
import toast from "react-hot-toast";
import { updateInterview } from "@/actions/interview.actions";
import { useRouter } from "next/navigation";

export default function Interview({ interview }: { interview: IInterview }) {
  // ดึงแบบทดสอบที่ยังทำไม่เสร็จอันแรก
  const initialQuestionIndex = getFirstIncompleteQuestionIndex(
    interview?.questions
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(initialQuestionIndex);

  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  // คำตอบที่เรากรอก
  const [answer, setAnswer] = useState("");

  const [timeLeft, setTimeLeft] = useState(interview?.durationLeft);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // คำถามปัจจุบัน
  const currentQuestion = interview?.questions[currentQuestionIndex];

  useEffect(() => {
    if (timeLeft === 0) {
      handleExitInterview();
    }
  }, [timeLeft]);

  // Load answers from local storage
  useEffect(() => {
    // Load answers from local storage
    const storedAnswers = getAnswersFromLocalStorage(interview?._id);

    if (storedAnswers) {
      setAnswers(storedAnswers);
    } else {
      // ถ้าใน local storage ไม่มีให้เอาจาก DB มา set
      interview?.questions?.forEach((question: IQuestion) => {
        // ต้องมีการกรอกคำตอบแล้ว
        if (question?.completed) {
          saveAnswerToLocalStorage(
            interview?._id,
            question?._id,
            question?.answer
          );
        }
      });
    }
  }, [interview?._id]);

  useEffect(() => {
    // setInterval => ใช้สำหรับเรียกใช้งานฟังก์ชันหรือ callback ซ้ำ ๆ ตามช่วงเวลาที่กำหนด
    const timer = setInterval(() => {
      setTimeLeft((preTime: number) => {
        if (preTime <= 1) {
          clearInterval(timer);

          return 0;
        }

        if (preTime === 10) {
          setShowAlert(true);
        }

        return preTime - 1;
      });
    }, 1000);

    // ทำความสะอาดเมื่อ component ถูกทำลาย
    return () => clearInterval(timer);
  }, []);

  // เก็บข้อมูลตอนที่เรากรอกคำตอบ
  const handleAnswerChange = (value: string) => {
    setAnswer(value);
  };

  // บันทึกข้อมูลคำตอบลงฐานข้อมูล
  const saveAnswerToDB = async (questionId: string, answer: string) => {
    setLoading(true);

    try {
      const res = await updateInterview(
        interview?._id, // บทสัมภาษไหน
        timeLeft?.toString(), // ใช้เวลาไปเท่าไหร่
        questionId, // คำถามข้อไหน
        answer // คำถามที่กรอก
      );

      if (res?.error) {
        setLoading(false);
        return toast.error(res?.error?.message);
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // กด Next
  const handleNextQuestion = async (answer: string) => {
    // คำตอบก่อนหน้า
    const previousAnswer = answers[currentQuestion?._id];

    console.log("previousAnswer : ", previousAnswer);
    console.log("currentQuestion?._id : ", currentQuestion?._id);
    console.log("answers : ", answers);
    console.log("answer : ", answer);

    if (previousAnswer !== answer && answer !== "") {
      await saveAnswerToDB(currentQuestion?._id, answer);
      saveAnswerToLocalStorage(interview?._id, currentQuestion?._id, answer);
    }

    setAnswers((prevAnswers) => {
      const newAnswers = { ...prevAnswers };
      newAnswers[currentQuestion?._id] = answer;
      return newAnswers;
    });

    if (currentQuestionIndex < interview?.numOfQuestions - 1) {
      setCurrentQuestionIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        const nextQuestion = interview?.questions[newIndex];
        setAnswer(getAnswerFromLocalStorage(interview?._id, nextQuestion?._id));
        return newIndex;
      });
    } else if (currentQuestionIndex === interview?.numOfQuestions - 1) {
      // User in on last question then move user to 1st question
      setCurrentQuestionIndex(0);
      setAnswer(
        getAnswerFromLocalStorage(interview?._id, interview?.questions[0]?._id)
      );
    } else {
      setAnswer("");
    }
  };

  // กด Pass
  const handlePassQuestion = async () => {
    await handleNextQuestion("pass");
  };

  // กด Previous
  const handlePreviousQuestion = async () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => {
        const newIndex = prevIndex - 1;
        const previousQuestion = interview?.questions[newIndex];
        setAnswer(
          getAnswerFromLocalStorage(interview?._id, previousQuestion?._id)
        );
        return newIndex;
      });
    }
  };

  // กดออกจากการทำแบบสัมภาษณ์
  const handleExitInterview = async () => {
    setLoading(true);

    try {
      const res = await updateInterview(
        interview?._id, // บทสัมภาษไหน
        timeLeft?.toString(), // ใช้เวลาไปเท่าไหร่
        currentQuestion?._id, // คำถามข้อไหน
        answer, // คำถามที่กรอก
        true
      );

      if (res?.error) {
        setLoading(false);
        return toast.error(res?.error?.message);
      }

      if (res?.updated) {
        setLoading(false);
        router.push("/app/interviews");
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full max-w-full flex-col gap-8">
      {showAlert && (
        <Alert
          color="danger"
          description={"Interview is about to exit"}
          title={"Time up!"}
        />
      )}

      <Progress
        aria-label="Interview Progress"
        className="w-full"
        color="default"
        label={`Question ${currentQuestionIndex + 1} of ${
          interview?.numOfQuestions
        }`}
        size="md"
        value={((currentQuestionIndex + 1) / interview.numOfQuestions) * 100}
      />

      <div className="flex flex-wrap gap-1.5">
        {interview?.questions?.map((question: IQuestion, index: number) => {
          return (
            <Chip
              key={index}
              color={answers[question?._id] ? "success" : "default"} // คำถามไหนที่มีคำตอบแล้วให้เป็นสีเขียว
              size="sm"
              variant="flat"
              className="font-bold cursor-pointer text-sm radius-full"
              onClick={() => {
                setCurrentQuestionIndex(index); // set index ของคำถามปัจจุบัน
                setAnswer(
                  getAnswerFromLocalStorage(interview?._id, question?._id)
                ); // ถึงคำตอบที่เรากดเข้าไป
              }}
            >
              {index + 1}
            </Chip>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-5">
        <span className="text-lg font-semibold text-right mb-2 sm:mb-0">
          Duration Left: {formatTime(timeLeft)}
        </span>
        <Button
          color="danger"
          startContent={<Icon icon="solar:exit-outline" fontSize={18} />}
          variant="solid"
          onPress={handleExitInterview}
          isDisabled={loading}
          isLoading={loading}
        >
          Save & Exit Interview
        </Button>
      </div>

      <span className="text-center h-40">
        <span
          className={`tracking-tight inline font-semibold bg-clip-text text-transparent bg-gradient-to-b from-[#FF1CF7] to-[#b249f8] text-[1.4rem] lg:text-2.5xl flex items-center justify-center h-full`}
        >
          {currentQuestion?.question}
        </span>
      </span>

      <PromptInputWithBottomActions
        key={currentQuestionIndex}
        value={answer}
        onChange={handleAnswerChange}
      />

      <div className="flex justify-between items-center mt-5">
        <Button
          className="bg-foreground px-[18px] py-2 font-medium text-background"
          radius="full"
          color="secondary"
          variant="flat"
          startContent={
            <Icon
              className="flex-none outline-none [&>path]:stroke-[2]"
              icon="solar:arrow-left-linear"
              width={20}
            />
          }
          onPress={handlePreviousQuestion}
          isDisabled={loading || currentQuestionIndex === 0}
          isLoading={loading}
        >
          Previous
        </Button>

        <Button
          className="px-[28px] py-2"
          radius="full"
          variant="flat"
          color="success"
          startContent={
            <Icon
              className="flex-none outline-none [&>path]:stroke-[2]"
              icon="solar:compass-big-bold"
              width={18}
            />
          }
          onPress={() => handlePassQuestion()}
          isDisabled={loading}
          isLoading={loading}
        >
          Pass
        </Button>

        <Button
          className="bg-foreground px-[18px] py-2 font-medium text-background"
          radius="full"
          color="secondary"
          variant="flat"
          endContent={
            <Icon
              className="flex-none outline-none [&>path]:stroke-[2]"
              icon="solar:arrow-right-linear"
              width={20}
            />
          }
          onPress={() => handleNextQuestion(answer)}
          isDisabled={loading}
          isLoading={loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
