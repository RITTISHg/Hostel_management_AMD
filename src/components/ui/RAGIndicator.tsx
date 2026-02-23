import React from 'react';
import type { RAGStatus } from '../../types';

interface Props {
    status: RAGStatus;
    size?: 'sm' | 'md' | 'lg';
    label?: string;
}

const sizeMap = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
};

export default function RAGIndicator({ status, size = 'md', label }: Props) {
    const colorMap: Record<RAGStatus, string> = {
        green: 'bg-rag-green shadow-rag-green/50',
        amber: 'bg-rag-amber shadow-rag-amber/50',
        red: 'bg-rag-red shadow-rag-red/50',
    };

    return (
        <span
            className={`inline-block rounded-full ${sizeMap[size]} ${colorMap[status]} shadow-md`}
            role="status"
            aria-label={label ?? `Status: ${status}`}
        />
    );
}

export function getRAGStatus(current: number, baseline: number): RAGStatus {
    const ratio = current / baseline;
    if (ratio <= 1) return 'green';
    if (ratio <= 1.2) return 'amber';
    return 'red';
}
