"use client";

import { evaluateAnswer } from "@/actions/interview.actions";
import { Button } from "@heroui/react";
import React from "react";

const Results = () => {
  const handleClick = () => {
    evaluateAnswer();
  };
  return (
    <div>
      <Button onPress={handleClick}>Evaluate</Button>
    </div>
  );
};

export default Results;
