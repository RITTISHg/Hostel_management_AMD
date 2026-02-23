import React, { useState } from 'react';
import { AlertTriangle, Zap, CheckCircle, X, Clock } from 'lucide-react';
import type { Nudge } from '../../types';

interface Props {
    nudge: Nudge;
    index?: number;
}

const priorityIcon = {
    high: <AlertTriangle className="w-4 h-4" />,
    medium: <Zap className="w-4 h-4" />,
    low: <CheckCircle className="w-4 h-4" />,
};

export default function NudgeCard({ nudge, index = 0 }: Props) {
    const [dismissed, setDismissed] = useState(false);
    const [actioned, setActioned] = useState(false);

    if (dismissed) return null;

    return (
        <div
            className={`glass-card p-5 animate-slide-up relative overflow-hidden
        border-l-4 ${nudge.priority === 'high'
                    ? 'border-rag-red'
                    : nudge.priority === 'medium'
                        ? 'border-rag-amber'
                        : 'border-rag-green'
                }`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Top bar */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={`badge badge-${nudge.priority}`}>
                        {priorityIcon[nudge.priority]}
                        <span className="ml-1 capitalize">{nudge.priority}</span>
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {nudge.timestamp}
                    </span>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-dark-hover text-gray-400 transition-colors"
                    aria-label="Dismiss nudge"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Problem */}
            <div className="mb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    Problem
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {nudge.problem}
                </p>
            </div>

            {/* Impact */}
            <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    Impact
                </p>
                <p className="text-sm text-rag-red font-semibold">
                    {nudge.impact}
                </p>
            </div>

            {/* Action */}
            <div className="flex items-center gap-2">
                {actioned ? (
                    <div className="flex items-center gap-2 text-rag-green text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Action sent successfully
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => setActioned(true)}
                            className="btn-primary text-xs"
                        >
                            {nudge.action}
                        </button>
                        <button
                            onClick={() => setDismissed(true)}
                            className="btn-ghost text-xs"
                        >
                            Snooze
                        </button>
                    </>
                )}
            </div>

            {/* Zone label */}
            <div className="absolute top-5 right-5 text-[10px] text-gray-400 font-medium">
                {nudge.zone}
            </div>
        </div>
    );
}
