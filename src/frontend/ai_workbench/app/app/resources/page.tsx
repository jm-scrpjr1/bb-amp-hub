
"use client";

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { ScrollEffects, AnimatedText, TextScramble } from '@/components/effects';
import { FileText, Download, ExternalLink, Search, Filter, Users, Globe, Building, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Document repository data from CSV - source of truth
const csvDocuments = [
  { stakeholder: 'New Hires', category: 'Pre-employment Requirements', country: 'PH', name: 'Employee Information Form', owner: 'HR', link: 'https://forms.gle/7RAEPUtUd9qNESeG7' },
  { stakeholder: 'New Hires', category: 'Pre-employment Requirements', country: 'COL', name: 'Employee Information Form', owner: 'HR', link: 'https://forms.gle/CiXUGzp9qFe7uh9f7' },
  { stakeholder: 'New Hires', category: 'Pre-employment Requirements', country: 'IN', name: 'Employee Information Form', owner: 'HR', link: '' },
  { stakeholder: 'New Hires', category: 'Pre-employment Requirements', country: 'US', name: 'Employee Information Form', owner: 'HR', link: '' },
  { stakeholder: 'All Employees', category: 'Important Tools', country: 'All countries', name: 'Quickbooks Timesheets manual (employee user)', owner: 'IT', link: 'https://docs.google.com/document/d/1Xg6LR5qFIK_MpAuqbKyutjcyrgmARUJjR6FqNSVWHkM/edit' },
  { stakeholder: 'All Employees', category: 'Policies', country: 'All countries', name: 'Acceptable Use Policy (AUP)', owner: 'IT', link: 'https://docs.google.com/document/d/1TdwZvk-WM7yMfZnO2qf-zYq0M2sX_72L/edit' },
  { stakeholder: 'All Employees', category: 'Time Keeping', country: 'PH', name: 'Payroll Sprout', owner: 'HR', link: 'https://sso.sprout.ph/realms/boldbusiness/protocol/openid-connect/auth?client_id=SproutSSO&redirect_uri=https%3A%2F%2Fboldbusiness.hrhub.ph%2F&response_type=code%20id_token&scope=openid%20profile&state=OpenIdConnect.AuthenticationProperties%3DxyHkJwBNCPVeyLt90QUQ8cestKkk1ZQRrUBbEAb0LATdzs5HF1jrsb1JVq9k29tzVg60mxmyJGpCVUoUURAMgd5JnEeJR59vYxRTEix9JvVnsEBvpS415RbtaFvjoFo4Exsy9nO8SKFidScjalAWgc29Oo0LwMHV5c2QauXgWU1Uk02WMdAMeKyd_wlVBSir17aNCA&response_mode=form_post&nonce=638932224909690080.NzliY2QwOGItZjM4OS00MmIxLWJkZGItYTY3MDRhZjQyNmI1YTlhNDZmOTAtYmJjOS00NGFjLTkxMDItMzA3ZjdjOTAzMDA5&x-client-SKU=ID_NET461&x-client-ver=5.3.0.0' },
  { stakeholder: 'Leaders', category: 'Training', country: 'PH', name: 'Sprout Manager Training Module', owner: '', link: 'https://sprout-academy.thinkific.com/courses/sprout-hr-manager-training' },
  { stakeholder: 'Leaders', category: 'Training', country: 'PH', name: 'Sprout Employee Training Module', owner: '', link: 'https://sprout-academy.thinkific.com/courses/sprout-hr-employee-training' },
  { stakeholder: 'All Employees', category: 'Time Keeping', country: 'COL', name: 'Payroll Aleluya', owner: 'HR', link: 'https://tranqui.aleluya.com/novelties_request_history' },
  { stakeholder: 'All Employees', category: 'HR', country: 'US', name: 'Rippling Account', owner: '', link: '' },
  { stakeholder: 'All Employees', category: 'HR', country: 'All countries', name: 'HR Service Desk (Monday.com)', owner: 'HR', link: 'https://wkf.ms/3HK6bac' },
  { stakeholder: 'All Employees', category: 'IT', country: 'All countries', name: 'IT Service Desk (JIRA)', owner: 'IT', link: 'https://boldbusiness.atlassian.net/servicedesk/customer/portals' },
  { stakeholder: 'All Employees', category: 'Policies', country: 'PH', name: 'Leave Application Policy', owner: 'HR', link: 'https://drive.google.com/file/d/13cFY_LaLtD3Xay-OwSMtnrHpisZBEo64/view?ts=63bdb124' },
  { stakeholder: 'All Employees', category: 'Policies', country: 'COL', name: 'Leave Application Policy', owner: 'HR', link: 'https://docs.google.com/document/d/1XVopK5L5VdsJ1d23nNbMwAbu5DKfqJmk/edit?usp=sharing&ouid=110065246222523466622&rtpof=true&sd=true' },
  { stakeholder: 'All Employees', category: 'HR', country: 'PH', name: 'BBPH Referral Program (needs update)', owner: 'Recruiting', link: 'https://docs.google.com/document/d/1gKHSeKb2r1nKstzRMaa-3mF3FJ90MLlZ2X9Kr6rNeU4/edit?usp=sharing' },
  { stakeholder: 'All Employees', category: 'HR', country: 'All countries', name: 'BBPH Referral Program (needs update)', owner: 'Recruiting', link: 'https://docs.google.com/forms/d/e/1FAIpQLSfSSRswifI5R1hm12NNA3IJDIZafeCHgoKoYs9CFai3stUhhw/viewform' },
  { stakeholder: 'All Employees', category: 'Policies', country: 'PH', name: 'Code of Conduct (currently being revamped)', owner: 'HR', link: '' },
  { stakeholder: 'All Employees', category: 'Policies', country: 'COL', name: 'Code of Conduct (currently being revamped)', owner: 'HR', link: '' },
  { stakeholder: 'All Employees', category: 'Policies', country: 'IN', name: 'Code of Conduct (currently being revamped)', owner: 'HR', link: '' },
  { stakeholder: 'All Employees', category: 'General', country: 'All countries', name: 'BB Email Signature', owner: 'HR', link: 'https://docs.google.com/document/d/1u2rorITdyDUWW0OcN4hB_Kijjhbpx-b9b22it61beVI/edit' },
  { stakeholder: 'All Employees', category: 'General', country: 'All countries', name: 'Out of Office Email template', owner: 'HR', link: 'https://docs.google.com/document/d/1U4E2m20rYoKpotzpnfiq90OMGdPIbi8qnNRTJZ8toNU/edit?usp=sharing' },
  { stakeholder: 'All Employees', category: 'HR', country: 'PH', name: 'Bank Information Update form', owner: 'HR', link: 'https://forms.gle/AxoacZb8h6ht9D3H6' },
  { stakeholder: 'All Employees', category: 'HR', country: 'PH', name: 'HMO form', owner: 'HR', link: 'https://docs.google.com/forms/d/e/1FAIpQLSePDb7Ap-Q6OLjUyXXvBir7b9SceG1C44klyDZi1FyGazUmsw/viewform?vc=0&c=0&w=1&flr=0&pli=1' },
  { stakeholder: 'All Employees', category: 'HR', country: 'PH', name: 'GLI form', owner: 'HR', link: 'https://drive.google.com/file/d/11yYMKupr_5cGrcCBqeHtQjEGoV2Y3rFc/view' },
  { stakeholder: 'All Employees', category: 'HR', country: 'PH', name: 'SSS/HDMF Loan Form (Existing/Active Loans)', owner: 'HR', link: 'https://docs.google.com/forms/d/e/1FAIpQLSc-eTrsdK2iPSzATG6xNrmvcOAUpNm0rQyOrHNL14i5wjzoWQ/viewform' },
  { stakeholder: 'Leaders', category: 'Supervisor Tool kit', country: 'All countries', name: 'Coaching Log form', owner: 'HR', link: 'https://docs.google.com/document/d/1TvySizTdxWsCM0XO7t3TSrrAVrX6zNU03dONEufnQvY/edit?usp=sharing' },
  { stakeholder: 'Leaders', category: 'Supervisor Tool kit', country: 'All countries', name: 'Corrective Action Form Implementing Guidelines', owner: 'HR', link: 'https://docs.google.com/document/d/1GNx4XHZwMCNLc5887vKgxaW--PpoaaykCn3N2rejTFo/edit?usp=sharing' },
  { stakeholder: 'Leaders', category: 'Supervisor Tool kit', country: 'All countries', name: 'CAF form', owner: 'HR', link: 'https://docs.google.com/spreadsheets/d/183CWRYqHGhs5ySfAe0KW4MCe1xgF-_b62UksDJ3V5Hs/edit?usp=sharing' },
  { stakeholder: 'Leaders', category: 'Supervisor Tool kit', country: 'All countries', name: 'Performance Improvement Plan Implementing Guidelines', owner: 'HR', link: 'https://docs.google.com/document/d/1x3X0Wg8SrcZskHJzq5HId0pV2aZcu9Ny-ghVJaBcAN8/edit?usp=sharing' },
  { stakeholder: 'Leaders', category: 'Supervisor Tool kit', country: 'All countries', name: 'PIP form', owner: 'HR', link: 'https://docs.google.com/spreadsheets/d/1vF3Doc7A9n0S9icjMGLguIekG4D4L7nfF9JgWt4Rwog/edit?usp=sharing' },
  { stakeholder: 'Leaders', category: 'Supervisor Tool kit', country: 'All countries', name: 'Quickbooks Timesheets manual (supervisory) - needs update', owner: 'IT', link: 'https://docs.google.com/document/d/17zYc0wtkYZFKre6J22q3eFwi03XgjQOtxxV9wXInM6k/edit?tab=t.0' },
  { stakeholder: 'Leaders', category: 'Supervisor Tool kit', country: 'PH', name: 'Performance Evaluation Form (for Probationary)', owner: 'HR', link: 'https://forms.gle/JRaxWuSc1wxbjn1D8' },
  { stakeholder: 'Leaders', category: 'Supervisor Tool kit', country: 'COL', name: 'Performance Evaluation Form (for Probationary)', owner: 'HR', link: 'https://forms.gle/JRaxWuSc1wxbjn1D8' },
  { stakeholder: 'Leaders', category: 'Supervisor Tool kit', country: 'All countries', name: 'Incident Report Form', owner: 'HR', link: 'https://forms.gle/vkQYfamAVWdhLc9H8' },
  { stakeholder: 'All Employees', category: 'Employee Perks / Benefits', country: 'PH', name: 'Laptop Reselling Program', owner: '', link: 'https://forms.gle/9aFhtmwgGwadbchy6' },
];

// Transform CSV data into categories
const getDocumentCategories = () => {
  const categoryMap = new Map();

  csvDocuments.forEach(doc => {
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
      name: doc.name,
      country: doc.country,
      owner: doc.owner,
      link: doc.link,
      stakeholder: doc.stakeholder
    });
  });

  return Array.from(categoryMap.values());
};

const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: any } = {
    'Pre-employment Requirements': Users,
    'Important Tools': FileText,
    'Policies': Building,
    'Time Keeping': Globe,
    'Training': Users,
    'HR': Users,
    'IT': FileText,
    'Supervisor Tool kit': Globe,
    'General': Building,
    'Employee Perks / Benefits': Users
  };
  return iconMap[category] || FileText;
};

const getCategoryColor = (category: string) => {
  const colorMap: { [key: string]: string } = {
    'Pre-employment Requirements': 'blue',
    'Important Tools': 'cyan',
    'Policies': 'purple',
    'Time Keeping': 'green',
    'Training': 'blue',
    'HR': 'cyan',
    'IT': 'purple',
    'Supervisor Tool kit': 'green',
    'General': 'blue',
    'Employee Perks / Benefits': 'cyan'
  };
  return colorMap[category] || 'blue';
};

const documentCategories = getDocumentCategories();

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [hoveredRobot, setHoveredRobot] = useState<boolean>(false);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const robotMessages = [
    "Ready to help you find any document! 📄",
    "I know where everything is stored! 🗂️",
    "Ask me about policies, forms, or procedures! 💼",
    "Your personal document assistant at your service! 🤖",
    "Let's locate that resource together! 🔍"
  ];

  const getRandomMessage = (messages: string[]) => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleRobotHover = () => {
    setHoveredRobot(true);
    setCurrentMessage(getRandomMessage(robotMessages));
  };

  const handleRobotLeave = () => {
    setHoveredRobot(false);
  };

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setShowModal(true);
  };

  const handleExternalLink = (link: string) => {
    if (link && link.trim() !== '') {
      window.open(link, '_blank');
    }
  };

  const handleDownload = (document: any) => {
    // TODO: Implement download functionality with user access rights check
    if (document.link && document.link.trim() !== '') {
      // For now, just open the link - in production this would check user permissions
      window.open(document.link, '_blank');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDocument(null);
  };

  const countries = ['PH', 'COL', 'IN', 'US']; // Exclude "All countries" from filter options
  const owners = ['HR', 'IT', 'Recruiting'];

  const filteredCategories = documentCategories.map(category => ({
    ...category,
    documents: category.documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || category.id === selectedCategory;
      const matchesCountry = selectedCountry === 'all' || doc.country === selectedCountry || doc.country === 'All countries';
      return matchesSearch && matchesCategory && matchesCountry;
    })
  })).filter(category => category.documents.length > 0);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-600 to-blue-500 border-blue-200 bg-blue-50',
      cyan: 'from-cyan-600 to-cyan-500 border-cyan-200 bg-cyan-50',
      purple: 'from-purple-600 to-purple-500 border-purple-200 bg-purple-50',
      green: 'from-green-600 to-green-500 border-green-200 bg-green-50',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getAnimationVariants = () => {
    return {
      animate: {
        y: [0, -15, 0],
        scale: [1, 1.05, 1],
        transition: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1
        }
      }
    };
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <ScrollEffects effect="fadeUp" delay={0.1}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>

            <div className="relative z-10">
              <ScrollEffects effect="fadeUp" delay={0.4}>
                <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                  <TextScramble
                    text="AI-Amplified™ Resources"
                    speed={50}
                  />
                </h1>
              </ScrollEffects>

              <ScrollEffects effect="fadeUp" delay={0.6}>
                <p className="text-xl text-blue-100 mb-6 max-w-3xl">
                  Access your complete document repository with AI-powered search and organization.
                  Find forms, policies, and tools instantly across all countries and departments.
                </p>
              </ScrollEffects>

              <ScrollEffects effect="fadeUp" delay={0.8}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-semibold">{documentCategories.reduce((total, cat) => total + cat.documents.length, 0)} Documents</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
                    <Globe className="h-5 w-5" />
                    <span className="font-semibold">4 Countries</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">All Stakeholders</span>
                  </div>
                </div>
              </ScrollEffects>
            </div>
          </div>
        </ScrollEffects>

        {/* Search and Filter Section */}
        <ScrollEffects effect="fadeUp" delay={1.0}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents, forms, policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
                >
                  <option value="all">All Categories</option>
                  {documentCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
                >
                  <option value="all">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </ScrollEffects>

        {/* Document Categories */}
        <div className="space-y-8">
          {filteredCategories.map((category, categoryIndex) => {
            const Icon = category.icon;
            const colorClasses = getColorClasses(category.color);

            return (
              <ScrollEffects key={category.id} effect="fadeUp" delay={1.2 + categoryIndex * 0.2}>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  {/* Category Header */}
                  <div className={`bg-gradient-to-r ${colorClasses} p-6 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                          <Icon className="h-8 w-8" />
                        </div>
                        <div>
                          <AnimatedText
                            text={category.name}
                            className="text-2xl font-bold"
                            animation="fadeUp"
                            by="word"
                            delay={1.4 + categoryIndex * 0.2}
                          />
                          <p className="text-white/80 mt-1">
                            {category.stakeholder} • {category.documents.length} documents
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/80">Category</div>
                        <div className="font-semibold">{category.stakeholder}</div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.documents.map((document, docIndex) => (
                        <ScrollEffects key={docIndex} effect="scale" delay={1.6 + categoryIndex * 0.2 + docIndex * 0.1}>
                          <div className="group bg-gray-50 hover:bg-blue-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                                  {document.name}
                                </h4>
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {document.country}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {document.owner}
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2 ml-2">
                                <button
                                  onClick={() => handleDownload(document)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Download document"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleExternalLink(document.link)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    document.link && document.link.trim() !== ''
                                      ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-100'
                                      : 'text-gray-300 cursor-not-allowed'
                                  }`}
                                  title={document.link && document.link.trim() !== '' ? "Open in new tab" : "No link available"}
                                  disabled={!document.link || document.link.trim() === ''}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                Owner: {document.owner || 'N/A'}
                              </div>
                              <button
                                onClick={() => handleViewDocument(document)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View Document</span>
                              </button>
                            </div>
                          </div>
                        </ScrollEffects>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollEffects>
            );
          })}
        </div>

        {/* No Results Message */}
        {filteredCategories.length === 0 && (
          <ScrollEffects effect="fadeUp" delay={1.0}>
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No documents found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          </ScrollEffects>
        )}

        {/* AI Assistant Help Section */}
        <ScrollEffects effect="fadeUp" delay={2.0}>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-200/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Need help finding something?
                </h3>
                <p className="text-gray-600 mb-4">
                  Ask our AI assistant to help you locate specific documents, understand policies, or get guidance on procedures.
                </p>
                <button
                  onClick={() => {
                    const event = new CustomEvent('openAISearch');
                    window.dispatchEvent(event);
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  Ask AI Assistant
                </button>
              </div>
              <div className="hidden md:block relative" style={{ marginLeft: '-12px' }}>
                <motion.div
                  className="w-24 h-24 flex items-center justify-center relative z-10"
                  {...getAnimationVariants()}
                  animate={{
                    ...getAnimationVariants().animate,
                    scale: hoveredRobot ? [1, 1.2, 0.9, 1.1, 1] : getAnimationVariants().animate?.scale || 1,
                    x: hoveredRobot ? [0, -3, 3, -3, 3, 0] : 0,
                  }}
                  transition={{
                    scale: { duration: 0.6, repeat: hoveredRobot ? Infinity : 0 },
                    x: { duration: 0.3, repeat: hoveredRobot ? Infinity : 0 },
                    ...getAnimationVariants().animate?.transition
                  }}
                  whileHover={{
                    scale: 1.15,
                    rotate: [0, -5, 5, -5, 0],
                    transition: {
                      scale: { duration: 0.3 },
                      rotate: { duration: 0.6, repeat: Infinity }
                    }
                  }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={handleRobotHover}
                  onMouseLeave={handleRobotLeave}
                >
                  <motion.img
                    src="/images/TRAINING 1.png"
                    alt="AI Training Assistant"
                    className="w-full h-full object-contain scale-150"
                    animate={{
                      filter: hoveredRobot
                        ? ["brightness(1)", "brightness(1.3)", "brightness(1)"]
                        : "brightness(1)"
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: hoveredRobot ? Infinity : 0
                    }}
                  />
                </motion.div>

                {/* Glow effect behind robot */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 opacity-20 blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Chat Bubble - Left top position */}
                <AnimatePresence>
                  {hoveredRobot && currentMessage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute -top-2 -left-48 z-20 max-w-[200px]"
                    >
                      <div className="bg-white rounded-2xl px-3 py-2 shadow-lg border border-gray-200 relative">
                        {/* Floating bubbles */}
                        <div className="absolute -top-1 left-2 w-3 h-3 bg-white rounded-full border border-gray-200"></div>
                        <div className="absolute -top-2 left-4 w-4 h-4 bg-white rounded-full border border-gray-200"></div>
                        <div className="absolute -top-1 right-3 w-2 h-2 bg-white rounded-full border border-gray-200"></div>

                        <div className="text-xs text-gray-700 font-medium text-center relative z-10">
                          {currentMessage}
                        </div>

                        {/* Cloud tail */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <div className="w-3 h-3 bg-white rounded-full border border-gray-200"></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </ScrollEffects>

        {/* Document View Modal */}
        <AnimatePresence>
          {showModal && selectedDocument && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedDocument.name}</h2>
                      <div className="flex items-center space-x-4 text-blue-100">
                        <span className="flex items-center space-x-1">
                          <Globe className="h-4 w-4" />
                          <span>{selectedDocument.country}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{selectedDocument.owner || 'N/A'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{selectedDocument.stakeholder}</span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {selectedDocument.link && selectedDocument.link.trim() !== '' ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Document Preview</h3>
                        <p className="text-blue-700 text-sm mb-4">
                          This document is hosted externally. Click the button below to view it in a new tab.
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleExternalLink(selectedDocument.link)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Open Document</span>
                          </button>
                          <button
                            onClick={() => handleDownload(selectedDocument)}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>

                      {/* Document Link Display */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Document URL:</h4>
                        <div className="bg-white border rounded p-3 text-sm text-gray-600 break-all">
                          {selectedDocument.link}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No Link Available</h3>
                      <p className="text-gray-500">
                        This document doesn't have an associated link yet. Please contact {selectedDocument.owner || 'the document owner'} for access.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
