import React from "react";
import { QuickActionsRow } from "../QuickActionsRow/QuickActionsRow";

interface Props {
  onAddPatient: () => void;
  onAddAppointment: () => void;
  onAddService: () => void;
}
export const HomeQuickActions: React.FC<Props> = (props) => (
  <QuickActionsRow {...props} />
);
