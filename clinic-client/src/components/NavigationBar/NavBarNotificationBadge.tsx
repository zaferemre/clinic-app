// src/components/NavigationBar/NavBarNotificationBadge.tsx
import React from "react";

const NavBarNotificationBadge: React.FC<{ unreadCount: number }> = ({
  unreadCount,
}) =>
  unreadCount > 0 ? (
    <span className="absolute top-1 right-3 h-3 w-3  rounded-full bg-red-500 border-2 border-white" />
  ) : null;

export default NavBarNotificationBadge;
