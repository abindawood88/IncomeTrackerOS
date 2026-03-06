import type { ProjectionParams } from '../../types';

export type ProjectionValidationError = {
  field: keyof ProjectionParams;
  message: string;
};

const WARNINGS = {
  highYield: 'Yield above 15% is very high. Verify this assumption is realistic.',
  highCagr: 'Growth rate above 20% is aggressive. Consider a more conservative estimate.',
  unrealisticIncome: 'Target income appears very high relative to starting capital.',
};

export function validateProjectionInputs(params: Partial<ProjectionParams>): {
  errors: ProjectionValidationError[];
  warnings: string[];
} {
  const errors: ProjectionValidationError[] = [];
  const warnings: string[] = [];

  if ((params.capital ?? 0) < 0) errors.push({ field: 'capital', message: 'Starting capital cannot be negative.' });
  if ((params.monthly ?? 0) < 0) errors.push({ field: 'monthly', message: 'Monthly contribution cannot be negative.' });
  if (!params.years || params.years < 1 || params.years > 50) errors.push({ field: 'years', message: 'Years must be between 1 and 50.' });
  if ((params.yld ?? 0) < 0 || (params.yld ?? 0) > 1) errors.push({ field: 'yld', message: 'Yield must be between 0% and 100%.' });
  if ((params.cagr ?? 0) < -1 || (params.cagr ?? 0) > 1) errors.push({ field: 'cagr', message: 'Growth rate must be between -100% and 100%.' });

  if ((params.yld ?? 0) > 0.15) warnings.push(WARNINGS.highYield);
  if ((params.cagr ?? 0) > 0.2) warnings.push(WARNINGS.highCagr);

  return { errors, warnings };
}
