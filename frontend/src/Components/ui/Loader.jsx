import React from "react";
import { Spinner } from "./shadcn-io/spinner";

const Loader = () => {
  return (
    <div className="flex justify-center items-center">
      <Spinner />
    </div>
  );
};

export default Loader;
