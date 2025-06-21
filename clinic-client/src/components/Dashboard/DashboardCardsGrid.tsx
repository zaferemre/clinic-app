// src/components/Dashboard/DashboardCardsGrid.tsx
import React from "react";
import DashboardCard from "./DashboardCard";

interface DashboardCardsGridProps {
  cards: Array<React.ComponentProps<typeof DashboardCard>>;
}

const DashboardCardsGrid: React.FC<DashboardCardsGridProps> = ({ cards }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {cards.map((card) => (
      <DashboardCard key={card.label} {...card} />
    ))}
  </div>
);

export default DashboardCardsGrid;
