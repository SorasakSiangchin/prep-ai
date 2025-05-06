"use client";

import React, { useState } from "react";
import { Button, Input, Form, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import { IUser } from "@/backend/models/user.model";
import { useGenericSubmitHandler } from "../form/genericSubmitHandler";
import toast from "react-hot-toast";
import { updateProfile } from "@/actions/auth.actions";
import Loader from "../layout/loader/Loader";

export default function UpdateProfile() {
  const [avatar, setAvatar] = useState("");

  const {
    data: userData,
    status,
    update,
  } = useSession() as {
    data: { user: IUser } | null;
    status: "loading" | "authenticated" | "unauthenticated";
    update: () => Promise<any>;
  };

  const { handleSubmit, loading } = useGenericSubmitHandler(async (data) => {
    const bodyData = {
      name: data.name,
      email: userData?.user?.email ?? "",
      avatar,
      oldAvatar: userData?.user?.profilePicture?.id ?? "",
    };

    const res = await updateProfile(bodyData);

    if (res?.error) {
      return toast.error(res?.error?.message);
    }

    if (res?.updated) {
      const updateSession = await update();

      if (updateSession) {
        toast.success("Profile updated successfully");
      }
    }
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const render = new FileReader();

    render.onload = () => {
      // render.readyState === 2 ซึ่งหมายถึงการอ่านไฟล์เสร็จสมบูรณ์ (DONE)
      if (render.readyState === 2) {
        setAvatar(render.result as string);
      }
    };

    render.readAsDataURL(files[0]);
  };

  if (status === "loading") {
    return <Loader />;
  }
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
        <div className="flex flex-col gap-1">
          <h1 className="text-large font-medium">Update Profile</h1>
          <p className="text-small text-default-500">
            Enter details to update profile
          </p>
        </div>

        <Form
          className="flex flex-col gap-5"
          validationBehavior="native"
          onSubmit={handleSubmit}
        >
          <Input
            isRequired
            label="Name"
            name="name"
            placeholder="Enter your name"
            type="text"
            variant="bordered"
            defaultValue={userData?.user?.name ?? ""}
          />

          <Input
            isRequired
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            type="email"
            variant="bordered"
            isDisabled
          />

          <div className="flex gap-1 items-center w-full">
            {avatar && (
              <Avatar showFallback src={avatar} size="lg" radius="sm" />
            )}
            <Input
              label="Avatar"
              name="avatar"
              type="file"
              variant="bordered"
              className="w-full"
              onChange={onChange}
            />
          </div>

          <Button
            className="w-full"
            color="primary"
            type="submit"
            endContent={<Icon icon="akar-icons:arrow-right" />}
            isDisabled={loading}
            isLoading={loading}
          >
            Update
          </Button>
        </Form>
      </div>
    </div>
  );
}
