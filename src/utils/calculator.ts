  // Types
export type FrequencyType = "monthly" | "yearly";
export type TimingType = "start" | "end";

export interface InvestmentInput {
  targetAmount: number | string;
  timeHorizon: number | string;
  initialInvestment: number | string;
  frequency: FrequencyType;
  periodicInvestment: number | string;
  investmentTiming: TimingType;
  annualReturn: number | string;
  
  // Advanced options
  inflation?: number | string;
  taxRate?: number | string;
}

export interface MonthlyBreakdown {
  month: number;
  totalValue: number;
  investmentValue: number;
  returnValue: number;
}

export interface InvestmentResult {
  initialInvestment: number;
  periodicInvestment: number;
  interestRate?: number;
  timeHorizon: number;
  finalValue: number;
  totalInvestment: number;
  totalReturn: number;
  monthlyBreakdown: MonthlyBreakdown[];
  
  // Target properties
  targetAmount?: number;
  targetMet?: boolean;
  shortfall?: number;
  surplus?: number;
  
  // Required adjustments
  requiredPeriodicInvestment?: number;
  requiredTimeHorizon?: number;
  
  // Tax information
  taxRate?: number;
  taxAmount?: number;
  afterTaxReturn?: number;
  afterTaxFinalValue?: number;
}

// Helper function to calculate monthly/yearly interest rate
const getPeriodicRate = (annualRate: number, frequency: FrequencyType): number => {
  if (frequency === "monthly") {
    return annualRate / 100 / 12;
  }
  return annualRate / 100;
};

// Calculate investment growth with periodic contributions
export const calculateInvestment = (input: InvestmentInput): InvestmentResult => {
  const {
    targetAmount,
    timeHorizon,
    initialInvestment,
    frequency,
    periodicInvestment,
    investmentTiming,
    annualReturn,
    taxRate = 0,
  } = input;

  // Convert inputs to numbers
  const targetAmountNum = typeof targetAmount === 'string' ? Number(targetAmount) || 0 : targetAmount;
  const timeHorizonNum = typeof timeHorizon === 'string' ? Number(timeHorizon) || 0 : timeHorizon;
  const initialInvestmentNum = typeof initialInvestment === 'string' ? Number(initialInvestment) || 0 : initialInvestment;
  const periodicInvestmentNum = typeof periodicInvestment === 'string' ? Number(periodicInvestment) || 0 : periodicInvestment;
  const annualReturnNum = typeof annualReturn === 'string' ? Number(annualReturn) || 0 : annualReturn;
  const taxRateNum = typeof taxRate === 'string' ? Number(taxRate) || 0 : taxRate;

  const periodicRate = getPeriodicRate(annualReturnNum, frequency);
  const periods = frequency === "monthly" ? timeHorizonNum * 12 : timeHorizonNum;
  
  let totalValue = initialInvestmentNum;
  let totalInvested = initialInvestmentNum;
  let monthlyBreakdown: MonthlyBreakdown[] = [];
  
  // Beginning of period or end of period calculation
  for (let i = 1; i <= periods; i++) {
    if (investmentTiming === "start") {
      totalInvested += periodicInvestmentNum;
      totalValue = (totalValue + periodicInvestmentNum) * (1 + periodicRate);
    } else {
      totalValue = totalValue * (1 + periodicRate);
      totalInvested += periodicInvestmentNum;
      totalValue += periodicInvestmentNum;
    }
    
    monthlyBreakdown.push({
      month: i,
      totalValue: Math.round(totalValue),
      investmentValue: Math.round(totalInvested),
      returnValue: Math.round(totalValue - totalInvested)
    });
  }
  
  const finalAmount = totalValue;
  const totalReturn = finalAmount - totalInvested;
  
  // Calculate tax on investment returns
  const taxAmount = totalReturn * (taxRateNum / 100);
  const afterTaxReturn = totalReturn - taxAmount;
  const afterTaxFinalValue = totalInvested + afterTaxReturn;
  
  const targetMet = targetAmountNum ? afterTaxFinalValue >= targetAmountNum : true;
  const shortfall = targetMet ? 0 : (targetAmountNum ? targetAmountNum - afterTaxFinalValue : 0);
  const surplus = targetMet ? (targetAmountNum ? afterTaxFinalValue - targetAmountNum : 0) : 0;
  
  // Calculate required adjustment for alternative scenarios
  let requiredPeriodicInvestment;
  let requiredTimeHorizon;
  
  // Calculate required periodic investment to reach target
  if (targetAmountNum && !targetMet) {
    // Account for tax in the required investment calculation
    // We need to achieve a higher pre-tax return to reach the same after-tax target
    const taxMultiplier = 1 - (taxRateNum / 100);
    const taxAdjustedTarget = targetAmountNum / taxMultiplier;
    
    if (frequency === "monthly") {
      const r = annualReturnNum / 100 / 12;
      const n = periods;
      const growthFactor = Math.pow(1 + r, n);
      const fv = taxAdjustedTarget;
      const pv = initialInvestmentNum;
      
      if (investmentTiming === "end") {
        requiredPeriodicInvestment = (fv - pv * growthFactor) / ((growthFactor - 1) / r);
      } else {
        requiredPeriodicInvestment = (fv / growthFactor - pv) / ((growthFactor - 1) / r / (1 + r));
      }
    } else {
      const r = annualReturnNum / 100;
      const n = periods;
      const growthFactor = Math.pow(1 + r, n);
      const fv = taxAdjustedTarget;
      const pv = initialInvestmentNum;
      
      if (investmentTiming === "end") {
        requiredPeriodicInvestment = (fv - pv * growthFactor) / ((growthFactor - 1) / r);
      } else {
        requiredPeriodicInvestment = (fv / growthFactor - pv) / ((growthFactor - 1) / r / (1 + r));
      }
    }
    
    // Calculate required time horizon to reach target with current contribution
    // This is complex to solve exactly, we'll use a simple estimation
    let estimatedPeriods = periods;
    let estimatedAmount = finalAmount;
    const taxAdjustedEstimatedAmount = totalInvested + (estimatedAmount - totalInvested) * (1 - taxRateNum / 100);
    
    while (taxAdjustedEstimatedAmount < targetAmountNum && estimatedPeriods < 1200) { // Max 100 years
      estimatedPeriods++;
      if (investmentTiming === "start") {
        estimatedAmount = (estimatedAmount + periodicInvestmentNum) * (1 + periodicRate);
      } else {
        estimatedAmount = estimatedAmount * (1 + periodicRate) + periodicInvestmentNum;
      }
      const estimatedReturn = estimatedAmount - (totalInvested + (estimatedPeriods - periods) * periodicInvestmentNum);
      const estimatedTaxAmount = estimatedReturn * (taxRateNum / 100);
      const taxAdjustedEstimatedAmount = estimatedAmount - estimatedTaxAmount;
      
      if (taxAdjustedEstimatedAmount >= targetAmountNum) {
        break;
      }
    }
    
    requiredTimeHorizon = frequency === "monthly" ? estimatedPeriods / 12 : estimatedPeriods;
  }
  
  return {
    initialInvestment: initialInvestmentNum,
    periodicInvestment: periodicInvestmentNum,
    interestRate: annualReturnNum,
    timeHorizon: timeHorizonNum,
    finalValue: finalAmount,
    totalInvestment: totalInvested,
    totalReturn,
    monthlyBreakdown,
    
    // Target properties
    targetAmount: targetAmountNum,
    targetMet,
    shortfall,
    surplus,
    
    // Adjustments if target not met
    requiredPeriodicInvestment: requiredPeriodicInvestment ? Math.ceil(requiredPeriodicInvestment) : undefined,
    requiredTimeHorizon: requiredTimeHorizon ? Number(requiredTimeHorizon.toFixed(1)) : undefined,
    
    // Tax information
    taxRate: taxRateNum,
    taxAmount: Math.round(taxAmount),
    afterTaxReturn: Math.round(afterTaxReturn),
    afterTaxFinalValue: Math.round(afterTaxFinalValue)
  };
};

// Format number to currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format number with comma separator for readability
export const formatNumber = (value: number | string): string => {
  if (typeof value === 'string') {
    if (!value) return '';
    value = Number(value);
  }
  return new Intl.NumberFormat('id-ID').format(value);
};

// Parse formatted number string back to number
export const parseFormattedNumber = (formattedValue: string): number => {
  // Remove all non-numeric characters except decimal point
  const numericValue = formattedValue.replace(/[^\d.-]/g, '');
  return Number(numericValue) || 0;
};

// Format number to percentage
export const formatPercentage = (value: number): string => {
  return `${value}%`;
};

export const formatInvestmentPeriod = (months: number): string => {
  if (months < 12) {
    return `${months} bulan`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} tahun`;
    } else {
      return `${years} tahun ${remainingMonths} bulan`;
    }
  }
};
