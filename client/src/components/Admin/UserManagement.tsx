import React from "react";

interface UserManagementProps {
  className?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ className }) => {
  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <p className="text-gray-600 mb-6">
          Manage system users and permissions
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            User management coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
