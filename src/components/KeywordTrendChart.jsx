import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const KeywordTrendChart = ({ keyword, days }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      // Only fetch if a valid keyword is provided
      if (!keyword || keyword.trim() === "") {
        setError(null);
        setChartData(null);
        return;
      }
      
      setLoading(true);
      setError(null);
      const results = [];
      const today = new Date();

      try {
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const formattedDate = date.toISOString().split("T")[0];
          const newsApiKey = import.meta.env.VITE_NEWS_API_KEY;
         
          const res = await fetch(
            `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&from=${formattedDate}&to=${formattedDate}&language=en&pageSize=100&apiKey=${newsApiKey}`
          );
          if (!res.ok) {
            throw new Error(`Failed to fetch data for ${formattedDate}: ${res.statusText}`);
          }
          const data = await res.json();
          results.push({
            date: formattedDate,
            // Safely get the count, defaulting to 0 if articles array is missing or empty
            count: data.articles?.length || 0,
          });
        }

        setChartData({
          labels: results.map((r) => r.date),
          datasets: [
            {
              label: `Mentions of "${keyword}"`,
              data: results.map((r) => r.count),
              fill: true,
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              borderColor: "#3b82f6",
              tension: 0.3,
              pointBackgroundColor: "#3b82f6",
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "#3b82f6",
            },
          ],
        });
      } catch (err) {
        console.error("Failed to fetch trend data:", err);
        setError("Failed to load trend data. Please try again or check the keyword.");
        setChartData(null); // Clear previous chart data on error
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [keyword, days]);

  // Chart options (remains the same)
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#4b5563',
          font: {
            size: 14,
            family: '"Inter", sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#e5e7eb',
        padding: 10,
        cornerRadius: 6,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
        title: {
          display: true,
          text: 'Date',
          color: '#4b5563',
        }
      },
      y: {
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          color: '#6b7280',
          stepSize: 10,
        },
        title: {
          display: true,
          text: 'Number of Mentions',
          color: '#4b5563',
        },
        beginAtZero: true,
      },
    },
  };

  if (loading) return <p className="text-center text-gray-500 py-8">Loading trend data for "{keyword}"...</p>;
  if (error) return <p className="text-center text-red-500 py-8">{error}</p>;
  if (!chartData || chartData.labels.length === 0) return <p className="text-center text-gray-500 py-8">No trend data available for "{keyword}".</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12">
      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        <h2 className="text-2xl font-serif font-extrabold text-gray-900 leading-tight mb-6">
          📈 Keyword Trend Analysis
        </h2>
        <Line data={chartData} options={options} />
        <p className="text-sm text-gray-500 mt-4 text-center">
          Data sourced from NewsAPI.org based on `{keyword}` over the last {days} days.
        </p>
      </div>
    </div>
  );
};

export default KeywordTrendChart;