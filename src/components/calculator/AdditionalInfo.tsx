import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Info, AlertTriangle } from "lucide-react";

const AdditionalInfo: React.FC = () => {
  return (
    <Card className="border shadow-card">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-xl font-medium flex justify-center items-center gap-2">
          <Info className="h-5 w-5" />
          <span>Informasi Investasi</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-4">
        <div className="flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 text-warning-600 mt-0.5 flex-shrink-0" />
          <p>
            Kalkulator ini hanya memberikan estimasi berdasarkan input yang Anda masukkan. 
            Hasil aktual dapat berbeda tergantung pada fluktuasi pasar, inflasi, dan faktor lainnya.
          </p>
        </div>
        
        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-md">
          <h3 className="font-medium mb-2 flex items-center text-blue-800 dark:text-blue-300">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            Return Investasi Umum
          </h3>
          <ul className="pl-6 space-y-1 list-disc">
            <li>Deposito: 3-5% per tahun</li>
            <li>Obligasi Pemerintah: 5-8% per tahun</li>
            <li>Reksa Dana Campuran: 8-12% per tahun</li>
            <li>Saham: 10-15% per tahun (dengan risiko lebih tinggi)</li>
          </ul>
        </div>
        
        <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md">
          <h3 className="font-medium mb-2 flex items-center text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            Pertimbangan Penting
          </h3>
          <ul className="pl-6 space-y-1 list-disc">
            <li>Return investasi historis tidak menjamin hasil di masa depan</li>
            <li>Diversifikasi portofolio untuk meminimalkan risiko investasi</li>
            <li>Pelajari risiko setiap instrumen investasi sebelum berinvestasi</li>
            <li>Alokasikan dana darurat sebesar 3-6 bulan pengeluaran sebelum berinvestasi</li>
            <li>Konsultasikan dengan penasihat keuangan untuk strategi yang lebih personal</li>
          </ul>
        </div>
       
        <div className="mt-4 text-xs text-center italic">
          <p>
            * Hasil perhitungan hanya estimasi dan tidak menjamin return aktual.
            Investasi selalu memiliki risiko, harap pelajari dengan baik sebelum berinvestasi.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdditionalInfo;
