import React from "react";
import { UpcomingAppointments } from "../UpcomingAppointments/UpcomingAppointments";
import type { CardAppointment, CardEmployee } from "../../types/sharedTypes";

interface Props {
  appointments: CardAppointment[];
  user: { userId: string; role?: string };
  employees: CardEmployee[];
}

export const HomeUpcomingAppointments: React.FC<Props> = (props) => (
  <UpcomingAppointments {...props} />
);

export default HomeUpcomingAppointments;
