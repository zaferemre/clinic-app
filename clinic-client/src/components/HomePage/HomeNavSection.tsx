import React from "react";
import { HomeNavGrid } from "../HomeNavGrid/HomeNavGrid";

export const HomeNavSection: React.FC<{ unreadCount: number }> = ({
  unreadCount,
}) => <HomeNavGrid unreadCount={unreadCount} />;
