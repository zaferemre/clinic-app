// src/components/Notifications/NotificationCard.tsx
import React from "react";
import { NotificationInfo } from "../../types/sharedTypes";
import { PhoneIcon, CheckIcon } from "@heroicons/react/24/outline";

interface Props {
  notification: NotificationInfo & { priority?: "high" | "normal" | "low" };
  onDial?: (patientId: string) => void;
  onDone?: (notificationId: string) => void;
}

// Helper to pick dot color by priority
function priorityDotColor(priority: string | undefined) {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "normal":
      return "bg-orange-400";
    case "low":
      return "bg-yellow-400";
    default:
      return "bg-gray-300";
  }
}

// Helper to get priority title
function getPriorityTitle(priority: string | undefined): string {
  if (!priority) return "Öncelik Bilinmiyor";

  switch (priority) {
    case "high":
      return "Yüksek Öncelik";
    case "normal":
      return "Normal Öncelik";
    case "low":
      return "Düşük Öncelik";
    default:
      return "Öncelik Bilinmiyor";
  }
}

const NotificationCard: React.FC<Props> = ({
  notification,
  onDial,
  onDone,
}) => {
  const dotColor = priorityDotColor(notification.priority);

  return (
    <div className="relative bg-brand-gray-100 rounded-lg p-3 flex items-start justify-between shadow-sm">
      {/* Priority dot */}
      <div
        className={`absolute top-2 right-2 w-3 h-3 rounded-full ${dotColor} border-2 border-white shadow`}
        title={getPriorityTitle(notification.priority)}
      ></div>

      <div className="flex-1 pr-4">
        {/* Title (if exists) */}
        {notification.title && (
          <div className="font-semibold text-brand-main text-base mb-1">
            {notification.title}
          </div>
        )}

        {/* Patient Name */}
        {notification.patientName && (
          <p className="font-medium text-brand-black">
            {notification.patientName}
          </p>
        )}

        {/* Created At */}
        <p className="text-xs text-brand-gray-600 mt-1">
          {new Date(notification.createdAt).toLocaleString("tr-TR")}
        </p>

        {/* Note (if exists) */}
        {notification.note && (
          <p className="text-xs italic text-brand-gray-500 mt-1">
            “{notification.note}”
          </p>
        )}

        {/* Type (if exists) */}
        {notification.type && (
          <p className="text-xs text-brand-gray-400 mt-1">
            <span className="font-semibold">Tip: </span>
            {notification.type}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {notification.patientId && onDial && (
          <button
            onClick={() =>
              notification.patientId && onDial(notification.patientId)
            }
            className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200"
            aria-label="Ara"
          >
            <PhoneIcon className="w-5 h-5 text-blue-600" />
          </button>
        )}
        {notification.id && onDone && (
          <button
            onClick={() => onDone(notification.id)}
            className="p-2 bg-green-100 rounded-lg hover:bg-green-200"
            aria-label="Tamamlandı"
          >
            <CheckIcon className="w-5 h-5 text-green-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
