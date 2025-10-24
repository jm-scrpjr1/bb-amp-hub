import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { ScrollEffects } from '../components/effects';
import { Search, Heart, Sparkles, ArrowLeft, Loader, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PromptLibraryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  const categoryColors = {
    'General Use': 'from-indigo-600 to-purple-600',
    'Sales': 'from-red-600 to-pink-600',
    'Marketing': 'from-green-600 to-emerald-600',
    'Finance': 'from-yellow-600 to-orange-600',
    'Operations': 'from-orange-600 to-red-600',
    'HR': 'from-sky-400 to-blue-600',
    'IT': 'from-gray-600 to-slate-700',
    'Coding': 'from-blue-700 to-indigo-700',
    'Recruiting': 'from-purple-600 to-pink-600'
  };

  useEffect(() => {
    fetchPrompts();
  }, [category]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://api.boldbusiness.com/api'}/prompts?category=${encodeURIComponent(category)}&userId=${user?.email || ''}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setPrompts(data.prompts);
        
        // Set favorites
        const favSet = new Set();
        data.prompts.forEach(p => {
          if (p.is_favorited) favSet.add(p.id);
        });
        setFavorites(favSet);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (promptId) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user) {
        alert('Please sign in to favorite prompts');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://api.boldbusiness.com/api'}/prompts/${promptId}/favorite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user.email })
        }
      );

      const data = await response.json();
      if (data.success) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          if (data.is_favorited) {
            newSet.add(promptId);
          } else {
            newSet.delete(promptId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const executePrompt = async () => {
    if (!userInput.trim() || !selectedPrompt) return;

    try {
      setExecuting(true);
      setResult(null);

      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://api.boldbusiness.com/api'}/prompts/${selectedPrompt.id}/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userInput: userInput,
            userId: user?.email || 'anonymous'
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        setResult(data.response);
      } else {
        alert('Failed to execute prompt: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error executing prompt:', error);
      alert('Failed to execute prompt');
    } finally {
      setExecuting(false);
    }
  };

  const filteredPrompts = prompts.filter(prompt => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      prompt.catchy_name?.toLowerCase().includes(search) ||
      prompt.description?.toLowerCase().includes(search) ||
      prompt.prompt_type?.toLowerCase().includes(search)
    );
  });

  const categoryColor = categoryColors[category] || 'from-blue-600 to-indigo-600';

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <ScrollEffects effect="fadeUp" delay={0.1}>
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/prompts')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${categoryColor} bg-clip-text text-transparent mb-2`}>
                {category} Prompts
              </h1>
              <p className="text-xl text-gray-600">
                {filteredPrompts.length} AI-powered prompts to boost your productivity
              </p>
            </div>
          </div>
        </ScrollEffects>

        {/* Search Bar */}
        <ScrollEffects effect="fadeUp" delay={0.2}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </ScrollEffects>

        {/* Prompts Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <ScrollEffects effect="fadeUp" delay={0.3}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map((prompt, index) => (
                <motion.div
                  key={prompt.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer relative group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  onClick={() => setSelectedPrompt(prompt)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(prompt.id);
                    }}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        favorites.has(prompt.id)
                          ? 'text-red-500 fill-current'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    />
                  </button>

                  {/* Prompt Content */}
                  <div className="mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${categoryColor} flex items-center justify-center mb-4`}>
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {prompt.catchy_name || prompt.prompt_type || 'Untitled Prompt'}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {prompt.description}
                    </p>
                  </div>

                  {/* Usage Count */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Sparkles className="w-4 h-4" />
                    <span>Used {prompt.usage_count} times</span>
                  </div>

                  {/* Hover Effect */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryColor} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                </motion.div>
              ))}
            </div>
          </ScrollEffects>
        )}

        {/* Execution Modal */}
        <AnimatePresence>
          {selectedPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setSelectedPrompt(null);
                setUserInput('');
                setResult(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedPrompt.catchy_name || selectedPrompt.prompt_type}
                    </h2>
                    <p className="text-gray-600">
                      {selectedPrompt.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPrompt(null);
                      setUserInput('');
                      setResult(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Input Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Input
                  </label>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter your request here..."
                    className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Execute Button */}
                <button
                  onClick={executePrompt}
                  disabled={!userInput.trim() || executing}
                  className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
                    !userInput.trim() || executing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : `bg-gradient-to-r ${categoryColor} text-white hover:shadow-lg`
                  }`}
                >
                  {executing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Execute Prompt
                    </span>
                  )}
                </button>

                {/* Result Section */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      AI Response
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {result}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

export default PromptLibraryPage;

