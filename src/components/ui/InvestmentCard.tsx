
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface InvestmentCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({ 
  children, 
  className,
  onClick
}) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden border border-border/50 shadow-subtle transition-all duration-300 hover:shadow-card", 
        className,
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
};

export default InvestmentCard;
