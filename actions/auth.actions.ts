"use server";

import {
  forgotUserPassword,
  register,
  resetUserPassword,
  updateUserPassword,
  updateUserProfile,
} from "@/backend/controller/auth.controller";

// register
export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  return await register(name, email, password);
}

// update profile
export async function updateProfile({
  name,
  email,
  avatar,
  oldAvatar,
}: {
  name: string;
  email: string;
  avatar?: string;
  oldAvatar?: string;
}) {
  return await updateUserProfile({
    name,
    userEmail: email,
    avatar,
    oldAvatar,
  });
}

// update password
export async function updatePassword({
  newPassword,
  confirmPassword,
  userEmail,
}: {
  newPassword: string;
  confirmPassword: string;
  userEmail: string;
}) {
  return await updateUserPassword({
    newPassword,
    confirmPassword,
    userEmail,
  });
}

// forgot password
export async function forgotPassword(email: string) {
  return await forgotUserPassword(email);
}

// reset password
export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string
) {
  return await resetUserPassword(token, password, confirmPassword);
}
