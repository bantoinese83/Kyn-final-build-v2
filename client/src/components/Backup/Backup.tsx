import React from "react";

interface BackupProps {
  className?: string;
}

const Backup: React.FC<BackupProps> = ({ className }) => {
  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Backup & Restore</h1>
        <p className="text-gray-600 mb-6">
          Backup and restore your family data
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            Backup functionality coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Backup;
