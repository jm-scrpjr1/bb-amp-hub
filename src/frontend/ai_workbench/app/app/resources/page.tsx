
"use client";

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { ScrollEffects, AnimatedText, ScrollTextReveal } from '@/components/effects';
import { FileText, Download, ExternalLink, Search, Filter, Users, Globe, Building } from 'lucide-react';

// Document repository data based on your table
const documentCategories = [
  {
    id: 'pre-employment',
    name: 'Pre-employment Requirements',
    icon: Users,
    color: 'blue',
    stakeholder: 'New Hires',
    documents: [
      { name: 'Employee Information Form', country: 'PH', owner: 'HR', link: '#' },
      { name: 'Employee Information Form', country: 'COL', owner: 'HR', link: '#' },
      { name: 'Employee Information Form', country: 'IN', owner: 'HR', link: '#' },
      { name: 'Employee Information Form', country: 'US', owner: 'HR', link: '#' },
    ]
  },
  {
    id: 'important-tools',
    name: 'Important Tools',
    icon: FileText,
    color: 'cyan',
    stakeholder: 'All Teams',
    documents: [
      { name: 'Quickbooks Timesheets manual (employee user)', country: 'All countries', owner: 'IT', link: '#' },
      { name: 'Acceptable Use Policy (AUP)', country: 'All countries', owner: 'IT', link: '#' },
      { name: 'Payroll Sprout', country: 'PH', owner: 'HR', link: '#' },
      { name: 'Sprout Manager Training Module', country: 'PH', owner: 'HR', link: '#' },
      { name: 'Sprout Employee Training Module', country: 'PH', owner: 'HR', link: '#' },
      { name: 'Payroll Aleluya', country: 'COL', owner: 'HR', link: '#' },
      { name: 'Rippling Account', country: 'US', owner: 'HR', link: '#' },
      { name: 'HR Service Desk (Monday.com)', country: 'All countries', owner: 'HR', link: '#' },
      { name: 'IT Service Desk (JIRA)', country: 'All countries', owner: 'IT', link: '#' },
    ]
  },
  {
    id: 'reading-manuals',
    name: 'Important Reading Manuals',
    icon: Building,
    color: 'purple',
    stakeholder: 'All Teams',
    documents: [
      { name: 'Leave Application Policy', country: 'PH', owner: 'HR', link: '#' },
      { name: 'Leave Application Policy', country: 'COL', owner: 'HR', link: '#' },
      { name: 'BBPH Referral Program (needs update)', country: 'PH', owner: 'Recruiting', link: '#' },
      { name: 'BBPH Referral Program (needs update)', country: 'All countries', owner: 'Recruiting', link: '#' },
      { name: 'Code of Conduct (currently being revamped)', country: 'PH', owner: 'HR', link: '#' },
      { name: 'Code of Conduct (currently being revamped)', country: 'COL', owner: 'HR', link: '#' },
      { name: 'Code of Conduct (currently being revamped)', country: 'IN', owner: 'HR', link: '#' },
      { name: 'BB Email Signature', country: 'All countries', owner: 'HR', link: '#' },
      { name: 'Out of Office Email template', country: 'All countries', owner: 'HR', link: '#' },
      { name: 'Bank Information Update form', country: 'PH', owner: 'HR', link: '#' },
      { name: 'HMO form', country: 'PH', owner: 'HR', link: '#' },
      { name: 'GLI form', country: 'PH', owner: 'HR', link: '#' },
      { name: 'SSS/HDMF Loan Form (Existing/Active Loans)', country: 'PH', owner: 'HR', link: '#' },
    ]
  },
  {
    id: 'supervisor-toolkit',
    name: 'Supervisor Tool Kit',
    icon: Globe,
    color: 'green',
    stakeholder: 'Leaders',
    documents: [
      { name: 'Coaching Log form', country: 'All countries', owner: 'HR', link: '#' },
      { name: 'Corrective Action Form Implementing Guidelines', country: 'All countries', owner: 'HR', link: '#' },
      { name: 'CAF form', country: 'All countries', owner: 'HR', link: '#' },
      { name: 'Performance Improvement Plan Implementing Guidelines', country: 'All countries', owner: 'HR', link: '#' },
      { name: 'PIP form', country: 'All countries', owner: 'HR', link: '#' },
      { name: 'Quickbooks Timesheets manual (supervisory) - needs update', country: 'All countries', owner: 'IT', link: '#' },
      { name: 'Performance Evaluation Form (for Probationary)', country: 'PH', owner: 'HR', link: '#' },
      { name: 'Performance Evaluation Form (for Probationary)', country: 'COL', owner: 'HR', link: '#' },
      { name: 'Incident Report Form', country: 'All countries', owner: 'HR', link: '#' },
    ]
  }
];

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');

  const countries = ['All countries', 'PH', 'COL', 'IN', 'US'];
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

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <ScrollEffects effect="fadeUp" delay={0.1}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>

            <div className="relative z-10">
              <ScrollTextReveal effect="scramble" delay={0.4}>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  AI-Amplified™ Resources
                </h1>
              </ScrollTextReveal>

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
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                  <Download className="h-4 w-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                  <ExternalLink className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                Last updated: 2 days ago
                              </div>
                              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                View Document
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
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md">
                  Ask AI Assistant
                </button>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🤖</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollEffects>
      </div>
    </MainLayout>
  );
}
