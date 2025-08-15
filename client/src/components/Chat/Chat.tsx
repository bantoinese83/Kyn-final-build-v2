import React from "react";
import { useParams } from "react-router-dom";

interface ChatProps {
  className?: string;
}

const Chat: React.FC<ChatProps> = ({ className }) => {
  const { memberId } = useParams<{ memberId: string }>();

  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Chat with Family Member</h1>
        <p className="text-gray-600">
          Chat functionality for member ID: {memberId}
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            Chat component implementation coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
