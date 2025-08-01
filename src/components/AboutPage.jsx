import React from 'react';

const AboutPage = ({ onBackClick }) => {
  const iconStyle = "w-6 h-6 text-blue-600 flex-shrink-0 mr-4";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <div className="mb-10">
        <button
          onClick={onBackClick}
          className="inline-flex items-center text-gray-600 hover:text-blue-800 transition-colors duration-200 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Headlines
        </button>
      </div>

      <article className="space-y-12">
        {/* Main Header Section */}
        <div>
          <h1 className="font-serif text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            About The Daily Digest
          </h1>
          <p className="text-xl text-gray-600 mt-6 leading-relaxed">
            The Daily Digest is a simple, modern news aggregator built to provide you with a personalized and intelligent way to consume the latest headlines. We focus on delivering a clean, clutter-free reading experience.
          </p>
        </div>
        
        {/* Separator for visual interest */}
        <div className="w-24 h-1 bg-gray-200 my-10 mx-auto" />
        
        {/* Key Features Section with Icons */}
        <div className="space-y-10">
          <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Key Features
          </h2>
          
          <ul className="space-y-8">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconStyle}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong className="block text-xl text-gray-900 font-semibold">Real-time Headlines</strong>
                <p className="text-lg text-gray-700 mt-2">
                  Get top headlines from around the world across various categories like technology, business, sports, and more.
                </p>
              </div>
            </li>
            
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconStyle}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.757a1.125 1.125 0 011.125-1.125h2.25l-.157.157a1.5 1.5 0 01-2.121 0L19.5 12.129zM19.5 14.25v2.757a1.125 1.125 0 01-1.125 1.125h-2.25l.157-.157a1.5 1.5 0 012.121 0L19.5 14.25zM12 21a9 9 0 100-18 9 9 0 000 18z" />
              </svg>
              <div>
                <strong className="block text-xl text-gray-900 font-semibold">Article Summarization</strong>
                <p className="text-lg text-gray-700 mt-2">
                  Use our AI-powered summarization tool to quickly grasp the main points of any article without having to read the full text.
                </p>
              </div>
            </li>
            
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconStyle}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M9 11.25a.75.75 0 100 1.5h.001a.75.75 0 100-1.5H9zm7.5 0a.75.75 0 100 1.5h.001a.75.75 0 100-1.5H16zm-3.5 1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5z" />
              </svg>
              <div>
                <strong className="block text-xl text-gray-900 font-semibold">Sentiment Analysis</strong>
                <p className="text-lg text-gray-700 mt-2">
                  Instantly see the mood of a news article's title, helping you get a quick emotional feel for the content.
                </p>
              </div>
            </li>
            
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconStyle}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l4.5 4.5 4.5-4.5m-9-4.5l4.5-4.5 4.5 4.5M3 18l4.5 4.5 4.5-4.5m-9-4.5l4.5-4.5 4.5 4.5M12 21h9m-9-3h9m-9-3h9" />
              </svg>
              <div>
                <strong className="block text-xl text-gray-900 font-semibold">Keyword Trend Analysis</strong>
                <p className="text-lg text-gray-700 mt-2">
                  Visualize the historical popularity of any keyword in the news over the last 7 or 30 days.
                </p>
              </div>
            </li>
            
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconStyle}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              <div>
                <strong className="block text-xl text-gray-900 font-semibold">Save for Later</strong>
                <p className="text-lg text-gray-700 mt-2">
                  Easily save articles you find interesting to read at a later time.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Our Philosophy Section */}
        <div className="space-y-4">
          <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight mt-12">
            Our Philosophy
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            In a world of constant information overload, The Daily Digest is designed to be your curated source of truth. We believe that reading the news should be a pleasant and insightful experience, not a chore.
          </p>
        </div>
      </article>
    </div>
  );
};

export default AboutPage;