'use client';

import { useEffect, useState } from 'react';
import { Search, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
  helpful: number;
  notHelpful: number;
}

interface FAQPanelProps {
  category?: string;
}

export default function FAQPanel({ category }: FAQPanelProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchFAQs();
  }, [category]);

  useEffect(() => {
    filterFAQs();
  }, [faqs, searchTerm]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (category) query.append('category', category);

      const response = await fetch(`/api/faq?${query}`);
      if (!response.ok) throw new Error('Failed to fetch FAQs');

      const data = await response.json();
      setFaqs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterFAQs = () => {
    if (!searchTerm) {
      setFilteredFaqs(faqs);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term)
    );
    setFilteredFaqs(filtered);
  };

  const submitFeedback = async (faqId: string, helpful: boolean) => {
    try {
      const response = await fetch(`/api/faq/${faqId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: helpful ? 'helpful' : 'notHelpful' }),
      });

      if (response.ok) {
        setHelpfulFeedback((prev) => ({
          ...prev,
          [faqId]: helpful,
        }));
        // Refresh FAQs to show updated counts
        fetchFAQs();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading FAQs...</div>;
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Frequently Asked Questions
      </h2>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}

      {filteredFaqs.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {searchTerm ? 'No FAQs match your search' : 'No FAQs available'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div
              key={faq._id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === faq._id ? null : faq._id)
                }
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-between"
              >
                <span className="font-semibold text-left text-gray-900 dark:text-white">
                  {faq.question}
                </span>
                {expandedId === faq._id ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {expandedId === faq._id && (
                <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {faq.answer}
                  </p>

                  <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500">
                      Was this helpful?
                    </span>
                    <button
                      onClick={() => submitFeedback(faq._id, true)}
                      className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                        helpfulFeedback[faq._id] === true
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-xs">{faq.helpful}</span>
                    </button>
                    <button
                      onClick={() => submitFeedback(faq._id, false)}
                      className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                        helpfulFeedback[faq._id] === false
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span className="text-xs">{faq.notHelpful}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
