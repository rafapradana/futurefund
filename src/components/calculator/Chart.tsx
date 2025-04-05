import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { InvestmentResult, formatNumber } from "@/utils/calculator";
import { useTheme } from "@/components/theme-provider";

interface ChartProps {
  result: InvestmentResult;
  frequency: "monthly" | "yearly";
}

// Format function for Rupiah - defined before components that use it
const formatToRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format period to be more informative
const formatPeriod = (period: number, frequency: "monthly" | "yearly") => {
  if (frequency === "yearly") {
    return `Periode: Tahun ${period}`;
  }
  
  // For monthly frequency, show month and year if applicable
  if (period < 12) {
    return `Periode: ${period} bulan`;
  } else {
    const years = Math.floor(period / 12);
    const months = period % 12;
    
    if (months === 0) {
      return `Periode: ${years} tahun`;
    } else {
      return `Periode: ${period} bulan (${years} tahun ${months} bulan)`;
    }
  }
};

// Format X axis labels - mobile optimized
const formatXAxisTick = (value: number, frequency: "monthly" | "yearly", isMobile: boolean) => {
  if (frequency === "yearly") {
    return isMobile ? `T.${value}` : `Tahun ${value}`;
  }
  
  if (value < 12) {
    return isMobile ? `B.${value}` : `Bulan ${value}`;
  } else {
    const years = Math.floor(value / 12);
    const months = value % 12;
    
    if (months === 0) {
      return isMobile ? `${years}t` : `${years} thn`;
    } else {
      // For space reasons, just show the month if we're showing all months
      return `${value}`;
    }
  }
};

// Custom tooltip component - mobile friendly
const CustomTooltip = ({ active, payload, label, frequency, isMobile }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`bg-white dark:bg-gray-900 p-${isMobile ? '2' : '4'} border shadow-sm rounded-md text-xs sm:text-sm`}>
        <p className="font-medium mb-1 sm:mb-2 text-xs sm:text-sm">{formatPeriod(payload[0].payload.period, frequency)}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-black dark:bg-white" />
            <span className="text-muted-foreground text-xs">Total:</span>
            <span className="font-medium text-xs">{formatToRupiah(payload[0].value)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#2563eb]" />
            <span className="text-muted-foreground text-xs">Modal:</span>
            <span className="font-medium text-xs">{formatToRupiah(payload[1].value)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#16a34a]" />
            <span className="text-muted-foreground text-xs">Return:</span>
            <span className="font-medium text-xs">{formatToRupiah(payload[2].value)}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const Chart: React.FC<ChartProps> = ({ result, frequency }) => {
  const { theme } = useTheme();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const chartRef = useRef<HTMLDivElement>(null);
  const isMobile = windowWidth < 640;
  
  // Monitor window size for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Safety check to make sure monthlyBreakdown exists and is an array
  if (!result || !Array.isArray(result.monthlyBreakdown) || result.monthlyBreakdown.length === 0) {
    return (
      <Card className="border shadow-card">
        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-base sm:text-lg font-medium">
            Pertumbuhan Investasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 sm:h-60 w-full mt-2 sm:mt-4 flex items-center justify-center">
            <p className="text-muted-foreground text-xs sm:text-sm">Data tidak cukup untuk menampilkan grafik</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate investment duration in years
  const investmentYears = frequency === "monthly" 
    ? Math.ceil(result.monthlyBreakdown.length / 12) 
    : result.monthlyBreakdown.length;
  
  // Show all monthly data points if less than 5 years, otherwise filter
  const showAllMonths = frequency === "monthly" && investmentYears <= 5;
  
  // Prepare data for chart
  const chartData = result.monthlyBreakdown.map((item) => {
    const period = frequency === "monthly" ? item.month : Math.ceil(item.month / 12);
    let label = frequency === "monthly"
      ? `Bulan ${item.month}`
      : `Tahun ${Math.ceil(item.month / 12)}`;
      
    // For monthly data, if period > 12, show both years and months
    if (frequency === "monthly" && item.month >= 12) {
      const years = Math.floor(item.month / 12);
      const months = item.month % 12;
      
      if (months === 0) {
        label = `${years} tahun`;
      } else {
        label = `${years} tahun ${months} bulan`;
      }
    }
    
    return {
      name: label,
      period: period || 0, // Ensure period is not undefined or NaN
      Total: item.totalValue || 0, // Ensure values are not undefined or NaN
      Modal: item.investmentValue || 0,
      Return: item.returnValue || 0,
    };
  });
  
  // If monthly, filter data points based on duration and screen size
  const filterInterval = isMobile ? 
    (chartData.length > 48 ? 12 : chartData.length > 24 ? 6 : chartData.length > 12 ? 3 : 1) : 
    (chartData.length > 60 ? 12 : chartData.length > 36 ? 6 : 1);
  
  const filteredData = frequency === "monthly" && !showAllMonths
    ? chartData.filter((item, index) => index === 0 || index === chartData.length - 1 || item.period % filterInterval === 0)
    : chartData;

  // Calculate chart aspect ratio based on screen size
  const chartAspectRatio = isMobile ? 1.2 : 2;

  return (
    <Card className="border shadow-card">
      <CardHeader className="pb-1 sm:pb-2 text-center">
        <CardTitle className="text-base sm:text-lg font-medium">
          Pertumbuhan Investasi
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {frequency === "monthly" && investmentYears <= 5 
            ? "Menampilkan proyeksi bulanan" 
            : frequency === "monthly" 
              ? "Menampilkan proyeksi tahunan" 
              : "Menampilkan proyeksi per tahun"}
        </p>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-80 sm:h-96 md:h-96 w-full mt-1 sm:mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ 
                top: 5, 
                right: 0, 
                left: 0, 
                bottom: 10 
              }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme === 'dark' ? '#ffffff' : '#000000'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={theme === 'dark' ? '#ffffff' : '#000000'} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorModal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis 
                dataKey="period"
                label={{ 
                  value: frequency === "monthly" ? (isMobile ? "Bulan" : "Bulan") : (isMobile ? "Tahun" : "Tahun"), 
                  position: "insideBottomRight", 
                  offset: -5,
                  fontSize: isMobile ? 10 : 12
                }} 
                tick={{ fontSize: isMobile ? 9 : 11 }}
                tickFormatter={(value) => formatXAxisTick(value, frequency, isMobile)}
                interval={isMobile ? 'preserveStartEnd' : (showAllMonths ? (filteredData.length > 24 ? 2 : 1) : 0)}
                minTickGap={isMobile ? 20 : 10}
              />
              <YAxis 
                tickFormatter={(value) => isMobile ? 
                  new Intl.NumberFormat('id-ID', {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value) : 
                  formatToRupiah(value)
                }
                width={isMobile ? 40 : 80}
                tick={{ fontSize: isMobile ? 9 : 11 }}
                tickCount={isMobile ? 5 : 8}
              />
              <Tooltip content={<CustomTooltip frequency={frequency} isMobile={isMobile} />} />
              <Legend 
                formatter={(value) => {
                  const labels = {
                    "Total": "Total Investasi",
                    "Modal": "Modal Diinvestasikan",
                    "Return": "Return Diperoleh"
                  };
                  return isMobile ? value : (labels as any)[value] || value;
                }}
                iconSize={isMobile ? 8 : 10}
                wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }}
                align="center"
                verticalAlign="bottom"
              />
              <Area
                type="monotone"
                name="Total"
                dataKey="Total"
                stroke={theme === 'dark' ? "#ffffff" : "#000000"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTotal)"
                activeDot={{ r: isMobile ? 4 : 6 }}
                className={theme === 'dark' ? "stroke-white" : "stroke-black"}
              />
              <Area
                type="monotone"
                name="Modal"
                dataKey="Modal"
                stroke="#2563eb"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorModal)"
                activeDot={{ r: isMobile ? 4 : 6 }}
              />
              <Area
                type="monotone"
                name="Return"
                dataKey="Return"
                stroke="#16a34a"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReturn)"
                activeDot={{ r: isMobile ? 4 : 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chart;
