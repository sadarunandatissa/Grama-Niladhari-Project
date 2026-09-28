// frontend/src/components/gn-officer/BarChart.jsx
//
// Small dependency-free bar chart. Renders bars with plain divs sized by
// percentage height so nothing extra needs installing.

import React from "react";
import "./BarChart.css";

/**
 * @param {string[]} labels - x-axis labels (e.g. months)
 * @param {{name: string, color: string, data: number[]}[]} series
 * @param {number} height - plot height in px
 */
const BarChart = ({ labels, series, height = 200 }) => {
  const maxValue = Math.max(1, ...series.flatMap((s) => s.data));
  // round the axis ceiling up to a nice-ish number
  const axisMax = Math.ceil(maxValue / 5) * 5 || 5;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="bar-chart" style={{ height }}>
      <div className="bar-chart-y-axis">
        {gridLines
          .slice()
          .reverse()
          .map((g) => (
            <span key={g}>{Math.round(axisMax * g)}</span>
          ))}
      </div>
      <div className="bar-chart-plot">
        {gridLines.map((g) => (
          <div
            key={g}
            className="bar-chart-gridline"
            style={{ bottom: `${g * 100}%` }}
          />
        ))}
        {labels.map((label, i) => (
          <div className="bar-group" key={label}>
            <div className="bar-group-bars">
              {series.map((s) => {
                const value = s.data[i] || 0;
                const barHeightPct = (value / axisMax) * 100;
                return (
                  <div
                    className="bar-wrapper"
                    key={s.name}
                    title={`${s.name}: ${value}`}
                  >
                    <div
                      className="bar"
                      style={{
                        height: `${barHeightPct}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <span className="bar-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
