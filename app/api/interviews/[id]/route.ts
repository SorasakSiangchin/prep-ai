import { getInterviewById } from "@/backend/controller/interview.controller";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const res = await getInterviewById(id);

  if (res?.error) {
    return NextResponse.json(
      { error: { message: res?.error?.message } },
      { status: res?.error?.statusCode }
    );
  }

  return NextResponse.json({ interview: res?.interview });
}
