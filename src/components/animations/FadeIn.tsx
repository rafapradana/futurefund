
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: "none" | "100" | "200" | "300" | "400" | "500";
  direction?: "up" | "none";
  fullWidth?: boolean;
}

const FadeIn = ({
  children,
  className,
  delay = "none",
  direction = "up",
  fullWidth = false,
}: FadeInProps) => {
  return (
    <div
      className={cn(
        "opacity-0",
        direction === "up" ? "animate-slide-up" : "animate-fade-in",
        delay !== "none" && `animation-delay-${delay}`,
        fullWidth && "w-full",
        className
      )}
    >
      {children}
    </div>
  );
};

export default FadeIn;
