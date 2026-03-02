"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buildDividendCalendar } from "@/lib/dividend-calendar";
import { useDerivedMetrics } from "@/lib/use-derived-metrics";
import { useDFPStore } from "@/lib/store";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DashboardCalendarPage() {
  const [view, setView] = useState<"schedule" | "monthly" | "weekly">("schedule");
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const { enriched } = useDerivedMetrics();
  const goal = useDFPStore((s) => s.goal);
  const taxMultiplier = goal.taxEnabled ? 1 - Math.max(0, Math.min(100, goal.taxRate)) / 100 : 1;

  const calendarData = useMemo(
    () => buildDividendCalendar(enriched, taxMultiplier),
    [enriched, taxMultiplier],
  );
  const urgentBuys = calendarData.schedule.filter(
    (entry) => entry.daysUntilExDiv !== null && entry.daysUntilExDiv <= 5,
  );
  const monthlySeries = MONTH_LABELS.map((month, index) => ({
    month,
    amount: calendarData.monthlyTotals[index] ?? 0,
  }));
  const selectedWeekEntry =
    selectedWeek === null
      ? null
      : calendarData.weeklyCalendar.find((week) => week.weekNumber === selectedWeek) ?? null;

  if (enriched.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-bg-2 p-12 text-center">
        <div className="text-4xl">📅</div>
        <div className="mt-3 text-lg font-semibold text-textBright">No dividend schedule yet</div>
        <div className="mt-2 text-sm text-textDim">Add holdings in Portfolio to build a dividend calendar.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="text-xs text-textDim">Annual Total</div>
          <div className="mt-1 text-2xl font-semibold text-gold-light">${calendarData.annualTotal.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="text-xs text-textDim">Monthly Average</div>
          <div className="mt-1 text-2xl font-semibold text-teal-light">${calendarData.monthlyAverage.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="text-xs text-textDim">Weekly Average</div>
          <div className="mt-1 text-2xl font-semibold text-textBright">${calendarData.weeklyAverage.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="text-xs text-textDim">Tracked Holdings</div>
          <div className="mt-1 text-2xl font-semibold text-textBright">{calendarData.schedule.length}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["schedule", "monthly", "weekly"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setView(mode)}
            className={`rounded-lg px-3 py-2 text-sm ${
              view === mode ? "bg-gold text-bg" : "border border-border text-textDim"
            }`}
          >
            {mode === "schedule" ? "Schedule" : mode === "monthly" ? "Monthly" : "Weekly"}
          </button>
        ))}
      </div>

      {urgentBuys.length > 0 ? (
        <div
          data-testid="buy-by-alert"
          className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold-light"
        >
          <div className="font-semibold">Upcoming Ex-Dividend Dates</div>
          {urgentBuys.map((entry) => (
            <div key={entry.ticker} className="mt-1 text-xs">
              <span className="font-semibold text-textBright">{entry.ticker}</span> ex-div in{" "}
              <span className="font-semibold">{entry.daysUntilExDiv} days</span> - buy before{" "}
              {entry.buyByDate} to receive the next dividend
            </div>
          ))}
        </div>
      ) : null}

      {view === "schedule" ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-bg-2 p-4">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-textDim">
                <th className="px-3 py-2">Ticker</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Pay Freq</th>
                <th className="px-3 py-2 text-right">Per Period</th>
                <th className="px-3 py-2 text-right">Monthly</th>
                <th className="px-3 py-2 text-right">Annual</th>
                <th className="px-3 py-2">Next Ex-Div</th>
                <th className="px-3 py-2">Buy By</th>
                <th className="px-3 py-2 text-right">Days</th>
              </tr>
            </thead>
            <tbody>
              {calendarData.schedule.map((entry) => {
                const freqTone =
                  entry.payFreq === "weekly"
                    ? "bg-sky-500/10 text-sky-300"
                    : entry.payFreq === "monthly"
                      ? "bg-teal/10 text-teal-light"
                      : entry.payFreq === "quarterly"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-bg-1 text-textDim";
                const dayTone =
                  entry.daysUntilExDiv === null
                    ? "text-textDim"
                    : entry.daysUntilExDiv <= 3
                      ? "text-danger"
                      : entry.daysUntilExDiv <= 7
                        ? "text-gold-light"
                        : "text-textDim";

                return (
                  <tr
                    key={entry.ticker}
                    data-testid={`calendar-row-${entry.ticker}`}
                    className="border-b border-border/60"
                  >
                    <td className="px-3 py-3 font-semibold text-textBright">{entry.ticker}</td>
                    <td className="px-3 py-3 text-textDim">{entry.name}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs capitalize ${freqTone}`}>{entry.payFreq}</span>
                    </td>
                    <td className="px-3 py-3 text-right text-textBright">${entry.estimatedPerPeriod.toFixed(2)}</td>
                    <td className="px-3 py-3 text-right text-textBright">${entry.estimatedMonthly.toFixed(2)}</td>
                    <td className="px-3 py-3 text-right font-semibold text-gold-light">${entry.estimatedAnnual.toFixed(2)}</td>
                    <td className="px-3 py-3 text-textDim">{entry.nextExDivDate ?? "—"}</td>
                    <td className="px-3 py-3 font-medium text-gold-light">{entry.buyByDate ?? "—"}</td>
                    <td className={`px-3 py-3 text-right font-semibold ${dayTone}`}>
                      {entry.daysUntilExDiv !== null ? `${entry.daysUntilExDiv}d` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-bg-1 font-semibold">
                <td className="px-3 py-3 text-textBright" colSpan={3}>
                  Total
                </td>
                <td className="px-3 py-3 text-right text-textDim">${calendarData.weeklyAverage.toFixed(2)}/wk</td>
                <td className="px-3 py-3 text-right text-teal-light">${calendarData.monthlyAverage.toFixed(2)}/mo</td>
                <td className="px-3 py-3 text-right text-gold-light">${calendarData.annualTotal.toFixed(2)}/yr</td>
                <td className="px-3 py-3" colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      ) : null}

      {view === "monthly" ? (
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="mb-3 text-sm font-semibold text-textBright">Monthly Distribution Outlook</div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#223047" />
                <XAxis dataKey="month" stroke="#9db0d0" />
                <YAxis stroke="#9db0d0" />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Estimated"]}
                />
                <Bar dataKey="amount" fill="#00d4be" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {view === "weekly" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-bg-2 p-4">
          <div className="text-sm font-semibold text-textBright">Weekly Timeline</div>
          <div className="grid gap-2 md:grid-cols-4">
            {calendarData.weeklyCalendar.map((week) => {
              const active = selectedWeek === week.weekNumber;
              return (
                <button
                  key={week.weekNumber}
                  type="button"
                  onClick={() => setSelectedWeek(active ? null : week.weekNumber)}
                  className={`rounded-xl border p-3 text-left ${
                    active ? "border-gold bg-gold/10" : "border-border bg-bg-1"
                  }`}
                >
                  <div className="text-xs text-textDim">{week.weekLabel}</div>
                  <div className="mt-1 text-lg font-semibold text-teal-light">${week.totalAmount.toFixed(2)}</div>
                  <div className="mt-1 text-xs text-textDim">{week.holdings.length} payer(s)</div>
                </button>
              );
            })}
          </div>

          {selectedWeekEntry ? (
            <div className="rounded-xl border border-border bg-bg-1 p-4">
              <div className="text-sm font-semibold text-textBright">{selectedWeekEntry.weekLabel} details</div>
              <div className="mt-3 space-y-2">
                {selectedWeekEntry.holdings.map((holding) => (
                  <div key={`${selectedWeekEntry.weekNumber}-${holding.ticker}`} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold text-textBright">{holding.ticker}</span>
                      <span className="ml-2 text-textDim">{holding.name}</span>
                    </div>
                    <div className="text-teal-light">${holding.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
