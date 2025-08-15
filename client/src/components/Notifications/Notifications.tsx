import React from "react";

interface NotificationsProps {
  className?: string;
}

const Notifications: React.FC<NotificationsProps> = ({ className }) => {
  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        <p className="text-gray-600 mb-6">
          Manage your family notifications and alerts
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            Notifications center coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
