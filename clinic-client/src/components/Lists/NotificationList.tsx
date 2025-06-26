import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import NotificationCard from "../Cards/NotificationCard";
import { NotificationInfo } from "../../types/sharedTypes";

interface Props {
  notifications: (NotificationInfo & {
    priority?: "high" | "normal" | "low";
  })[];
  onDial?: (patientId: string) => void;
  onDone?: (notificationId: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const NotificationList: React.FC<Props> = ({
  notifications,
  onDial,
  onDone,
  loading,
  emptyMessage = "Hiç bildirim yok.",
}) => (
  <div>
    {loading ? (
      <div className="text-center text-brand-gray-400 py-10">Yükleniyor...</div>
    ) : (
      <AnimatePresence>
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-brand-gray-400 py-10"
          >
            {emptyMessage}
          </motion.div>
        ) : (
          notifications.map((notification) => (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              <NotificationCard
                notification={notification}
                onDial={onDial}
                onDone={onDone}
              />
            </motion.div>
          ))
        )}
      </AnimatePresence>
    )}
  </div>
);

export default NotificationList;
