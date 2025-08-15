import React from "react";

interface FamilyManagementProps {
  className?: string;
}

const FamilyManagement: React.FC<FamilyManagementProps> = ({ className }) => {
  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Family Management</h1>
        <p className="text-gray-600 mb-6">
          Manage your family settings, members, and permissions
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Family Members</h3>
            <p className="text-gray-600">
              Add, remove, and manage family members
            </p>
          </div>
          <div className="p-6 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Permissions</h3>
            <p className="text-gray-600">
              Set access levels for family features
            </p>
          </div>
          <div className="p-6 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Family Settings</h3>
            <p className="text-gray-600">Configure family-wide preferences</p>
          </div>
          <div className="p-6 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Invitations</h3>
            <p className="text-gray-600">Send and manage family invitations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyManagement;
