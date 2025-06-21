import React from "react";
import { HomeNavGrid } from "../HomeNavGrid/HomeNavGrid";

export const HomeNavSection: React.FC<{ unreadCount: number }> = ({
  unreadCount,
}) => (
  <div className="rounded-2xl bg-white p-2">
    <HomeNavGrid unreadCount={unreadCount} />
  </div>
);
