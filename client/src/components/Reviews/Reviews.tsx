import React from "react";

interface ReviewsProps {
  className?: string;
}

const Reviews: React.FC<ReviewsProps> = ({ className }) => {
  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Reviews</h1>
        <p className="text-gray-600 mb-6">
          View and manage family reviews and ratings
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Reviews system coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
