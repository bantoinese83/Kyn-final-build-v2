import React from "react";

interface AdminProps {
  className?: string;
}

const Admin: React.FC<AdminProps> = ({ className }) => {
  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <p className="text-gray-600 mb-6">
          Administrative tools and system management
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Admin panel coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
