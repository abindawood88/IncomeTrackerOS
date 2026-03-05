"use client";

import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import KPIGrid from "@/components/dashboard/KPIGrid";
import MilestoneStack from "@/components/dashboard/MilestoneStack";
import FreedomScoreCard from "@/components/dashboard/FreedomScoreCard";
import AICommentaryBubble from "@/components/dashboard/AICommentaryBubble";
import ProjectionChart from "@/components/charts/ProjectionChart";
import ProgressBar from "@/components/ui/ProgressBar";
import { computeExpenseCoverage, coveredGoalCount, totalExpenses } from "@/lib/expense-coverage";
import { useDerivedMetrics } from "@/lib/use-derived-metrics";
import { useDFPStore } from "@/lib/store";

type CoverageRow = ReturnType<typeof computeExpenseCoverage>[number];

function SortableExpenseRow({
  row,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  row: CoverageRow;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (name: string, amountMonthly: number, enabledForGoal: boolean) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: row.goal.id,
  });
  const [draftName, setDraftName] = useState(row.goal.name);
  const [draftAmountMonthly, setDraftAmountMonthly] = useState(row.goal.amountMonthly);
  const [draftEnabledForGoal, setDraftEnabledForGoal] = useState(row.goal.enabledForGoal);

  const badgeTone =
    row.pct === 100 ? "text-teal-light" : row.pct > 0 ? "text-gold-light" : "text-danger";

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border border-border bg-bg-1 p-3 ${
        transform || transition ? "transition-transform duration-200" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label="Reorder expense"
          className="mt-1 text-textDim"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          {isEditing ? (
            <div className="grid gap-2">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm text-textBright"
              />
              <input
                type="number"
                min={0}
                value={draftAmountMonthly}
                onChange={(e) => setDraftAmountMonthly(Math.max(0, Number(e.target.value) || 0))}
                className="rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm text-textBright"
              />
              <label className="flex items-center gap-2 text-xs text-textDim">
                <input
                  type="checkbox"
                  checked={draftEnabledForGoal}
                  onChange={(e) => setDraftEnabledForGoal(e.target.checked)}
                />
                Include in expenses-based goal
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-semibold text-textBright">{row.goal.name}</div>
                <div className="text-xs text-textDim">${Math.round(row.goal.amountMonthly).toLocaleString()} / month {row.goal.enabledForGoal ? "" : "• excluded"}</div>
              </div>
              <div className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeTone}`}>
                {row.pct}%
              </div>
            </div>
          )}

          <ProgressBar value={row.pct} color="teal" />

          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="text-textDim">
              ${Math.round(row.covered).toLocaleString()} covered
              {row.uncovered > 0 ? ` • ${Math.round(row.uncovered).toLocaleString()} uncovered` : ""}
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => onSave(draftName, draftAmountMonthly, draftEnabledForGoal)}
                    className="rounded-lg border border-border px-2 py-1 text-textBright"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-border px-2 py-1 text-textDim"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onEdit}
                    className="rounded-lg border border-border px-2 py-1 text-textDim"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="rounded-lg border border-danger/40 px-2 py-1 text-danger"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const metrics = useDerivedMetrics();
  const strategy = useDFPStore((s) => s.goal.strategy);
  const goal = useDFPStore((s) => s.goal);
  const setGoal = useDFPStore((s) => s.setGoal);
  const years = useDFPStore((s) => s.goal.years);
  const expenseGoals = useDFPStore((s) => s.expenseGoals);
  const addExpenseGoal = useDFPStore((s) => s.addExpenseGoal);
  const updateExpenseGoal = useDFPStore((s) => s.updateExpenseGoal);
  const removeExpenseGoal = useDFPStore((s) => s.removeExpenseGoal);
  const reorderExpenseGoals = useDFPStore((s) => s.reorderExpenseGoals);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAmount, setNewAmount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const coverageRows = useMemo(
    () => computeExpenseCoverage(metrics.monthlyIncome, expenseGoals),
    [metrics.monthlyIncome, expenseGoals],
  );

  const summary = useMemo(() => {
    const total = totalExpenses(expenseGoals);
    const covered = coverageRows.reduce((sum, row) => sum + row.covered, 0);
    const count = coveredGoalCount(coverageRows);
    return { total, covered, count };
  }, [coverageRows, expenseGoals]);

  const rightPanelMilestones = useMemo(() => {
    if (coverageRows.length === 0) return metrics.milestones;
    return coverageRows.slice(0, 4).map((row, index) => ({
      id: row.goal.id,
      label: row.goal.name || `Expense ${index + 1}`,
      target: row.goal.amountMonthly,
      icon: index === 0 ? "🚗" : index === 1 ? "🏠" : index === 2 ? "📱" : "💳",
      pct: row.pct,
      reached: row.fullyMet,
    }));
  }, [coverageRows, metrics.milestones]);

  function handleAddExpense(): void {
    if (!newLabel.trim() || newAmount <= 0 || expenseGoals.length >= 20) return;
    addExpenseGoal(newLabel, newAmount);
    setNewLabel("");
    setNewAmount(0);
    setShowAdd(false);
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = expenseGoals.findIndex((goal) => goal.id === active.id);
    const newIndex = expenseGoals.findIndex((goal) => goal.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(expenseGoals, oldIndex, newIndex);
    reorderExpenseGoals(reordered.map((goal) => goal.id));
  }

  return (
    <div className="space-y-4">
      <FreedomScoreCard
        score={metrics.score}
        freedomYear={metrics.freedomYr}
        targetMonthly={metrics.targetMonthly}
        monthlyIncome={metrics.monthlyIncome}
      />

      <AICommentaryBubble />

      <KPIGrid
        monthlyIncome={metrics.monthlyIncome}
        coverage={metrics.coverage}
        totalVal={metrics.totalVal}
        score={metrics.score}
        strategy={strategy}
        bCagr={metrics.bCagr}
        bYield={metrics.bYield}
        freedomYr={metrics.freedomYr}
        years={years}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProjectionChart
            projData={metrics.projData}
            target={metrics.targetMonthly}
            color="#00d4be"
          />
        </div>
        <div className="space-y-4">
          <MilestoneStack milestones={rightPanelMilestones} />

          <div className="rounded-2xl border border-border bg-bg-2 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-textBright">Expense Coverage</h2>
                <div className="text-xs text-textDim">Prioritize the bills you want dividends to cover first.</div>
              </div>
              <button
                data-testid="add-expense-toggle"
                type="button"
                onClick={() => setShowAdd((open) => !open)}
                disabled={expenseGoals.length >= 20}
                className="rounded-lg bg-gold px-3 py-2 text-xs font-semibold text-bg disabled:opacity-50"
              >
                + Add Expense
              </button>
            </div>

            <div className="mt-3 grid gap-2 rounded-xl border border-border bg-bg-1 p-3 text-sm">
              <label className="text-textDim">
                Goal mode
                <select
                  value={goal.goalMode}
                  onChange={(e) => setGoal({ goalMode: e.target.value as "manual" | "expenses" })}
                  className="mt-1 w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-textBright"
                >
                  <option value="manual">Manual target income</option>
                  <option value="expenses">Expenses coverage target</option>
                </select>
              </label>
              {goal.goalMode === "expenses" ? (
                <div className="grid gap-2 md:grid-cols-2">
                  <label className="text-textDim">
                    Coverage %
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={goal.coveragePct}
                      onChange={(e) => setGoal({ coveragePct: Number(e.target.value) })}
                      className="mt-1 w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-textBright"
                    />
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-textDim">
                      <input
                        type="checkbox"
                        checked={goal.taxEnabled}
                        onChange={(e) => setGoal({ taxEnabled: e.target.checked })}
                      />
                      Gross-up for taxes
                    </label>
                    {goal.taxEnabled ? (
                      <label className="text-textDim">
                        Tax rate %
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={goal.taxRate}
                          onChange={(e) => setGoal({ taxRate: Number(e.target.value) })}
                          className="mt-1 w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-textBright"
                        />
                      </label>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div className="text-xs text-textDim">Effective target: ${Math.round(metrics.targetMonthly).toLocaleString()} / month</div>
            </div>

            {showAdd ? (
              <div className="mt-3 grid gap-2">
                <input
                  data-testid="expense-label-input"
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Car Payment"
                  className="rounded-lg border border-border bg-bg-1 px-3 py-2 text-sm text-textBright"
                />
                <input
                  data-testid="expense-amount-input"
                  type="number"
                  min={0}
                  value={newAmount}
                  onChange={(e) => setNewAmount(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="rounded-lg border border-border bg-bg-1 px-3 py-2 text-sm text-textBright"
                />
                <div className="flex gap-2">
                  <button
                    data-testid="expense-add-btn"
                    type="button"
                    onClick={handleAddExpense}
                    className="rounded-lg bg-gold px-3 py-2 text-xs font-semibold text-bg"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="rounded-lg border border-border px-3 py-2 text-xs text-textDim"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              {coverageRows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-bg-1 px-4 py-3 text-sm text-textDim">
                  No expense goals yet.
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={expenseGoals.map((goal) => goal.id)} strategy={verticalListSortingStrategy}>
                    {coverageRows.map((row) => (
                      <SortableExpenseRow
                        key={row.goal.id}
                        row={row}
                        isEditing={editingId === row.goal.id}
                        onEdit={() => setEditingId(row.goal.id)}
                        onCancel={() => setEditingId(null)}
                        onSave={(label, amount, enabledForGoal) => {
                          updateExpenseGoal(row.goal.id, { name: label, amountMonthly: amount, enabledForGoal });
                          setEditingId(null);
                        }}
                        onDelete={() => {
                          const ok = window.confirm(`Remove "${row.goal.name}" from expense coverage?`);
                          if (!ok) return;
                          removeExpenseGoal(row.goal.id);
                        }}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>

            <div
              className={`mt-4 rounded-xl px-3 py-2 text-sm ${
                summary.count === 0
                  ? "bg-danger/10 text-danger"
                  : summary.count === expenseGoals.length && expenseGoals.length > 0
                    ? "bg-teal/10 text-teal-light"
                    : "bg-gold/10 text-gold-light"
              }`}
            >
              Dividends cover {summary.count} of {expenseGoals.length} expenses - $
              {Math.round(summary.covered).toLocaleString()} of ${Math.round(summary.total).toLocaleString()} per month
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {metrics.paydayData.map((week) => (
          <div key={week.label} className="rounded-xl border border-border bg-bg-2 p-3">
            <div className="text-xs text-textDim">{week.label}</div>
            <div className="mt-1 text-lg text-teal-light">${week.amount.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
