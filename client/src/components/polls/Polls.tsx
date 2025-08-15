import React from "react";
import { PollCard } from "./PollCard";
import { PollForm } from "./PollForm";

interface PollsProps {
  className?: string;
}

const Polls: React.FC<PollsProps> = ({ className }) => {
  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Family Polls</h1>
        <p className="text-gray-600 mb-6">
          Create and participate in family polls and surveys
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PollCard />
          <PollForm />
        </div>
      </div>
    </div>
  );
};

export default Polls;
