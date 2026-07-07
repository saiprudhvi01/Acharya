'use client';

import { useEffect, useState } from 'react';
import { Search, ThumbsUp, ThumbsDown, ExternalLink, BookOpen } from 'lucide-react';

interface HelpArticle {
  _id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  subcategory?: string;
  views: number;
  helpful: number;
  notHelpful: number;
  thumbnail?: string;
  tags: string[];
}

interface HelpCenterProps {
  selectedArticle?: string;
  onSelectArticle?: (articleId: string) => void;
}

export default function HelpCenter({ selectedArticle, onSelectArticle }: HelpCenterProps) {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [viewingArticle, setViewingArticle] = useState<HelpArticle | null>(null);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (selectedCategory) query.append('category', selectedCategory);

      const response = await fetch(`/api/help?${query}`);
      if (!response.ok) throw new Error('Failed to fetch articles');

      const data = await response.json();
      setArticles(data);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map((article: HelpArticle) => article.category))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    if (!searchTerm) {
      setFilteredArticles(articles);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(term) ||
        article.content.toLowerCase().includes(term) ||
        article.tags.some((tag) => tag.toLowerCase().includes(term))
    );
    setFilteredArticles(filtered);
  };

  const submitFeedback = async (articleId: string, helpful: boolean) => {
    try {
      await fetch(`/api/help/${articleId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: helpful ? 'helpful' : 'notHelpful' }),
      });
      fetchArticles();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading help center...</div>;
  }

  if (viewingArticle) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <button
          onClick={() => setViewingArticle(null)}
          className="mb-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
        >
          ← Back to Help Center
        </button>

        <article className="prose dark:prose-invert max-w-none">
          {viewingArticle.thumbnail && (
            <img
              src={viewingArticle.thumbnail}
              alt={viewingArticle.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />
          )}

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {viewingArticle.title}
          </h1>

          <div className="flex gap-2 mb-4">
            {viewingArticle.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="text-gray-600 dark:text-gray-400 mb-6">
            Views: {viewingArticle.views}
          </div>

          <div className="prose dark:prose-invert">
            {viewingArticle.content}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="mb-4 text-gray-600 dark:text-gray-400">Was this article helpful?</p>
            <div className="flex gap-4">
              <button
                onClick={() => submitFeedback(viewingArticle._id, true)}
                className="flex items-center gap-2 px-4 py-2 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:opacity-75 transition"
              >
                <ThumbsUp className="w-4 h-4" />
                Yes ({viewingArticle.helpful})
              </button>
              <button
                onClick={() => submitFeedback(viewingArticle._id, false)}
                className="flex items-center gap-2 px-4 py-2 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:opacity-75 transition"
              >
                <ThumbsDown className="w-4 h-4" />
                No ({viewingArticle.notHelpful})
              </button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Categories</h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`w-full text-left px-3 py-2 rounded transition ${
                selectedCategory === ''
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              All Articles
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded transition ${
                  selectedCategory === cat
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:col-span-3">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Help Center
          </h2>

          <div className="mb-6 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {error && <div className="text-red-500 mb-4">Error: {error}</div>}

          {filteredArticles.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No articles found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <div
                  key={article._id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-gray-800 transition cursor-pointer"
                  onClick={() => setViewingArticle(article)}
                >
                  <div className="flex gap-4">
                    {article.thumbnail && (
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded hidden sm:block"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {article.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{article.category}</span>
                        {article.subcategory && <span>•</span>}
                        {article.subcategory && <span>{article.subcategory}</span>}
                        <span>•</span>
                        <span>{article.views} views</span>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
