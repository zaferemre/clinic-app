// src/components/NavigationBar/NavBarNotificationBadge.tsx
import React from "react";

const NavBarNotificationBadge: React.FC<{ unreadCount: number }> = ({
  unreadCount,
}) =>
  unreadCount > 0 ? (
    <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
  ) : null;

export default NavBarNotificationBadge;
