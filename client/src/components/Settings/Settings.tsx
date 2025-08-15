import React from "react";

interface SettingsProps {
  className?: string;
}

const Settings: React.FC<SettingsProps> = ({ className }) => {
  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p className="text-gray-600 mb-6">
          Configure your family app preferences and settings
        </p>

        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
            <p className="text-gray-600">Manage your account preferences</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Privacy Settings</h3>
            <p className="text-gray-600">
              Control your privacy and data sharing
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              Notification Settings
            </h3>
            <p className="text-gray-600">
              Configure how you receive notifications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
