import { useEffect, useState } from "react";
import Sentiment from "sentiment";
import KeywordTrendChart from "../components/KeywordTrendChart";
import AboutPage from "../components/AboutPage"; 

const sentiment = new Sentiment();

const getMood = (text) => {
  if (!text) return "😐 Neutral";
  const result = sentiment.analyze(text);
  const score = result.score;
  if (score > 1) return "😄 Positive";
  if (score < -1) return "😞 Negative";
  return "😐 Neutral";
};

const categories = [
  "general",
  "technology",
  "sports",
  "business",
  "health",
  "science",
  "entertainment",
];

const CACHE_LIFETIME = 15 * 60 * 1000; // 15 minutes in milliseconds

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showSavedArticles, setShowSavedArticles] = useState(false);
  const [showTrendChart, setShowTrendChart] = useState(false);
  const [showAboutPage, setShowAboutPage] = useState(false); 
  const [brokenImages, setBrokenImages] = useState({});

  const [trendKeyword, setTrendKeyword] = useState("");
  const [trendDays, setTrendDays] = useState(7);
  const [displayTrendKeyword, setDisplayTrendKeyword] = useState("");
  const [displayTrendDays, setDisplayTrendDays] = useState(7);

  const [savedArticles, setSavedArticles] = useState(() => {
    const stored = localStorage.getItem("savedArticles");
    return stored ? JSON.parse(stored) : [];
  });

  const [articleSummaries, setArticleSummaries] = useState({});
  const [loadingSummaries, setLoadingSummaries] = useState({});

  const toggleSaveArticle = (article) => {
    const isSaved = savedArticles.some((a) => a.url === article.url);
    let updated;

    if (isSaved) {
      updated = savedArticles.filter((a) => a.url !== article.url);
    } else {
      updated = [...savedArticles, article];
    }

    setSavedArticles(updated);
    localStorage.setItem("savedArticles", JSON.stringify(updated));
  };

  const summarizeArticle = async (content) => {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_TOKEN}`, 
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: content,
          }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Hugging Face API error:", errorData);
        return "Failed to summarize: " + (errorData.error || "Unknown error");
      }
  
      const data = await response.json();
      return data?.[0]?.summary_text || "No summary available.";
    } catch (error) {
      console.error("Summarization error:", error);
      return "Failed to summarize due to network or API issue.";
    }
  };

  const handleSummarize = async (article) => {
    const articleUrl = article.url;
    if (articleSummaries[articleUrl]) {
      setArticleSummaries((prev) => {
        const newState = { ...prev };
        delete newState[articleUrl];
        return newState;
      });
      return;
    }

    setLoadingSummaries((prev) => ({ ...prev, [articleUrl]: true }));
    const textToSummarize = article.content || article.description || article.title;
    const sum = await summarizeArticle(textToSummarize);
    setArticleSummaries((prev) => ({ ...prev, [articleUrl]: sum }));
    setLoadingSummaries((prev) => ({ ...prev, [articleUrl]: false }));
  };

  useEffect(() => {
    if (showSavedArticles || showTrendChart || showAboutPage) {
        setArticles([]);
        return;
    }
    setBrokenImages({});

    const fetchNews = async () => {
      const cacheKey = isSearchMode
        ? `news_search_${searchQuery}`
        : `news_category_${category}`;
      const cachedData = localStorage.getItem(cacheKey);
      const now = new Date().getTime();

      if (cachedData) {
        const { timestamp, articles } = JSON.parse(cachedData);
        if (now - timestamp < CACHE_LIFETIME) {
          console.log(`Loading from cache for ${cacheKey}`);
          setArticles(articles);
          return;
        }
      }

      try {
        const endpoint = isSearchMode
          ? `/api/news?q=${searchQuery}`
          : `/api/news?category=${category}`;

        const res = await fetch(endpoint); // The magic is here: it's a network request, not an import.
        if (!res.ok) {
          throw new Error(`API call failed with status: ${res.status}`);
        }
        const data = await res.json();
        setArticles(data.articles || []);
        setArticleSummaries({});

        const newCacheData = { timestamp: now, articles: data.articles || [] };
        localStorage.setItem(cacheKey, JSON.stringify(newCacheData));
        console.log(`Successfully fetched and cached new data for ${cacheKey}`);
      } catch (err) {
        console.error("Failed to fetch news", err);
        const cachedFallback = localStorage.getItem(cacheKey);
        if (cachedFallback) {
          console.log("Fetching failed, falling back to old cache.");
          setArticles(JSON.parse(cachedFallback).articles);
        }
      }
    };

    fetchNews();
  }, [category, searchQuery, isSearchMode, showSavedArticles, showTrendChart]);

  const handleGenerateTrend = (e) => {
    e.preventDefault();
    setDisplayTrendKeyword(trendKeyword);
    setDisplayTrendDays(trendDays);
  };
  
  const handleToggleTrendChart = () => {
    setShowTrendChart(!showTrendChart);
    if (!showTrendChart) {
      setShowSavedArticles(false);
      setIsSearchMode(false);
    }
  };

  const handleTitleClick = () => {
    setShowAboutPage(true);
    setShowSavedArticles(false);
    setShowTrendChart(false);
    setIsSearchMode(false);
  };

  const handleBackToHome = () => {
    setShowAboutPage(false);
    setCategory("general");
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <header className="py-8 border-b border-gray-200 mb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-6 sm:flex-row sm:justify-between sm:items-start sm:text-left">
          <div>
            <button onClick={handleTitleClick} className="group text-left" aria-label="Go to About page">
              <h1 className="text-4xl sm:text-4xl font-serif font-extrabold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors duration-200">
                📰 The Daily Digest
              </h1>
            </button>
            <p className="text-gray-600 mt-2 text-lg">
              Curated headlines from around the world.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleTrendChart}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 min-w-[120px] ${showTrendChart ? "bg-gray-800 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l2.586 2.586L14.586 7H12z" clipRule="evenodd" />
              </svg>
              <span>{showTrendChart ? "Back to News" : "Trends"}</span>
            </button>
            <button
              onClick={() => {
                setShowSavedArticles(!showSavedArticles);
                if (!showSavedArticles) {
                  setShowTrendChart(false);
                  setIsSearchMode(false);
                  setCategory("general");
                  setSearchQuery("");
                  setShowAboutPage(false);
                }
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 min-w-[120px] ${showSavedArticles ? "bg-gray-800 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              <span>{showSavedArticles ? "Back to News" : `Saved (${savedArticles.length})`}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {showAboutPage ? (
          <AboutPage onBackClick={handleBackToHome} />
        ) : showTrendChart ? (
          <>
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8 transition-shadow duration-300">
              <h2 className="text-3xl font-serif font-extrabold text-gray-900 leading-tight mb-6">
                📈 Keyword Trend Analysis
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Enter a keyword to generate a historical trend chart showing its frequency in news articles over the last 7 or 30 days. This can help you visualize the popularity and relevance of a topic over time.
              </p>
              <p className="text-sm text-blue-700 mb-6">
                <strong className="font-bold">Note:</strong> Due to API limitations and usage caps, we recommend using this feature sparingly.
              </p>
              <form onSubmit={handleGenerateTrend} className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="text"
                  value={trendKeyword}
                  onChange={(e) => setTrendKeyword(e.target.value)}
                  placeholder="Enter keyword (e.g., AI, sports)"
                  className="flex-1 w-full sm:w-auto bg-gray-100 rounded-full px-5 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-lg border-2 border-transparent focus:border-blue-500"
                />
                <select
                  value={trendDays}
                  onChange={(e) => setTrendDays(Number(e.target.value))}
                  className="w-full sm:w-auto bg-gray-100 rounded-full px-5 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-lg appearance-none cursor-pointer border-2 border-transparent focus:border-blue-500"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                    backgroundSize: "1.2em",
                  }}
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                </select>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-gray-800 text-white text-lg font-medium hover:bg-gray-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Show Trend
                </button>
              </form>
            </div>
            <KeywordTrendChart keyword={displayTrendKeyword} days={displayTrendDays} />
          </>
        ) : (
          <>
            {!showSavedArticles && (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIsSearchMode(true);
                  }}
                  className="flex items-center gap-4 mb-8 border border-gray-300 rounded-full px-5 py-2 focus-within:border-blue-500 transition-colors duration-200"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Explore topics or search for articles..."
                    className="flex-1 text-gray-800 placeholder-gray-500 focus:outline-none bg-transparent text-lg"
                  />
                  <button
                    type="submit"
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex-shrink-0"
                    title="Search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setIsSearchMode(false);
                        setSearchQuery("");
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${category === cat && !isSearchMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"}`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
                {isSearchMode && (
                  <div className="text-center mb-10">
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchMode(false);
                        setCategory("general");
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200 text-base underline"
                    >
                      Clear Search and Show Top Headlines
                    </button>
                  </div>
                )}
              </>
            )}

            {showSavedArticles ? (
              <div className="space-y-12 pt-4">
                <h2 className="text-4xl font-serif font-extrabold text-gray-900 leading-tight text-center mb-8">
                  🔖 Your Saved Articles
                </h2>
                {savedArticles.length > 0 ? (
                  savedArticles.map((article, i) => {
                    const articleUrl = article.url;
                    const summary = articleSummaries[articleUrl];
                    const loadingSummary = loadingSummaries[articleUrl];
                    const isImageBroken = brokenImages[articleUrl] || !article.urlToImage;

                    return (
                      <a href={article.url} target="_blank" rel="noopener noreferrer" key={i} className="block group cursor-pointer">
                        <article className="flex flex-col md:flex-row items-start md:space-x-8">
                          <div className="flex-1 order-2 md:order-1">
                            <h3 className="text-2xl font-serif font-extrabold text-gray-900 leading-tight mb-2 group-hover:text-blue-700 transition-colors duration-200">
                              {article.title}
                            </h3>
                            {article.description && (<p className="text-gray-700 text-lg leading-relaxed mb-4">{article.description}</p>)}
                            <p className="text-gray-700 text-base mb-4"><span className="font-semibold">Sentiment:</span> {getMood(article.title)}</p>
                            <div className="flex items-center text-gray-500 text-sm mb-4">
                              {article.source?.name && (<span className="mr-2">{article.source.name}</span>)}
                              {article.publishedAt && (<span>{new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>)}
                            </div>
                            <div className="flex items-center gap-4 flex-wrap mt-4">
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSummarize(article); }} className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 text-sm" disabled={loadingSummary}>
                                {loadingSummary ? (<><svg className="animate-spin h-4 w-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Summarizing...</>) : (<><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 2.586L16.414 6A2 2 0 0117 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1-3a1 1 0 000 2h.01a1 1 0 000-2H7zm4 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-2 4a1 1 0 000 2h3a1 1 0 100-2h-3zm-1 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" /></svg>{summary ? "Hide Summary" : "Summarize"}</>)}
                              </button>
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSaveArticle(article); }} className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors duration-200 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" /></svg>Remove from Saved
                              </button>
                            </div>
                            {summary && (<p className="mt-4 text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 text-base leading-relaxed break-words"><span className="font-semibold">Summary:</span> {summary}</p>)}
                          </div>
                          <div className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0 order-1 md:order-2">
                            {!isImageBroken ? (
                              <img
                                src={article.urlToImage}
                                alt={article.title || "News"}
                                className="w-full h-48 md:h-40 object-cover rounded-lg shadow-md"
                                onError={() => setBrokenImages(prev => ({ ...prev, [articleUrl]: true }))}
                              />
                            ) : (
                              <div className="w-full h-48 md:h-40 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M19 4H5c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </article>
                      </a>
                    );
                  })
                ) : (<p className="text-center text-gray-500 text-lg py-12">You haven't saved any articles yet.</p>)}
              </div>
            ) : (
              <div className="space-y-12">
                {articles.length > 0 ? (
                  articles.map((article, i) => {
                    const isArticleSaved = savedArticles.some((a) => a.url === article.url);
                    const articleUrl = article.url;
                    const summary = articleSummaries[articleUrl];
                    const loadingSummary = loadingSummaries[articleUrl];
                    const isImageBroken = brokenImages[articleUrl] || !article.urlToImage;
                    
                    return (
                      <a href={article.url} target="_blank" rel="noopener noreferrer" key={i} className="block group cursor-pointer">
                        <article className="flex flex-col md:flex-row items-start md:space-x-8">
                          <div className="flex-1 order-2 md:order-1">
                            <h2 className="text-2xl font-serif font-extrabold text-gray-900 leading-tight mb-2 group-hover:text-blue-700 transition-colors duration-200">{article.title}</h2>
                            {article.description && (<p className="text-gray-700 text-lg leading-relaxed mb-4">{article.description}</p>)}
                            <p className="text-gray-700 text-base mb-4"><span className="font-semibold">Sentiment:</span> {getMood(article.title)}</p>
                            <div className="flex items-center justify-between text-gray-500 text-sm">
                              <div className="flex items-center">
                                {article.source?.name && (<span className="mr-2">{article.source.name}</span>)}
                                {article.publishedAt && (<span>{new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>)}
                              </div>
                              <div className="flex items-center gap-4">
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSummarize(article); }} className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 text-sm" disabled={loadingSummary}>
                                  {loadingSummary ? (<><svg className="animate-spin h-4 w-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Summarizing...</>) : (<><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 2.586L16.414 6A2 2 0 0117 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1-3a1 1 0 000 2h.01a1 1 0 000-2H7zm4 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-2 4a1 1 0 000 2h3a1 1 0 100-2h-3zm-1 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" /></svg>{summary ? "Hide Summary" : "Summarize"}</>)}
                                </button>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSaveArticle(article); }} className={`flex items-center gap-1 transition-colors duration-200 p-1 rounded ${isArticleSaved ? "text-blue-600 hover:text-blue-800" : "text-gray-500 hover:text-gray-700"}`} title={isArticleSaved ? "Remove from Saved" : "Save Article"}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">{isArticleSaved ? (<path fillRule="evenodd" d="M5 4a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H5zm0 2h10v10H5V6zm9 10H6v-6h8v6z" clipRule="evenodd" />) : (<path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />)}</svg><span className="text-sm">{isArticleSaved ? "Saved" : "Save"}</span>
                                </button>
                              </div>
                            </div>
                            {summary && (<p className="mt-4 text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 text-base leading-relaxed break-words"><span className="font-semibold">Summary:</span> {summary}</p>)}
                          </div>
                          <div className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0 order-1 md:order-2">
                            {!isImageBroken ? (
                              <img
                                src={article.urlToImage}
                                alt={article.title || "News"}
                                className="w-full h-48 md:h-40 object-cover rounded-lg shadow-md"
                                onError={() => setBrokenImages(prev => ({ ...prev, [articleUrl]: true }))}
                              />
                            ) : (
                              <div className="w-full h-48 md:h-40 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M19 4H5c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </article>
                      </a>
                    );
                  })
                ) : (<p className="text-center text-gray-500 text-lg py-12">No articles found. Try a different search or category.</p>)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;