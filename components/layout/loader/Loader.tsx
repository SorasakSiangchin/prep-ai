import { Spinner } from "@heroui/react";
import React from "react";

const Loader = () => {
  return (
    <div className="flex items-end justify-center min-h-screen">
      <Spinner color="default" label="Loading..." />
    </div>
  );
};

export default Loader;
