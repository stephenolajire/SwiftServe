import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const UserActivityChart = ({ users, activeUsers }) => {
  const data = {
    labels: users.map((user) => user.month),
    datasets: [
      {
        label: "New Users",
        data: users.map((user) => user.count),
        backgroundColor: "rgba(33, 150, 243, 0.8)",
        borderRadius: 4,
      },
      {
        label: "Active Users",
        data: activeUsers.map((user) => user.count),
        backgroundColor: "rgba(76, 175, 80, 0.8)",
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly User Activity",
        padding: 8,
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    barPercentage: 0.6, // Increased from 0.5 to 0.8
    categoryPercentage: 0.6, // Increased from 0.5 to 0.9
    layout: {
      padding: {
        left: 10,
        right: 10,
      },
    },
  };

  return (
    <div
      className="chart-container"
      style={{
        background: "white",
        padding: "1rem",
        borderRadius: "8px",
        width: "100%",
        height: "400px",
        marginBottom: "1rem",
      }}
    >
      <Bar data={data} options={options} />
    </div>
  );
};

export default UserActivityChart;
