import React from "react";

interface AnalyticsProps {
  className?: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ className }) => {
  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>
        <p className="text-gray-600 mb-6">
          View family activity and usage statistics
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            Analytics dashboard coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
