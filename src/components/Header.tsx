import React from "react";
import { Link } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";
import { Wallet } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const Header = () => {
  const { theme } = useTheme();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <Wallet 
              className="h-5 w-5 sm:h-6 sm:w-6" 
              color={theme === "dark" ? "white" : "black"}
            />
            <span className="ml-2 text-base sm:text-lg font-semibold">FutureFund</span>
          </Link>
        </div>
        
        <nav className="flex items-center">
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Header;
