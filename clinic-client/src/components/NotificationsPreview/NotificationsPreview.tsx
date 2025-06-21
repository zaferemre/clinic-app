/* src/components/NotificationsPreview/NotificationsPreview.tsx */
import React from "react";
import { BellIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface NotificationsPreviewProps {
  notification: string | null;
  onClick?: () => void;
}

const NotificationsPreview: React.FC<NotificationsPreviewProps> = ({
  notification,
  onClick,
}) => {
  if (!notification) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="En son bildirim"
      className="w-full flex items-start justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-3">
        <BellIcon className="h-5 w-5 text-brand-main" />
        <span className="flex-1 text-sm font-medium text-gray-800 truncate">
          {notification}
        </span>
      </div>
      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
    </button>
  );
};

export default NotificationsPreview;
