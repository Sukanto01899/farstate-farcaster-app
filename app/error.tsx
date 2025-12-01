"use client";

import React from "react";

const Error = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div className="bg-purple-500 h-screen w-full flex justify-center items-center">
      <div className="space-y-4">
        <p>{error.message}</p>
        <button onClick={reset}>Retry</button>
      </div>
    </div>
  );
};

export default Error;
