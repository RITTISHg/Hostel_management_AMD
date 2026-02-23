import React, { useEffect, useState } from 'react';

interface Props {
    value: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
    className?: string;
    duration?: number;
}

export default function StatNumber({
    value,
    suffix = '',
    prefix = '',
    decimals = 0,
    className = '',
    duration = 1000,
}: Props) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = value / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setDisplay(value);
                clearInterval(timer);
            } else {
                setDisplay(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [value, duration]);

    const formatted = display.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return (
        <span className={`font-mono font-bold tabular-nums ${className}`}>
            {prefix}{formatted}{suffix}
        </span>
    );
}
