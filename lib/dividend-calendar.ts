import type {
  DividendCalendarData,
  DividendCalendarWeek,
  DividendScheduleEntry,
  EnrichedHolding,
  PayFrequency,
} from "./types";
import { roundTo } from "./utils";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const WEEK_LABELS = Array.from({ length: 52 }, (_, index) => {
  const month = Math.floor(index / 4.33);
  const weekInMonth = (index % 4) + 1;
  return `${MONTH_LABELS[Math.min(month, 11)]} W${weekInMonth}`;
});

function getPayWeeks(payFreq: PayFrequency): number[] {
  switch (payFreq) {
    case "weekly":
      return Array.from({ length: 52 }, (_, i) => i + 1);
    case "monthly":
      return [3, 7, 11, 16, 20, 24, 29, 33, 37, 42, 46, 50];
    case "quarterly":
      return [11, 24, 37, 50];
    case "annual":
    default:
      return [50];
  }
}

function getPayMonths(payFreq: PayFrequency): number[] {
  switch (payFreq) {
    case "weekly":
    case "monthly":
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    case "quarterly":
      return [2, 5, 8, 11];
    case "annual":
    default:
      return [11];
  }
}

function estimateNextExDivDate(payFreq: PayFrequency, now: Date): string | null {
  const d = new Date(now);
  switch (payFreq) {
    case "weekly": {
      const daysToFriday = (5 - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + daysToFriday);
      return d.toISOString().split("T")[0];
    }
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      d.setDate(15);
      return d.toISOString().split("T")[0];
    case "quarterly": {
      const quarterMonths = [2, 5, 8, 11];
      const currentMonth = d.getMonth();
      const nextQtr = quarterMonths.find((month) => month > currentMonth) ?? quarterMonths[0];
      const year = nextQtr <= currentMonth ? d.getFullYear() + 1 : d.getFullYear();
      return `${year}-${String(nextQtr + 1).padStart(2, "0")}-15`;
    }
    case "annual":
    default:
      return null;
  }
}

export function buildDividendCalendar(
  holdings: EnrichedHolding[],
  taxMultiplier = 1,
): DividendCalendarData {
  const now = new Date();

  const schedule: DividendScheduleEntry[] = holdings.map((holding) => {
    const estimatedAnnual = roundTo(holding.value * holding.yld * taxMultiplier, 2);
    const estimatedMonthly = roundTo(estimatedAnnual / 12, 2);
    const estimatedWeekly = roundTo(estimatedAnnual / 52, 2);
    const eventsPerYear =
      holding.payFreq === "weekly"
        ? 52
        : holding.payFreq === "monthly"
          ? 12
          : holding.payFreq === "quarterly"
            ? 4
            : 1;
    const estimatedPerPeriod = roundTo(estimatedAnnual / eventsPerYear, 2);
    const nextExDivDate = estimateNextExDivDate(holding.payFreq, now);
    const daysUntilExDiv = nextExDivDate
      ? Math.ceil((new Date(nextExDivDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const payWeeks = getPayWeeks(holding.payFreq);
    const payMonths = getPayMonths(holding.payFreq);

    return {
      ticker: holding.ticker,
      name: holding.name,
      payFreq: holding.payFreq,
      estimatedAnnual,
      estimatedMonthly,
      estimatedWeekly,
      estimatedPerPeriod,
      nextExDivDate,
      nextPayDate: nextExDivDate,
      daysUntilExDiv,
      buyByDate: nextExDivDate,
      weekBucket: payWeeks[0],
      monthBucket: payMonths[0],
    };
  });

  const weeklyCalendar: DividendCalendarWeek[] = Array.from({ length: 52 }, (_, index) => ({
    weekNumber: index + 1,
    weekLabel: WEEK_LABELS[index],
    totalAmount: 0,
    holdings: [],
  }));

  for (const holding of holdings) {
    const entry = schedule.find((item) => item.ticker === holding.ticker);
    if (!entry || entry.estimatedAnnual <= 0) continue;
    const payWeeks = getPayWeeks(holding.payFreq);
    const amountPerEvent = entry.estimatedAnnual / payWeeks.length;
    for (const week of payWeeks) {
      const idx = week - 1;
      weeklyCalendar[idx].totalAmount = roundTo(weeklyCalendar[idx].totalAmount + amountPerEvent, 2);
      weeklyCalendar[idx].holdings.push({
        ticker: holding.ticker,
        name: holding.name,
        amount: roundTo(amountPerEvent, 2),
        payFreq: holding.payFreq,
      });
    }
  }

  const monthlyTotals = Array(12).fill(0) as number[];
  for (const entry of schedule) {
    const payMonths = getPayMonths(entry.payFreq);
    const amountPerMonth = entry.estimatedAnnual / payMonths.length;
    for (const month of payMonths) {
      monthlyTotals[month] = roundTo(monthlyTotals[month] + amountPerMonth, 2);
    }
  }

  const annualTotal = roundTo(schedule.reduce((sum, entry) => sum + entry.estimatedAnnual, 0), 2);

  return {
    schedule,
    weeklyCalendar: weeklyCalendar.filter((week) => week.totalAmount > 0 || week.weekNumber % 4 === 0),
    monthlyTotals,
    annualTotal,
    weeklyAverage: roundTo(annualTotal / 52, 2),
    monthlyAverage: roundTo(annualTotal / 12, 2),
  };
}
