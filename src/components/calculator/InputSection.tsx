import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator, Info, Save, FolderOpen, RotateCcw } from "lucide-react";
import { FrequencyType, InvestmentInput, TimingType, formatNumber, parseFormattedNumber } from "@/utils/calculator";
import { toast } from "@/components/ui/use-toast";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { saveInputData, clearInputData } from "@/utils/indexedDBUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InputSectionProps {
  input: InvestmentInput;
  setInput: React.Dispatch<React.SetStateAction<InvestmentInput>>;
  onCalculate: () => void;
}

// Default input untuk reset
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

const InputSection: React.FC<InputSectionProps> = ({ input, setInput, onCalculate }) => {
  // Display formatted values state
  const [displayValues, setDisplayValues] = useState({
    targetAmount: input.targetAmount ? formatNumber(input.targetAmount) : "",
    initialInvestment: input.initialInvestment ? formatNumber(input.initialInvestment) : "",
    periodicInvestment: input.periodicInvestment ? formatNumber(input.periodicInvestment) : ""
  });
  
  // Update display values when input changes
  useEffect(() => {
    setDisplayValues({
      targetAmount: input.targetAmount ? formatNumber(input.targetAmount) : "",
      initialInvestment: input.initialInvestment ? formatNumber(input.initialInvestment) : "",
      periodicInvestment: input.periodicInvestment ? formatNumber(input.periodicInvestment) : ""
    });
  }, [input]);
  
  // State untuk opsi lanjutan - ubah default menjadi true agar selalu tampil
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(true);
  
  // Pastikan nilai default pajak ada saat komponen dimount
  React.useEffect(() => {
    if (input.taxRate === undefined || input.taxRate === '') {
      setInput(prev => ({
        ...prev,
        taxRate: 10 // Default nilai pajak 10%
      }));
    }
  }, []);
  
  // State untuk dialog penyimpanan dan pemuatan
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [planName, setPlanName] = useState("");
  const [savedPlans, setSavedPlans] = useState<Record<string, any>>({});
  const [selectedPlan, setSelectedPlan] = useState("");
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For numeric fields with formatting
    if (name === 'targetAmount' || name === 'initialInvestment' || name === 'periodicInvestment') {
      // Get cursor position before update
      const cursorPosition = e.target.selectionStart || 0;
      
      // Remove formatting to get just the numbers
      const strippedValue = value.replace(/\D/g, '');
      
      if (strippedValue === '') {
        // If no value, clear the field
        setDisplayValues(prev => ({
          ...prev,
          [name]: ''
        }));
        
        setInput(prev => ({
          ...prev,
          [name]: ''
        }));
        return;
      }
      
      // Convert to number and format
      const numericValue = Number(strippedValue);
      const formattedValue = formatNumber(numericValue);
      
      // Calculate cursor position adjustment based on added thousand separators
      const beforeSeparators = value.substring(0, cursorPosition).replace(/\D/g, '').length;
      const newFormattedBeforeCursor = formatNumber(Number(strippedValue.substring(0, beforeSeparators)));
      const newCursorPosition = newFormattedBeforeCursor.length;
      
      // Store formatted value for display
      setDisplayValues(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      
      // Store actual numeric value
      setInput((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
      
      // Set cursor position after state update
      setTimeout(() => {
        const input = document.getElementById(name) as HTMLInputElement;
        if (input) {
          input.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    } else {
      // For other fields without formatting (timeHorizon, annualReturn)
      setInput((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, period/comma
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '.', ','];
    const { key } = e;
    
    // Allow navigation keys and modifier combinations (e.g., shift+arrow for selection)
    if (e.ctrlKey || e.altKey || e.metaKey || 
        key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown' ||
        key === 'Home' || key === 'End') {
      return;
    }
    
    // Prevent input if not a number or not in allowed keys
    if (allowedKeys.indexOf(key) === -1 && !/^\d$/.test(key)) {
      e.preventDefault();
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Dialog untuk reset inputan
  const openResetDialog = () => {
    setResetDialogOpen(true);
  };

  const handleResetForm = async () => {
    setResetDialogOpen(false);
    
    try {
      // Reset nilai inputan ke default
      setInput(defaultInput);
      
      // Update display values
      setDisplayValues({
        targetAmount: "",
        initialInvestment: "",
        periodicInvestment: ""
      });
      
      // Hapus data dari IndexedDB (optional)
      await clearInputData();
      
      toast({
        title: "Form direset",
        description: "Semua nilai inputan telah dikembalikan ke default",
      });
    } catch (error) {
      console.error("Error resetting form:", error);
      toast({
        title: "Gagal reset form",
        description: "Terjadi kesalahan saat mereset data input",
        variant: "destructive",
      });
    }
  };

  // Dialog untuk menyimpan rencana investasi
  const openSaveDialog = () => {
    // Validasi input sebelum menyimpan
    if (!input.targetAmount || !input.timeHorizon) {
      toast({
        title: "Input tidak lengkap",
        description: "Mohon lengkapi minimal target dana dan jangka waktu",
        variant: "destructive",
      });
      return;
    }
    
    setPlanName("");
    setSaveDialogOpen(true);
  };
  
  const handleSavePlan = () => {
    if (!planName.trim()) {
      toast({
        title: "Nama rencana kosong",
        description: "Mohon isi nama untuk rencana investasi Anda",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Simpan ke local storage
      const savedPlans = JSON.parse(localStorage.getItem('investmentPlans') || '{}');
      savedPlans[planName] = {
        ...input,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('investmentPlans', JSON.stringify(savedPlans));
      
      toast({
        title: "Rencana investasi disimpan",
        description: `Rencana "${planName}" berhasil disimpan`,
      });
      
      setSaveDialogOpen(false);
    } catch (error) {
      console.error('Gagal menyimpan rencana:', error);
      toast({
        title: "Gagal menyimpan",
        description: "Terjadi kesalahan saat menyimpan rencana investasi",
        variant: "destructive",
      });
    }
  };
  
  // Dialog untuk memuat rencana investasi
  const openLoadDialog = () => {
    try {
      const plans = JSON.parse(localStorage.getItem('investmentPlans') || '{}');
      
      if (Object.keys(plans).length === 0) {
        toast({
          title: "Tidak ada rencana tersimpan",
          description: "Anda belum menyimpan rencana investasi",
          variant: "destructive",
        });
        return;
      }
      
      setSavedPlans(plans);
      setSelectedPlan("");
      setLoadDialogOpen(true);
    } catch (error) {
      console.error('Gagal memuat daftar rencana:', error);
      toast({
        title: "Gagal memuat daftar",
        description: "Terjadi kesalahan saat membaca data rencana tersimpan",
        variant: "destructive",
      });
    }
  };
  
  const handleLoadPlan = () => {
    if (!selectedPlan) {
      toast({
        title: "Pilih rencana",
        description: "Silahkan pilih rencana yang ingin dimuat",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const plan = savedPlans[selectedPlan];
      
      // Perbarui displayValues juga agar sesuai
      setDisplayValues({
        targetAmount: plan.targetAmount ? formatNumber(plan.targetAmount) : "",
        initialInvestment: plan.initialInvestment ? formatNumber(plan.initialInvestment) : "",
        periodicInvestment: plan.periodicInvestment ? formatNumber(plan.periodicInvestment) : ""
      });
      
      setInput(plan);
      
      // Simpan juga ke IndexedDB
      saveInputData(plan).catch(console.error);
      
      toast({
        title: "Rencana dimuat",
        description: `Rencana "${selectedPlan}" berhasil dimuat`,
      });
      
      setLoadDialogOpen(false);
    } catch (error) {
      console.error('Gagal memuat rencana:', error);
      toast({
        title: "Gagal memuat",
        description: "Terjadi kesalahan saat memuat rencana investasi",
        variant: "destructive",
      });
    }
  };
  
  const openDeleteDialog = () => {
    if (!selectedPlan) {
      toast({
        title: "Pilih rencana",
        description: "Silahkan pilih rencana yang ingin dihapus",
        variant: "destructive",
      });
      return;
    }
    
    setDeleteDialogOpen(true);
  };
  
  const handleDeletePlan = () => {
    try {
      const plans = JSON.parse(localStorage.getItem('investmentPlans') || '{}');
      delete plans[selectedPlan];
      localStorage.setItem('investmentPlans', JSON.stringify(plans));
      
      toast({
        title: "Rencana dihapus",
        description: `Rencana "${selectedPlan}" berhasil dihapus`,
      });
      
      setSavedPlans(plans);
      setSelectedPlan("");
      setDeleteDialogOpen(false);
      
      // Jika tidak ada rencana tersisa, tutup dialog load
      if (Object.keys(plans).length === 0) {
        setLoadDialogOpen(false);
      }
    } catch (error) {
      console.error('Gagal menghapus rencana:', error);
      toast({
        title: "Gagal menghapus",
        description: "Terjadi kesalahan saat menghapus rencana investasi",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="border shadow-card">
        <CardHeader className="pb-3 px-4 sm:px-6 space-y-1 text-center">
          <CardTitle className="text-lg sm:text-xl font-medium">Kalkulator Investasi</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Masukkan data rencana investasi Anda untuk melihat proyeksi pertumbuhan dana
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
            {/* Target Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="targetAmount" className="text-xs sm:text-sm font-medium">
                Target Dana
              </Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  Rp
                </span>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="text"
                  placeholder="1.000.000.000"
                  className="pl-8 text-sm h-9 sm:h-10"
                  value={displayValues.targetAmount}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  inputMode="decimal"
                />
              </div>
            </div>
            
            {/* Time Horizon */}
            <div className="space-y-1.5">
              <Label htmlFor="timeHorizon" className="text-xs sm:text-sm font-medium">
                Jangka Waktu (tahun)
              </Label>
              <Input
                id="timeHorizon"
                name="timeHorizon"
                type="number"
                placeholder="10"
                className="text-sm h-9 sm:h-10"
                value={input.timeHorizon || ""}
                onChange={handleInputChange}
                inputMode="numeric"
              />
            </div>
            
            {/* Initial Investment */}
            <div className="space-y-1.5">
              <Label htmlFor="initialInvestment" className="text-xs sm:text-sm font-medium">
                Dana Awal
              </Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  Rp
                </span>
                <Input
                  id="initialInvestment"
                  name="initialInvestment"
                  type="text"
                  placeholder="10.000.000"
                  className="pl-8 text-sm h-9 sm:h-10"
                  value={displayValues.initialInvestment}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  inputMode="decimal"
                />
              </div>
            </div>
            
            {/* Frequency */}
            <div className="space-y-1.5">
              <Label htmlFor="frequency" className="text-xs sm:text-sm font-medium">
                Frekuensi Investasi
              </Label>
              <Select
                value={input.frequency}
                onValueChange={(value) => handleSelectChange("frequency", value as FrequencyType)}
              >
                <SelectTrigger className="text-sm h-9 sm:h-10">
                  <SelectValue placeholder="Pilih frekuensi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Periodic Investment */}
            <div className="space-y-1.5">
              <Label htmlFor="periodicInvestment" className="text-xs sm:text-sm font-medium">
                {input.frequency === "monthly" ? "Investasi Bulanan" : "Investasi Tahunan"}
              </Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  Rp
                </span>
                <Input
                  id="periodicInvestment"
                  name="periodicInvestment"
                  type="text"
                  placeholder="1.000.000"
                  className="pl-8 text-sm h-9 sm:h-10"
                  value={displayValues.periodicInvestment}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  inputMode="decimal"
                />
              </div>
            </div>
            
            {/* Investment Timing */}
            <div className="space-y-1.5">
              <Label htmlFor="investmentTiming" className="text-xs sm:text-sm font-medium">
                Waktu Investasi
              </Label>
              <Select
                value={input.investmentTiming}
                onValueChange={(value) => handleSelectChange("investmentTiming", value as TimingType)}
              >
                <SelectTrigger className="text-sm h-9 sm:h-10">
                  <SelectValue placeholder="Pilih waktu investasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Awal {input.frequency === "monthly" ? "Bulan" : "Tahun"}</SelectItem>
                  <SelectItem value="end">Akhir {input.frequency === "monthly" ? "Bulan" : "Tahun"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Annual Return */}
            <div className="space-y-1.5">
              <Label htmlFor="annualReturn" className="text-xs sm:text-sm font-medium">
                Return Tahunan (%)
              </Label>
              <Input
                id="annualReturn"
                name="annualReturn"
                type="number"
                placeholder="7"
                className="text-sm h-9 sm:h-10"
                value={input.annualReturn || ""}
                onChange={handleInputChange}
                inputMode="decimal"
              />
            </div>
            
            {/* Advanced Options - ubah tampilan menjadi varian section card */}
            <div className="space-y-1.5 col-span-1 sm:col-span-2">
              <Separator className="my-1.5" />
              <h3 className="text-xs sm:text-sm font-medium mb-2">Opsi Lanjutan</h3>
            </div>
            
            {/* Inflasi */}
            <div className="space-y-1.5">
              <Label htmlFor="inflation" className="text-xs sm:text-sm font-medium flex items-center">
                Inflasi Tahunan (%)
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                      <Info className="h-3 w-3" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72 text-xs">
                    <p>Perkiraan tingkat inflasi tahunan. Rata-rata inflasi di Indonesia sekitar 3-5% per tahun.</p>
                  </HoverCardContent>
                </HoverCard>
              </Label>
              <Input
                id="inflation"
                name="inflation"
                type="number"
                placeholder="4.5"
                className="text-sm h-9 sm:h-10"
                value={input.inflation || ""}
                onChange={handleInputChange}
                inputMode="decimal"
              />
            </div>
            
            {/* Tax Rate */}
            <div className="space-y-1.5">
              <Label htmlFor="taxRate" className="text-xs sm:text-sm font-medium flex items-center">
                Pajak (%)
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                      <Info className="h-3 w-3" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72 text-xs">
                    <p>Tarif pajak untuk keuntungan investasi. Pajak penghasilan dari investasi umumnya 10% dari keuntungan (PPh Final).</p>
                  </HoverCardContent>
                </HoverCard>
              </Label>
              <Input
                id="taxRate"
                name="taxRate"
                type="number"
                placeholder="10"
                className="text-sm h-9 sm:h-10"
                value={input.taxRate || ""}
                onChange={handleInputChange}
                inputMode="decimal"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-2">
            {/* Action Buttons - Dibuat lebih mobile-friendly */}
            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex">
              <Button variant="outline" size="sm" onClick={openSaveDialog} className="flex items-center gap-1 h-8 sm:h-9 text-xs sm:text-sm">
                <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sm:inline">Simpan</span>
              </Button>
              <Button variant="outline" size="sm" onClick={openLoadDialog} className="flex items-center gap-1 h-8 sm:h-9 text-xs sm:text-sm">
                <FolderOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sm:inline">Muat</span>
              </Button>
              <Button variant="outline" size="sm" onClick={openResetDialog} className="flex items-center gap-1 h-8 sm:h-9 text-xs sm:text-sm">
                <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sm:inline">Reset</span>
              </Button>
            </div>
            
            <Button 
              onClick={onCalculate} 
              size="lg" 
              className="w-full sm:w-auto transition-all duration-200 hover:scale-105 h-10 sm:h-11 text-sm sm:text-base"
            >
              Hitung Proyeksi
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog untuk menyimpan rencana - Mobile optimized */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md w-[calc(100%-32px)] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Simpan Rencana Investasi</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Beri nama untuk rencana investasi ini agar mudah ditemukan nanti.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan-name" className="text-xs sm:text-sm font-medium">
                Nama Rencana
              </Label>
              <Input
                id="plan-name"
                placeholder="Contoh: Dana Pendidikan Anak"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="text-sm h-9"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)} className="sm:w-auto w-full text-sm h-9">
              Batal
            </Button>
            <Button onClick={handleSavePlan} className="sm:w-auto w-full text-sm h-9">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog untuk memuat rencana - Mobile optimized */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent className="sm:max-w-md w-[calc(100%-32px)] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Muat Rencana Investasi</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Pilih rencana investasi yang ingin dimuat.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="saved-plan" className="text-xs sm:text-sm font-medium">
                Daftar Rencana
              </Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="text-sm h-9">
                  <SelectValue placeholder="Pilih rencana investasi" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(savedPlans).map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2">
            <Button variant="outline" onClick={() => setLoadDialogOpen(false)} className="sm:w-auto w-full text-sm h-9">
              Batal
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="destructive" 
                onClick={openDeleteDialog}
                disabled={!selectedPlan}
                className="flex-1 sm:flex-none text-sm h-9"
              >
                Hapus
              </Button>
              <Button 
                onClick={handleLoadPlan} 
                disabled={!selectedPlan}
                className="flex-1 sm:flex-none text-sm h-9"
              >
                Muat
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog konfirmasi penghapusan - Mobile optimized */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[calc(100%-32px)] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Apakah Anda yakin ingin menghapus rencana "{selectedPlan}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="sm:w-auto w-full text-sm h-9">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePlan} 
              className="bg-destructive text-destructive-foreground sm:w-auto w-full text-sm h-9"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dialog konfirmasi reset form - Mobile optimized */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="w-[calc(100%-32px)] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Reset Formulir</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Apakah Anda yakin ingin mereset semua nilai ke default? Semua data yang belum disimpan akan hilang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="sm:w-auto w-full text-sm h-9">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetForm} 
              className="bg-destructive text-destructive-foreground sm:w-auto w-full text-sm h-9"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InputSection;
