"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { IInterview } from "@/backend/models/interview.model";
export const columns = [
  { name: "INTERVIEW", uid: "interview" },
  { name: "RESULT", uid: "result" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

export const interviews = [];

type ListInterviewProps = {
  data: {
    interviews: IInterview[];
  };
};

export default function ListInterview({ data }: ListInterviewProps) {
  const { interviews } = data;

  const renderCell = React.useCallback(
    (interview: IInterview, columnKey: any) => {
      const cellValue = interview[columnKey as keyof IInterview];

      switch (columnKey) {
        case "interview":
          return (
            <div className="flex flex-col">
              <div className="text-bold text-sm capitalize">
                {interview?.topic}
              </div>
              <div className="text-bold text-sm capitalize text-default-400">
                {interview?.type}
              </div>
            </div>
          );
        case "role":
          return (
            <div className="flex flex-col">
              <div className="text-bold text-sm capitalize">0/10</div>
              <div className="text-bold text-sm capitalize text-default-400">
                {interview?.numOfQuestions} questions
              </div>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={interview?.status === "completed" ? "success" : "danger"}
              size="sm"
              variant="flat"
            >
              {cellValue}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip color="danger" content="Delete interview">
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                  <Icon icon="solar:trash-bin-trash-outline" fontSize={21} />
                </span>
              </Tooltip>
            </div>
          );
        default:
          return cellValue;
      }
    },
    []
  );

  return (
    <div className="my-4">
      <Table aria-label="interview table">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={interviews}>
          {(item) => (
            <TableRow key={item?._id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
