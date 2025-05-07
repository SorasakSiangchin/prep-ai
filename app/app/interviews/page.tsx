import ListInterview from "@/components/interview/ListInterviews";
import { getAuthHeader } from "@/helpers/auth";
import { get } from "http";
import { cookies } from "next/headers";
import React from "react";

// get data from api
async function getInterviews() {
  try {
    const nextCookies = await cookies();
    const authHeader = getAuthHeader(nextCookies);

    const response = await fetch(
      `${process.env.API_URL}/api/interviews`,
      authHeader
    );

    if (!response.ok) {
      throw new Error("An error occurred while fetching the data.");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

const ListInterviewPage = async () => {
  const data = await getInterviews();

  return <ListInterview data={data} />;
};

export default ListInterviewPage;
