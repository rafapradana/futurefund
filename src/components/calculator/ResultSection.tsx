import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvestmentResult, formatNumber, formatInvestmentPeriod } from "@/utils/calculator";
import Chart from "./Chart";
import { Download, TrendingUp, PiggyBank, Wallet, PercentIcon, Check, AlertTriangle, Clock, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResultSectionProps {
  result: InvestmentResult;
  frequency: "monthly" | "yearly";
  onReset: () => void;
}

const ResultSection: React.FC<ResultSectionProps> = ({
  result,
  frequency,
  onReset,
}) => {
  const {
    initialInvestment,
    periodicInvestment,
    interestRate,
    timeHorizon,
    finalValue,
    totalInvestment,
    totalReturn,
    monthlyBreakdown,
    targetAmount = 0,
    targetMet = true,
    shortfall = 0,
    requiredPeriodicInvestment,
    requiredTimeHorizon,
    // Tax properties
    taxRate = 0,
    taxAmount = 0,
    afterTaxReturn = totalReturn,
    afterTaxFinalValue = finalValue,
  } = result;

  const hasTarget = !!targetAmount;
  const targetProgress = hasTarget ? Math.min((afterTaxFinalValue / targetAmount) * 100, 100) : 100;

  const [inflationRate, setInflationRate] = useState(4.5); // Default inflasi Indonesia ~4.5%
  
  // Hitung nilai dengan inflasi berdasarkan nilai setelah pajak
  const inflationAdjustedValue = afterTaxFinalValue / Math.pow(1 + (inflationRate / 100), timeHorizon);
  
  // Menghitung ROI (Return on Investment) setelah pajak
  const afterTaxRoi = ((afterTaxFinalValue - totalInvestment) / totalInvestment) * 100;
  
  // Menghitung ROI (Return on Investment) sebelum pajak
  const beforeTaxRoi = ((finalValue - totalInvestment) / totalInvestment) * 100;
  
  // Menghitung rata-rata return tahunan setelah pajak
  const afterTaxAnnualizedReturn = Math.pow(afterTaxFinalValue / totalInvestment, 1 / timeHorizon) - 1;
  
  // Hitung peningkatan investasi bulanan/tahunan yang diperlukan
  const calculateRequiredIncrease = () => {
    if (!hasTarget || targetMet || !requiredPeriodicInvestment) return 0;
    return ((requiredPeriodicInvestment - periodicInvestment) / periodicInvestment) * 100;
  };
  
  const increasePercentage = calculateRequiredIncrease();
  
  // Fungsi untuk mengekspor hasil perhitungan
  const exportResults = () => {
    try {
      const data = {
        inputData: {
          initialInvestment,
          periodicInvestment,
          interestRate,
          timeHorizon,
          frequency,
          targetAmount,
          taxRate
        },
        resultData: {
          finalValue,
          totalInvestment,
          totalReturn,
          afterTaxReturn,
          afterTaxFinalValue,
          taxAmount,
          roi: afterTaxRoi.toFixed(2),
          inflationAdjustedValue,
          targetMet,
          shortfall
        }
      };
      
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hasil-investasi.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Tampilkan notifikasi sukses
      alert('Data berhasil diekspor. Silakan periksa file hasil unduhan.');
    } catch (error) {
      console.error('Gagal mengekspor data:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-xl sm:text-2xl font-semibold">Hasil Perhitungan</h2>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button variant="outline" size="sm" onClick={exportResults} className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>Ekspor</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onReset} className="flex items-center gap-1">
            <span>Hitung Ulang</span>
          </Button>
        </div>
      </div>

      <Separator />
      
      {/* Status Pencapaian Target */}
      {hasTarget && (
        <Card className="border shadow-sm overflow-hidden">
          <div className={`py-2 px-4 text-white ${targetMet ? 'bg-green-600' : 'bg-yellow-600'} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              {targetMet ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span className="font-medium">
                {targetMet ? 'Target Tercapai' : 'Perlu Penyesuaian'}
              </span>
            </div>
            {hasTarget && (
              <div className="text-sm">
                Target: Rp {formatNumber(targetAmount)}
              </div>
            )}
          </div>
          
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{targetProgress.toFixed(1)}%</span>
                </div>
                <Progress value={targetProgress} className="h-2" />
              </div>
              
              {!targetMet && hasTarget && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                  <h4 className="text-sm font-medium mb-2 flex items-center text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Perlu Penyesuaian untuk Mencapai Target
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    {requiredPeriodicInvestment && (
                      <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-amber-100 dark:border-amber-900">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                          <Wallet className="w-4 h-4 text-amber-600 dark:text-amber-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Tingkatkan investasi {frequency === "monthly" ? "bulanan" : "tahunan"}</p>
                          <div className="mt-1 flex flex-col">
                            <span className="text-base font-bold">Rp {formatNumber(requiredPeriodicInvestment)}</span>
                            <span className="text-xs text-muted-foreground">
                              {increasePercentage > 0 ? `Naik ${increasePercentage.toFixed(1)}% dari saat ini` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {requiredTimeHorizon && (
                      <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-amber-100 dark:border-amber-900">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Perpanjang jangka waktu</p>
                          <div className="mt-1 flex flex-col">
                            <span className="text-base font-bold">{requiredTimeHorizon} tahun</span>
                            <span className="text-xs text-muted-foreground">
                              {requiredTimeHorizon > timeHorizon ? `Tambah ${(requiredTimeHorizon - timeHorizon).toFixed(1)} tahun dari rencana awal` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-amber-100 dark:border-amber-900 sm:col-span-2">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                        <Target className="w-4 h-4 text-amber-600 dark:text-amber-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Pertimbangkan instrumen dengan return lebih tinggi</p>
                        <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Reksa Dana Pendapatan Tetap</span>
                              <span className="font-medium">~7%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Reksa Dana Campuran</span>
                              <span className="font-medium">~9%</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Reksa Dana Saham</span>
                              <span className="font-medium">~12%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Saham</span>
                              <span className="font-medium">~15%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <Card className="border shadow-sm bg-card/50 hover:bg-card/80 transition-colors">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-muted rounded-full mb-3">
                <PiggyBank className="w-6 h-6" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Akhir</p>
              <p className="text-xs text-muted-foreground">
                setelah {formatInvestmentPeriod(frequency === "monthly" ? timeHorizon : timeHorizon * 12)}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">Rp {formatNumber(afterTaxFinalValue)}</h3>
              {taxRate > 0 && (
                <p className="text-xs text-muted-foreground">
                  (Sebelum pajak: Rp {formatNumber(finalValue)})
                </p>
              )}
              {hasTarget && (
                <p className={`text-xs mt-1 ${targetMet ? 'text-green-600' : 'text-yellow-600'}`}>
                  {targetMet 
                    ? `+${formatNumber(afterTaxFinalValue - targetAmount)} dari target`
                    : `-${formatNumber(targetAmount - afterTaxFinalValue)} dari target`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card/50 hover:bg-card/80 transition-colors">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-muted rounded-full mb-3">
                <Wallet className="w-6 h-6" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Investasi</p>
              <p className="text-xs text-muted-foreground">
                dana yang telah diinvestasikan
              </p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">Rp {formatNumber(totalInvestment)}</h3>
              <p className="text-xs mt-1 text-muted-foreground">
                {((totalInvestment / afterTaxFinalValue) * 100).toFixed(0)}% dari total akhir
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card/50 hover:bg-card/80 transition-colors">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-muted rounded-full mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Return</p>
              <p className="text-xs text-muted-foreground">
                dengan {(interestRate || 0).toFixed(2)}% per tahun
              </p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">Rp {formatNumber(afterTaxReturn)}</h3>
              {taxRate > 0 && (
                <p className="text-xs text-muted-foreground">
                  (Sebelum pajak: Rp {formatNumber(totalReturn)})
                </p>
              )}
              <p className="text-xs mt-1 text-blue-600">
                +{((afterTaxReturn / totalInvestment) * 100).toFixed(1)}% dari investasi
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full">
        <Chart result={result} frequency={frequency} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full mb-4 grid grid-cols-3">
          <TabsTrigger value="overview">Detail Investasi</TabsTrigger>
          <TabsTrigger value="tax">Informasi Pajak</TabsTrigger>
          <TabsTrigger value="analysis">Analisis Lanjutan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="animate-in fade-in-50 duration-300">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Rincian Investasi
              </CardTitle>
              <CardDescription>
                Detail komponen perhitungan investasi Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Investasi Awal
                  </div>
                  <div className="text-base font-medium">
                    Rp {formatNumber(initialInvestment)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {frequency === "monthly" 
                      ? "Investasi Bulanan" 
                      : "Investasi Tahunan"}
                  </div>
                  <div className="text-base font-medium">
                    Rp {formatNumber(periodicInvestment)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Periode Investasi
                  </div>
                  <div className="text-base font-medium">
                    {formatInvestmentPeriod(frequency === "monthly" ? timeHorizon : timeHorizon * 12)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Return Tahunan
                  </div>
                  <div className="text-base font-medium">
                    {(interestRate || 0).toFixed(2)}% per tahun
                  </div>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Pertumbuhan Dana
                  </div>
                  <div className="text-base font-medium">
                    {((finalValue / totalInvestment) * 100 - 100).toFixed(2)}%
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Persentase Return dari Total
                  </div>
                  <div className="text-base font-medium">
                    {((totalReturn / finalValue) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tax" className="animate-in fade-in-50 duration-300">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Perhitungan Pajak Investasi
              </CardTitle>
              <CardDescription>
                Detail perhitungan pajak atas keuntungan investasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Tarif Pajak
                  </div>
                  <div className="text-base font-medium">
                    {taxRate}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    PPh Final atas keuntungan investasi
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Total Pajak
                  </div>
                  <div className="text-base font-medium">
                    Rp {formatNumber(taxAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {((taxAmount / totalReturn) * 100).toFixed(1)}% dari total return
                  </div>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Return Sebelum Pajak
                  </div>
                  <div className="text-base font-medium">
                    Rp {formatNumber(totalReturn)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Return Setelah Pajak
                  </div>
                  <div className="text-base font-medium">
                    Rp {formatNumber(afterTaxReturn)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Nilai Akhir Sebelum Pajak
                  </div>
                  <div className="text-base font-medium">
                    Rp {formatNumber(finalValue)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Nilai Akhir Setelah Pajak
                  </div>
                  <div className="text-base font-medium">
                    Rp {formatNumber(afterTaxFinalValue)}
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-md mt-2">
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium">Tentang Pajak Investasi:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Pajak atas keuntungan investasi biasanya berupa PPh Final</li>
                    <li>PPh Final untuk deposito dan obligasi umumnya 20%</li>
                    <li>PPh Final untuk reksadana dan saham umumnya 10%</li>
                    <li>Pajak hanya dikenakan pada keuntungan, bukan pada nilai pokok investasi</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis" className="animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <PercentIcon className="h-4 w-4" />
                  Return on Investment (ROI)
                </CardTitle>
                <CardDescription>
                  Total keuntungan sebagai persentase dari investasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-green-600">
                  {afterTaxRoi.toFixed(2)}%
                </div>
                {taxRate > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Sebelum pajak: {beforeTaxRoi.toFixed(2)}%
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  ROI menunjukkan persentase keuntungan dari total dana yang diinvestasikan
                </p>
              </CardContent>
            </Card>
            
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Return Tahunan Rata-rata
                </CardTitle>
                <CardDescription>
                  Tingkat pertumbuhan tahunan yang disetarakan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-green-600">
                  {(afterTaxAnnualizedReturn * 100).toFixed(2)}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Tingkat pertumbuhan tahunan rata-rata selama periode investasi setelah pajak
                </p>
              </CardContent>
            </Card>
            
            <Card className="border shadow-sm col-span-1 sm:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">
                  Analisis Inflasi
                </CardTitle>
                <CardDescription>
                  Nilai investasi setelah memperhitungkan inflasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground">
                    Asumsi Inflasi Tahunan ({inflationRate}%)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs">
                    <span>1%</span>
                    <span>5%</span>
                    <span>10%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Nilai Nominal (Setelah Pajak)
                    </div>
                    <div className="text-xl font-semibold">
                      Rp {formatNumber(afterTaxFinalValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Nilai Riil (Dengan Inflasi)
                    </div>
                    <div className="text-xl font-semibold">
                      Rp {formatNumber(inflationAdjustedValue)}
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md text-sm text-amber-800 dark:text-amber-300">
                  <p>
                    Dengan asumsi inflasi {inflationRate}% per tahun, daya beli Rp{formatNumber(afterTaxFinalValue)} saat ini 
                    akan setara dengan Rp{formatNumber(inflationAdjustedValue)} dalam {timeHorizon} tahun.
                  </p>
                  <p className="mt-1">
                    Ini berarti kekuatan beli Anda <strong>{inflationAdjustedValue < afterTaxFinalValue ? "berkurang" : "bertambah"} sebesar {Math.abs(((inflationAdjustedValue/afterTaxFinalValue) - 1) * 100).toFixed(2)}%</strong> karena faktor inflasi.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultSection;
