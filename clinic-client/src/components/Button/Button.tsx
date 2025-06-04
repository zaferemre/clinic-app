// src/components/Button.tsx
import React, { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...rest
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition ";
  let variantClasses = "";

  switch (variant) {
    case "primary":
      variantClasses =
        "bg-brand-green-400 text-white hover:bg-brand-green-500 focus:ring-brand-green-300";
      break;
    case "secondary":
      variantClasses =
        "bg-brand-gray-300 text-brand-black hover:bg-brand-gray-400 focus:ring-brand-gray-200";
      break;
    case "danger":
      variantClasses =
        "bg-error text-white hover:bg-red-600 focus:ring-red-400";
      break;
  }

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${widthClass} ${className} px-4 py-2`}
      {...rest}
    >
      {children}
    </button>
  );
};
