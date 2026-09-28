// frontend/src/components/gn-officer/DonutChart.jsx
//
// Small dependency-free donut chart built from stacked SVG circle strokes.

import React from "react";

/**
 * @param {{label: string, value: number, color: string}[]} segments
 * @param {number} size - overall svg size in px
 * @param {number} strokeWidth
 * @param {string} centerLabel - small label under the total, e.g. "Total"
 */
const DonutChart = ({
  segments,
  size = 150,
  strokeWidth = 26,
  centerLabel = "Total",
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offsetAccum = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((s) => {
          const fraction = s.value / total;
          const dash = fraction * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offsetAccum}
              strokeLinecap="butt"
            />
          );
          offsetAccum += dash;
          return el;
        })}
      </g>
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        style={{ fontSize: "20px", fontWeight: 700, fill: "#1e293b" }}
      >
        {total}
      </text>
      <text
        x="50%"
        y="61%"
        textAnchor="middle"
        style={{ fontSize: "11px", fill: "#94a3b8" }}
      >
        {centerLabel}
      </text>
    </svg>
  );
};

export default DonutChart;
