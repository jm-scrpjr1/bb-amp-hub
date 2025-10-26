import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { ScrollEffects } from '../components/effects';
import { FileText, Download, ExternalLink, Search, Filter, Users, Globe, Building, X, Eye, Heart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DocumentViewerModal from '../components/modals/DocumentViewerModal';

// CSV Data Loading Function with proper parsing for URLs with commas
const loadCSVData = async () => {
  try {
    // Add cache-busting parameter to force fresh CSV load
    const response = await fetch(`/documents/AI%20Workbench%20Documents%20Repo.csv?t=${Date.now()}`);
    const csvText = await response.text();

    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const documents = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        // Parse CSV line properly, handling quoted fields
        const values = [];
        let current = '';
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];

          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        const doc = {};
        headers.forEach((header, index) => {
          // Normalize field names to match expected format
          let normalizedHeader = header;
          if (header.includes('document name')) normalizedHeader = 'name';
          if (header.includes('stakeholder')) normalizedHeader = 'stakeholder';
          if (header.includes('category')) normalizedHeader = 'category';
          if (header.includes('country')) normalizedHeader = 'country';
          if (header.includes('owner')) normalizedHeader = 'owner';
          if (header.includes('link')) normalizedHeader = 'link';

          doc[normalizedHeader] = values[index]?.trim().replace(/^"|"$/g, '') || '';
        });
        return doc;
      });

    return documents;
  } catch (error) {
    console.error('Error loading CSV data:', error);
    return [];
  }
};

// Transform CSV data into categories
const getDocumentCategories = (documents) => {
  const categoryMap = new Map();

  documents.forEach(doc => {
    const categoryKey = doc.category.toLowerCase().replace(/\s+/g, '-');

    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(categoryKey, {
        id: categoryKey,
        name: doc.category,
        icon: getCategoryIcon(doc.category),
        color: getCategoryColor(doc.category),
        stakeholder: doc.stakeholder,
        documents: []
      });
    }

    categoryMap.get(categoryKey).documents.push({
      id: `${categoryKey}-${categoryMap.get(categoryKey).documents.length}`,
      name: doc.name,
      country: doc.country,
      owner: doc.owner,
      link: doc.link,
      stakeholder: doc.stakeholder
    });
  });

  return Array.from(categoryMap.values());
};

const getCategoryIcon = (category) => {
  const iconMap = {
    'Pre-employment Requirements': Users,
    'Important Tools': FileText,
    'Policies': Building,
    'Time Keeping': Globe,
    'Training': Users,
    'HR': Users,
    'IT': FileText,
    'Supervisor Tool kit': Globe,
    'General': Building,
    'Employee Perks / Benefits': Heart,
    'Recruiting': Users,
    'Service Orders': FileText,
    'Supervisor Onboarding': Users,
    'Expense & Travel': Globe
  };
  return iconMap[category] || FileText;
};

const getCategoryColor = (category) => {
  const colorMap = {
    'Pre-employment Requirements': 'blue',
    'Important Tools': 'cyan',
    'Policies': 'purple',
    'Time Keeping': 'green',
    'Training': 'yellow',
    'HR': 'pink',
    'IT': 'indigo',
    'Supervisor Tool kit': 'orange',
    'General': 'gray',
    'Employee Perks / Benefits': 'emerald',
    'Recruiting': 'blue',
    'Service Orders': 'indigo',
    'Supervisor Onboarding': 'yellow',
    'Expense & Travel': 'green'
  };
  return colorMap[category] || 'gray';
};

const ResourcesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStakeholder, setSelectedStakeholder] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load CSV data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const csvData = await loadCSVData();
      setDocuments(csvData);

      // Load favorites from localStorage
      const savedFavorites = localStorage.getItem('resourceFavorites');
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const categories = getDocumentCategories(documents);
  const stakeholders = [...new Set(documents.map(doc => doc.stakeholder))].filter(Boolean);
  const countries = [...new Set(documents.map(doc => doc.country))].filter(Boolean).filter(country => country !== 'All Countries');

  // Modal management
  const openDocumentModal = (doc) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const closeDocumentModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  // Favorites management
  const toggleFavorite = (docId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(docId)) {
      newFavorites.delete(docId);
    } else {
      newFavorites.add(docId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('resourceFavorites', JSON.stringify([...newFavorites]));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeDocumentModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = searchTerm === '' ||
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.documents.some(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = selectedCategory === 'all' || category.id === selectedCategory;
    const matchesStakeholder = selectedStakeholder === 'all' ||
      category.documents.some(doc => doc.stakeholder === selectedStakeholder);

    // Filter documents within category
    const filteredDocs = category.documents.filter(doc => {
      const matchesCountry = selectedCountry === 'all' ||
        doc.country === selectedCountry ||
        doc.country === 'All Countries';

      const matchesFavorites = !showFavoritesOnly || favorites.has(doc.id);

      return matchesCountry && matchesFavorites;
    });

    // Only show category if it has matching documents
    if (filteredDocs.length === 0) return false;

    // Update category with filtered documents
    category.filteredDocuments = filteredDocs;

    return matchesSearch && matchesCategory && matchesStakeholder;
  });

  const getColorClasses = (color) => {
    const colorMap = {
      blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200' },
      cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200' },
      green: { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200' },
      yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200' },
      pink: { bg: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-200' },
      indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200' },
      orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200' },
      gray: { bg: 'bg-gray-500', text: 'text-gray-600', border: 'border-gray-200' },
      emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200' }
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <ScrollEffects effect="fadeUp" delay={0.1}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Resources & Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access company resources, forms, policies, and documentation organized by category and stakeholder.
            </p>
          </div>
        </ScrollEffects>

        {/* Search and Filters */}
        <ScrollEffects effect="fadeUp" delay={0.2}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources and documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Filter Toggle and Favorites */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    showFavoritesOnly
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  <span>Favorites Only</span>
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${filteredCategories.length} categories found`}
              </div>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stakeholder Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stakeholder</label>
                      <select
                        value={selectedStakeholder}
                        onChange={(e) => setSelectedStakeholder(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="all">All Stakeholders</option>
                        {stakeholders.map(stakeholder => (
                          <option key={stakeholder} value={stakeholder}>
                            {stakeholder}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Country Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="all">All Countries</option>
                        {countries.map(country => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollEffects>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading documents...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No documents found</h3>
            <p className="mt-2 text-gray-600">
              {showFavoritesOnly
                ? 'No favorite documents match your current filters.'
                : 'Try adjusting your search terms or filters.'}
            </p>
            {(searchTerm || selectedCategory !== 'all' || selectedStakeholder !== 'all' || selectedCountry !== 'all' || showFavoritesOnly) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStakeholder('all');
                  setSelectedCountry('all');
                  setShowFavoritesOnly(false);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Categories Grid */}
        {!loading && filteredCategories.length > 0 && (
          <ScrollEffects effect="fadeUp" delay={0.3}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category, index) => {
              const IconComponent = category.icon;
              const colorClasses = getColorClasses(category.color);

              return (
                <motion.div
                  key={category.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-3 ${colorClasses.bg} rounded-xl`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {(category.filteredDocuments || category.documents).length} document{(category.filteredDocuments || category.documents).length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="space-y-3">
                    {(category.filteredDocuments || category.documents).slice(0, 3).map((doc, docIndex) => (
                      <div
                        key={doc.id || docIndex}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {doc.name}
                            </div>
                            {favorites.has(doc.id) && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {doc.country === 'All Countries' ? 'Global' : doc.country} • {doc.owner || 'No owner'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-3">
                          <button
                            onClick={() => toggleFavorite(doc.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              favorites.has(doc.id)
                                ? 'text-yellow-500 hover:bg-yellow-100'
                                : 'text-gray-400 hover:bg-gray-200'
                            }`}
                            title={favorites.has(doc.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star className={`w-4 h-4 ${favorites.has(doc.id) ? 'fill-current' : ''}`} />
                          </button>
                          {doc.link && (
                            <button
                              onClick={() => openDocumentModal({...doc, category: category.name})}
                              className={`p-2 ${colorClasses.text} hover:bg-gray-200 rounded-lg transition-colors`}
                              title="View document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {doc.link ? (
                            <a
                              href={doc.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-2 ${colorClasses.text} hover:bg-gray-200 rounded-lg transition-colors`}
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            <div className="p-2 text-gray-400 rounded-lg" title="No link available">
                              <X className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {(category.filteredDocuments || category.documents).length > 3 && (
                      <div className="text-center pt-2">
                        <button className={`text-sm ${colorClasses.text} hover:underline font-medium`}>
                          View {(category.filteredDocuments || category.documents).length - 3} more documents
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
                );
              })}
            </div>
          </ScrollEffects>
        )}

        {/* AI Training Assistant */}
        <ScrollEffects effect="fadeUp" delay={0.5}>
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <img
                    src="/images/AI TRAINING 1.png"
                    alt="AI Training Assistant"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">AI Training Assistant</h3>
                  <p className="text-blue-100">
                    Need help finding the right resource? Ask our AI assistant for personalized recommendations.
                  </p>
                </div>
              </div>
              <motion.button
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Trigger AI assistant
                  console.log('Opening AI Training Assistant');
                }}
              >
                Ask Assistant
              </motion.button>
            </div>
          </div>
        </ScrollEffects>

        {/* Document Viewer Modal */}
        <DocumentViewerModal
          isOpen={isModalOpen}
          onClose={closeDocumentModal}
          document={selectedDocument}
          onToggleFavorite={toggleFavorite}
          isFavorite={selectedDocument ? favorites.has(selectedDocument.id) : false}
        />
      </div>
    </MainLayout>
  );
};

export default ResourcesPage;
