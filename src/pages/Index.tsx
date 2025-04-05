import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import InputSection from "@/components/calculator/InputSection";
import { FrequencyType, InvestmentInput, InvestmentResult, TimingType, calculateInvestment } from "@/utils/calculator";
import { useToast } from "@/components/ui/use-toast";
import { getInputData, saveInputData, clearInputData } from "@/utils/indexedDBUtils";

// Default input values
const defaultInput: InvestmentInput = {
  targetAmount: "",
  timeHorizon: "",
  initialInvestment: "",
  frequency: "monthly" as FrequencyType,
  periodicInvestment: "",
  investmentTiming: "end" as TimingType,
  annualReturn: "",
  inflation: 4.5,
  taxRate: 10,
};

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [input, setInput] = useState<InvestmentInput>(defaultInput);
  const [isLoading, setIsLoading] = useState(true);
  
  // Effect untuk memuat data dari IndexedDB saat komponen dimount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Cek jika perlu reset berdasarkan state dari halaman results
        if (location.state?.reset) {
          // Reset input ke default dan hapus data dari IndexedDB
          setInput(defaultInput);
          await clearInputData();
          toast({
            title: "Form direset",
            description: "Form kalkulator telah direset ke nilai default",
          });
        }
        // Periksa apakah ada data dari halaman hasil
        else if (location.state?.input) {
          setInput(location.state.input);
        } else {
          // Jika tidak ada, coba ambil dari IndexedDB
          const savedInput = await getInputData();
          if (savedInput) {
            setInput(savedInput);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Hapus state setelah digunakan untuk menghindari reset yang tidak diinginkan jika halaman di-refresh
    if (location.state?.reset || location.state?.input) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  // Effect untuk menyimpan data ke IndexedDB setiap kali input berubah
  useEffect(() => {
    if (!isLoading) {
      const saveData = async () => {
        try {
          await saveInputData(input);
        } catch (error) {
          console.error("Error saving data:", error);
        }
      };
      
      saveData();
    }
  }, [input, isLoading]);
  
  // Fungsi untuk memperbarui input dengan memastikan nilai tersimpan ke IndexedDB
  const handleInputChange = (newInput: InvestmentInput) => {
    setInput(newInput);
  };
  
  const handleCalculate = () => {
    // Validate inputs
    if (!input.targetAmount) {
      toast({
        title: "Input tidak valid",
        description: "Target dana harus diisi",
        variant: "destructive",
      });
      return;
    }
    
    if (!input.timeHorizon) {
      toast({
        title: "Input tidak valid",
        description: "Jangka waktu harus diisi",
        variant: "destructive",
      });
      return;
    }
    
    if (Number(input.targetAmount) <= 0) {
      toast({
        title: "Input tidak valid",
        description: "Target dana harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }
    
    if (Number(input.timeHorizon) <= 0) {
      toast({
        title: "Input tidak valid",
        description: "Jangka waktu harus diisi",
        variant: "destructive",
      });
      return;
    }
    
    if (input.annualReturn !== "" && Number(input.annualReturn) < 0) {
      toast({
        title: "Input tidak valid",
        description: "Return tahunan tidak boleh negatif",
        variant: "destructive",
      });
      return;
    }
    
    // All inputs are already numbers from the InputSection component
    const calculationInput: InvestmentInput = {
      targetAmount: Number(input.targetAmount) || 0,
      timeHorizon: Number(input.timeHorizon) || 0,
      initialInvestment: Number(input.initialInvestment) || 0,
      frequency: input.frequency,
      periodicInvestment: Number(input.periodicInvestment) || 0,
      investmentTiming: input.investmentTiming,
      annualReturn: Number(input.annualReturn) || 0,
      taxRate: Number(input.taxRate) || 0,
      inflation: Number(input.inflation) || 0,
    };
    
    // Calculate result
    const result = calculateInvestment(calculationInput);
    
    // Show success toast
    toast({
      title: "Perhitungan selesai",
      description: result.targetMet 
        ? "Target investasi Anda akan tercapai!" 
        : "Target investasi Anda membutuhkan penyesuaian",
    });
    
    // Navigate to results page with the calculation data
    navigate("/results", { 
      state: { 
        result: result,
        input: calculationInput
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center p-4">
          <p className="text-base sm:text-lg text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-3 sm:px-6 py-3 sm:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section - Optimized for mobile */}
          <div className="mb-4 sm:mb-8 py-4 sm:py-8 text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3">
              FutureFund
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              Rencanakan masa depan finansial Anda dengan kalkulator investasi yang akurat dan intuitif
            </p>
          </div>
          
          {/* Calculator Section */}
          <div className="mb-6 sm:mb-8">
            <InputSection 
              input={input} 
              setInput={handleInputChange} 
              onCalculate={handleCalculate} 
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

export default Index;
