import React from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import ResultSection from "@/components/calculator/ResultSection";
import AdditionalInfo from "@/components/calculator/AdditionalInfo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calculator } from "lucide-react";
import { InvestmentResult } from "@/utils/calculator";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Periksa jika data hasil tidak ada
  if (!location.state?.result) {
    return <Navigate to="/" replace />;
  }
  
  const { result, input } = location.state;
  
  const handleBackToCalculator = () => {
    // Navigasi kembali ke halaman utama dengan membawa data input
    navigate("/", { state: { input } });
  };
  
  const handleNewCalculation = () => {
    // Kembali ke halaman utama tanpa membawa data input (reset)
    navigate("/", { state: { reset: true } });
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-3 sm:px-6 py-3 sm:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Navigation - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Button 
              variant="ghost" 
              className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm h-9 sm:h-10"
              onClick={handleBackToCalculator}
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Kembali ke Kalkulator</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm h-9 sm:h-10"
              onClick={handleNewCalculation}
            >
              <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Kalkulator Baru</span>
            </Button>
          </div>
          
          {/* Result Section */}
          <div className="mb-6 sm:mb-8">
            <ResultSection 
              result={result as InvestmentResult} 
              frequency={input.frequency}
              onReset={handleNewCalculation}
            />
          </div>
          
          {/* Additional Information */}
          <div className="mb-6 sm:mb-10">
            <AdditionalInfo 
              result={result as InvestmentResult}
              timeHorizon={Number(input.timeHorizon)}
            />
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-6 sm:mt-12 text-center text-xs sm:text-sm text-muted-foreground pb-4">
          <p>© {new Date().getFullYear()} FutureFund. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default Results;
