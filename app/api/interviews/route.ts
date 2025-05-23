import { getInterviews } from "@/backend/controller/interview.controller";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const res = await getInterviews(request);

  const { interviews } = res;

  return NextResponse.json({ interviews });
}
