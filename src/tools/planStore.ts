import { randomUUID } from 'node:crypto';

export interface AdminChange {
  action: 'create' | 'update' | 'archive';
  resource: string;
  propertyId: string;
  payload?: Record<string, unknown>;
}

export interface AdminPlan {
  planId: string;
  createdAt: string;
  changes: AdminChange[];
  status: 'pending' | 'confirmed' | 'expired';
}

/** In-memory plan store. Will be replaced by Supabase Postgres persistence. */
export class PlanStore {
  private plans = new Map<string, AdminPlan>();

  create(changes: AdminChange[]): AdminPlan {
    const plan: AdminPlan = {
      planId: `plan_${randomUUID()}`,
      createdAt: new Date().toISOString(),
      changes,
      status: 'pending'
    };
    this.plans.set(plan.planId, plan);
    return plan;
  }

  get(planId: string): AdminPlan | undefined {
    return this.plans.get(planId);
  }

  confirm(planId: string): AdminPlan | undefined {
    const plan = this.plans.get(planId);
    if (!plan) return undefined;
    plan.status = 'confirmed';
    return plan;
  }
}
