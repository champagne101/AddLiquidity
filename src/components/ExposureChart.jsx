/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { calculateExposureOverRange } from '../utils/calculations';

// eslint-disable-next-line react/prop-types
function ExposureChart({ position }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const data = calculateExposureOverRange(position);
    setChartData({
      labels: data.prices,
      datasets: [
        {
          label: 'Delta Exposure',
          data: data.deltas,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
        },
      ],
    });
  }, [position]);

  if (!chartData) return null;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Delta Exposure Chart</h2>
      <Line data={chartData} />
    </div>
  );
}

export default ExposureChart;
