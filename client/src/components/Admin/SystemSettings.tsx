import React from "react";

interface SystemSettingsProps {
  className?: string;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ className }) => {
  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">System Settings</h1>
        <p className="text-gray-600 mb-6">
          Configure system-wide settings and preferences
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            System settings coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
