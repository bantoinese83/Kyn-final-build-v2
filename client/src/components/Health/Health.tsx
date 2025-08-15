import React from "react";

interface HealthProps {
  className?: string;
}

const Health: React.FC<HealthProps> = ({ className }) => {
  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Family Health</h1>
        <p className="text-gray-600 mb-6">
          Track and manage your family's health information
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Health Records</h3>
            <p className="text-gray-600">Manage family health records</p>
          </div>
          <div className="p-6 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Appointments</h3>
            <p className="text-gray-600">Schedule and track appointments</p>
          </div>
          <div className="p-6 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Health Stats</h3>
            <p className="text-gray-600">View health statistics and trends</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health;
