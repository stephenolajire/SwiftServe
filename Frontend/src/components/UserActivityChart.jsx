import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import styles from '../css/Charts.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const UserActivityChart = ({ data }) => {
  const chartData = {
    labels: data?.map(item => item.date) || [],
    datasets: [
      {
        label: 'New Users',
        data: data?.map(item => item.newUsers) || [],
        backgroundColor: '#2196F3',
      },
      {
        label: 'Active Users',
        data: data?.map(item => item.activeUsers) || [],
        backgroundColor: '#4CAF50',
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
        text: 'User Activity'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  };

  return (
    <div className={styles.chartWrapper}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default UserActivityChart;