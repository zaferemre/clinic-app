import React from "react";
import { EmployeesList } from "../../components/EmployeesList/EmployeesList";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";

export const EmployeesPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-brand-gray-100">
      <div className="flex-1 overflow-auto p-4">
        <EmployeesList />
      </div>
      <NavigationBar />
    </div>
  );
};
