'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AuditResult,
  EvaluateResult,
  MemoryRegistrationResult,
  QueryMemoriesResult,
} from '@snd-guard/shared';
import { DEFAULT_AGENT } from '@/lib/utils';

interface DemoState {
  agent: string;
  safeMemoryId: string | null;
  poisonMemoryId: string | null;
  safeResult: MemoryRegistrationResult | null;
  poisonResult: MemoryRegistrationResult | null;
  queryResult: QueryMemoriesResult | null;
  evaluateResult: EvaluateResult | null;
  auditResult: AuditResult | null;
  snapshotId: string | null;
  restoreResult: Record<string, unknown> | null;
  step: number;
  setStep: (n: number) => void;
  setSafe: (r: MemoryRegistrationResult) => void;
  setPoison: (r: MemoryRegistrationResult) => void;
  setQuery: (r: QueryMemoriesResult) => void;
  setEvaluate: (r: EvaluateResult) => void;
  setAudit: (r: AuditResult) => void;
  setSnapshot: (id: string) => void;
  setRestore: (r: Record<string, unknown>) => void;
  reset: () => void;
}

const DemoContext = createContext<DemoState | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(0);
  const [safeResult, setSafeResult] = useState<MemoryRegistrationResult | null>(null);
  const [poisonResult, setPoisonResult] = useState<MemoryRegistrationResult | null>(null);
  const [queryResult, setQueryResult] = useState<QueryMemoriesResult | null>(null);
  const [evaluateResult, setEvaluateResult] = useState<EvaluateResult | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  const [restoreResult, setRestoreResult] = useState<Record<string, unknown> | null>(null);

  const reset = useCallback(() => {
    setStep(0);
    setSafeResult(null);
    setPoisonResult(null);
    setQueryResult(null);
    setEvaluateResult(null);
    setAuditResult(null);
    setSnapshotId(null);
    setRestoreResult(null);
  }, []);

  const value = useMemo<DemoState>(
    () => ({
      agent: DEFAULT_AGENT,
      safeMemoryId: safeResult?.memoryId ?? null,
      poisonMemoryId: poisonResult?.memoryId ?? null,
      safeResult,
      poisonResult,
      queryResult,
      evaluateResult,
      auditResult,
      snapshotId,
      restoreResult,
      step,
      setStep,
      setSafe: setSafeResult,
      setPoison: setPoisonResult,
      setQuery: setQueryResult,
      setEvaluate: setEvaluateResult,
      setAudit: setAuditResult,
      setSnapshot: setSnapshotId,
      setRestore: setRestoreResult,
      reset,
    }),
    [
      safeResult,
      poisonResult,
      queryResult,
      evaluateResult,
      auditResult,
      snapshotId,
      restoreResult,
      step,
      reset,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}
