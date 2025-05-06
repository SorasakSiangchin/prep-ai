import ResetPassword from "@/components/auth/ResetPassword";
import React from "react";

const ResetPasswordPage = ({ params }: { params: { token: string } }) => {
  const { token } = params;
  return <ResetPassword token={token} />;
};

export default ResetPasswordPage;
