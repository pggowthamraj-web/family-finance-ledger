'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { Goal, Member } from '@/lib/finance/types';
import { goalProgress, monthsToComplete } from '@/lib/finance/goals';
import { Card } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageHeader } from '@/components/PageHeader';

export function GoalsClient({ goals, members }: { goals: Goal[]; members: Member[] }) {
  const ownerName = (id: string | null) => (id === 'shared' || !id ? 'Shared' : members.find((m) => m.id === id)?.name ?? 'Shared');

  return (
    <div>
      <PageHeader title="Goals" />
      <div className="space-y-3">
        {goals.map((g) => (
          <GoalCard key={g.id} goal={g} ownerName={ownerName(g.owner_id)} />
        ))}
        {goals.length === 0 && <p className="text-sm text-teal-900/50">No goals yet.</p>}
      </div>
      <Link
        href="/goals/new"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-teal-900/20 py-3 text-sm font-medium text-teal-900/60"
      >
        <Plus size={16} /> Add goal
      </Link>
    </div>
  );
}

function GoalCard({ goal, ownerName }: { goal: Goal; ownerName: string }) {
  const [scenario, setScenario] = useState(goal.monthly_contribution || 0);
  const [expanded, setExpanded] = useState(false);
  const progress = goalProgress(goal);
  const scenarioMonths = monthsToComplete(progress.remaining, scenario);

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-teal-900">{goal.name}</p>
          <p className="text-xs text-teal-900/50">
            {ownerName}
            {goal.target_date ? ` · target ${goal.target_date}` : ''}
          </p>
        </div>
        {goal.priority && <Badge tone={goal.priority === 'High' ? 'amber' : 'neutral'}>{goal.priority}</Badge>}
      </div>

      <div className="mt-3">
        <ProgressBar percent={progress.percent} tone="amber" />
        <div className="mt-1 flex justify-between text-xs text-teal-900/50">
          <span>
            <Money amount={goal.current_amount} currency={goal.currency} compact /> of{' '}
            <Money amount={goal.target_amount} currency={goal.currency} compact />
          </span>
          <span>{progress.percent.toFixed(0)}%</span>
        </div>
      </div>

      {goal.description && <p className="mt-2 text-xs text-teal-900/60">{goal.description}</p>}
      {goal.notes && <p className="mt-2 text-xs text-teal-900/40">{goal.notes}</p>}

      <div className="mt-3 flex gap-3 text-xs">
        <button onClick={() => setExpanded((e) => !e)} className="font-medium text-teal-700">
          {expanded ? 'Hide' : 'Scenario planner'}
        </button>
        <Link href={`/goals/${goal.id}/edit`} className="font-medium text-teal-700">
          Edit
        </Link>
      </div>

      {expanded && (
        <div className="mt-3 rounded-xl bg-teal-900/[0.04] p-3">
          <p className="mb-2 text-xs font-medium text-teal-900/70">
            If you contributed <Money amount={scenario} currency={goal.currency} compact /> / month:
          </p>
          <input
            type="range"
            min={0}
            max={Math.max(goal.monthly_contribution * 3, progress.remaining / 6, 100)}
            step={10}
            value={scenario}
            onChange={(e) => setScenario(Number(e.target.value))}
            className="w-full"
          />
          <p className="mt-2 text-sm text-teal-900">
            {scenarioMonths === null
              ? 'Enter a monthly amount above zero.'
              : scenarioMonths === 0
              ? 'Goal already reached!'
              : `Done in ${scenarioMonths} month${scenarioMonths === 1 ? '' : 's'}`}
          </p>
        </div>
      )}
    </Card>
  );
}
