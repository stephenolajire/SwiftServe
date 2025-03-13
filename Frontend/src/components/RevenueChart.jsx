import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import styles from '../css/Charts.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = ({ data }) => {
  const chartData = {
    labels: data?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Revenue',
        data: data?.map(item => item.amount) || [],
        fill: false,
        borderColor: '#4CAF50',
        tension: 0.4,
        pointBackgroundColor: '#4CAF50'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Trend'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₦${value.toLocaleString()}`
        }
      }
    }
  };

  return (
    <div className={styles.chartWrapper}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RevenueChart;