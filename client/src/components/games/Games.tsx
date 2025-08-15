import React from "react";
import { GameCard } from "./GameCard";
import { GameForm } from "./GameForm";

interface GamesProps {
  className?: string;
}

const Games: React.FC<GamesProps> = ({ className }) => {
  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Family Games</h1>
        <p className="text-gray-600 mb-6">
          Organize and play games with your family members
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GameCard />
          <GameForm />
        </div>
      </div>
    </div>
  );
};

export default Games;
