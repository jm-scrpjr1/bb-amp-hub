import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { ScrollEffects } from '../components/effects';
import { FileText, Download, ExternalLink, Search, Filter, Users, Globe, Building, X, Eye, Heart, Star, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DocumentViewerModal from '../components/modals/DocumentViewerModal';
import { useAuth } from '../providers/AuthProvider';

// ===== RBAC FILTERING LOGIC =====
/**
 * Check if user can view a document based on RBAC rules
 * Rules:
 * - All Employees / New Hires: Viewable by ANY ROLE + matching country (or All Countries)
 * - Leaders: Viewable by TEAM_MANAGER, SUPER_ADMIN, OWNER only + matching country
 */
const canViewDocument = (user, document) => {
  if (!user || !document) return false;

  const userRole = user.roles?.name || user.role;
  const userCountry = user.country || 'US';
  const docStakeholder = document.stakeholder?.trim() || '';
  const docCountry = document.country?.trim() || 'All Countries';

  // Check country restriction first
  const countryMatches = docCountry === 'All Countries' || docCountry === 'All countries' || userCountry === docCountry;
  if (!countryMatches) {
    return false;
  }

  // Check stakeholder-based access
  if (docStakeholder === 'All Employees' || docStakeholder === 'New Hires') {
    // Anyone can view these (country already checked)
    return true;
  }

  if (docStakeholder === 'Leaders') {
    // Only TEAM_MANAGER, SUPER_ADMIN, OWNER can view
    const allowedRoles = ['TEAM_MANAGER', 'SUPER_ADMIN', 'OWNER'];
    return allowedRoles.includes(userRole);
  }

  // Default: deny access if stakeholder is unknown
  return false;
};

// CSV Data Loading Function with proper parsing for URLs with commas and quoted fields
const loadCSVData = async () => {
  try {
    // Add cache-busting parameter to force fresh CSV load
    const response = await fetch(`/documents/AI%20Workbench%20Documents%20Repo.csv?t=${Date.now()}`);
    const csvText = await response.text();

    // Parse CSV properly, handling quoted fields with commas and newlines
    const parseCSV = (text) => {
      const rows = [];
      let currentRow = [];
      let currentField = '';
      let insideQuotes = false;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
          if (insideQuotes && nextChar === '"') {
            // Escaped quote
            currentField += '"';
            i++;
          } else {
            // Toggle quote state
            insideQuotes = !insideQuotes;
          }
        } else if (char === ',' && !insideQuotes) {
          // End of field
          currentRow.push(currentField.trim());
          currentField = '';
        } else if ((char === '\n' || char === '\r') && !insideQuotes) {
          // End of row
          if (currentField || currentRow.length > 0) {
            currentRow.push(currentField.trim());
            if (currentRow.some(field => field)) {
              rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
          }
          // Skip \r\n
          if (char === '\r' && nextChar === '\n') {
            i++;
          }
        } else {
          currentField += char;
        }
      }

      // Add last field and row
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field)) {
          rows.push(currentRow);
        }
      }

      return rows;
    };

    const rows = parseCSV(csvText);
    if (rows.length === 0) return [];

    const headers = rows[0].map(h => h.toLowerCase().replace(/^"|"$/g, ''));

    const documents = rows.slice(1)
      .filter(row => row.some(field => field)) // Filter out empty rows
      .map(row => {
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

          const value = row[index] || '';
          doc[normalizedHeader] = value.replace(/^"|"$/g, '').trim();
        });
        return doc;
      });

    console.log(`Loaded ${documents.length} documents from CSV`);
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
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStakeholder, setSelectedStakeholder] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [accessibleDocuments, setAccessibleDocuments] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [rbacInfo, setRbacInfo] = useState(null);

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

  // Apply RBAC filtering when user or documents change
  useEffect(() => {
    if (user && documents.length > 0) {
      const filtered = documents.filter(doc => canViewDocument(user, doc));
      setAccessibleDocuments(filtered);

      const userRole = user.roles?.name || user.role;
      const userCountry = user.country || 'US';

      setRbacInfo({
        userRole,
        userCountry,
        totalDocuments: documents.length,
        accessibleDocuments: filtered.length,
        deniedDocuments: documents.length - filtered.length
      });

      console.log(`🔐 RBAC Filtering: User ${user.email} (${userRole}, ${userCountry}) can access ${filtered.length}/${documents.length} documents`);
    }
  }, [user, documents]);

  // Use accessible documents for categories and filters
  const categories = getDocumentCategories(accessibleDocuments.length > 0 ? accessibleDocuments : documents);
  const stakeholders = [...new Set(accessibleDocuments.map(doc => doc.stakeholder))].filter(Boolean);
  const countries = [...new Set(accessibleDocuments.map(doc => doc.country))].filter(Boolean).filter(country => country !== 'All Countries');

  // Modal management
  const openDocumentModal = (doc) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const closeDocumentModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  const openCategoryModal = (category) => {
    setSelectedCategoryForModal(category);
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategoryForModal(null);
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
      if (event.key === 'Escape') {
        if (isModalOpen) {
          closeDocumentModal();
        } else if (isCategoryModalOpen) {
          closeCategoryModal();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, isCategoryModalOpen]);

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

            {/* RBAC Info Display */}
            {rbacInfo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 inline-block bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-4 py-3"
              >
                <div className="flex items-center space-x-2 text-sm">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">
                    <span className="font-semibold text-blue-600">{rbacInfo.userRole}</span> in <span className="font-semibold text-blue-600">{rbacInfo.userCountry}</span>
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">
                    Viewing <span className="font-semibold">{rbacInfo.accessibleDocuments}</span> of <span className="font-semibold">{rbacInfo.totalDocuments}</span> documents
                  </span>
                </div>
              </motion.div>
            )}
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
                        <button
                          onClick={() => openCategoryModal(category)}
                          className={`text-sm ${colorClasses.text} hover:underline font-medium`}
                        >
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

        {/* Category Documents Modal */}
        <AnimatePresence>
          {isCategoryModalOpen && selectedCategoryForModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={closeCategoryModal}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 ${getColorClasses(selectedCategoryForModal.color).bg} rounded-xl`}>
                      {React.createElement(selectedCategoryForModal.icon, { className: 'w-6 h-6 text-white' })}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedCategoryForModal.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {(selectedCategoryForModal.filteredDocuments || selectedCategoryForModal.documents).length} document{(selectedCategoryForModal.filteredDocuments || selectedCategoryForModal.documents).length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeCategoryModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-3">
                  {(selectedCategoryForModal.filteredDocuments || selectedCategoryForModal.documents).map((doc, docIndex) => {
                    const colorClasses = getColorClasses(selectedCategoryForModal.color);
                    return (
                      <div
                        key={doc.id || docIndex}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                          <div className="text-xs text-gray-500 mt-1">
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
                              onClick={() => {
                                openDocumentModal({...doc, category: selectedCategoryForModal.name});
                                closeCategoryModal();
                              }}
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
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

export default ResourcesPage;
