import { create } from 'zustand';

interface PlanState {
  planDetails: any;
  setPlanDetails: (details: any) => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  planDetails: null,
  setPlanDetails: (details) => set({ planDetails: details }),
}));
