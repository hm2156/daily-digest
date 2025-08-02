import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const CACHE_LIFETIME = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

const KeywordTrendChart = ({ keyword, days }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!keyword) {
      setData(null);
      return;
    }

    const fetchTrendData = async () => {
      setLoading(true);
      setError(null);
      const cacheKey = `trend_${keyword}_${days}`;
      const cachedData = localStorage.getItem(cacheKey);
      const now = new Date().getTime();

      if (cachedData) {
        const { timestamp, trendData } = JSON.parse(cachedData);
        if (now - timestamp < CACHE_LIFETIME) {
          console.log("Loading trend data from cache.");
          setData(trendData);
          setLoading(false);
          return;
        }
      }

      try {
        const trendData = {};
        const today = new Date();

        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const formattedDate = date.toISOString().split('T')[0];

          // NEW: Call the Vercel serverless function, not the News API directly
          const endpoint = `/api/news?type=trends&q=${keyword}&from=${formattedDate}&to=${formattedDate}`;

          const res = await fetch(endpoint);
          if (!res.ok) {
            throw new Error(`API call failed with status: ${res.status}`);
          }
          const resData = await res.json();
          trendData[formattedDate] = resData.totalResults;
        }

        const newCacheData = { timestamp: now, trendData };
        localStorage.setItem(cacheKey, JSON.stringify(newCacheData));
        setData(trendData);
      } catch (err) {
        console.error("Failed to fetch trend data", err);
        setError("Failed to fetch trend data. Please try again later.");
        const cachedFallback = localStorage.getItem(cacheKey);
        if (cachedFallback) {
          console.log("Fetching failed, falling back to old cache.");
          setData(JSON.parse(cachedFallback).trendData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [keyword, days]);

  const chartData = {
    labels: data ? Object.keys(data).sort() : [],
    datasets: [
      {
        label: `Mentions of "${keyword}"`,
        data: data ? Object.keys(data).sort().map(key => data[key]) : [],
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgb(59, 130, 246)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Articles",
          font: { size: 14, family: 'sans-serif' }
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
          font: { size: 14, family: 'sans-serif' }
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          font: { size: 14, family: 'sans-serif' }
        }
      },
    },
  };

  if (!keyword) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 shadow-inner text-center text-gray-500 text-lg">
        Enter a keyword to see the trend.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 shadow-inner flex items-center justify-center text-gray-500 text-lg space-x-2">
        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading trend data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <div className="h-96">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default KeywordTrendChart;