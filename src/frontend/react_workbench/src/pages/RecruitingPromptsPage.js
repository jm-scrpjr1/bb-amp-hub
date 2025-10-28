import React, { useState, useRef, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { ScrollEffects } from '../components/effects';
import { Upload, Download, Loader, FileText, Sparkles, CheckCircle, TrendingUp, X, Users, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const prompts = [
  {
    id: 'resume-builder',
    name: 'Resume Builder',
    description: 'Transform your resume into a professional, ATS-friendly format',
    status: 'live',
    assistantId: 'asst_QKKMPc2rfE8O6gHx25WCugzo',
    icon: FileText,
    color: 'from-purple-600 to-blue-600',
    placeholder: 'Upload your resume (PDF or DOCX) to get started...'
  },
  {
    id: 'resume-analyzer',
    name: 'Resume Analyzer & Ranking',
    description: 'Intelligently rank candidates against job requirements and client fit',
    status: 'live',
    assistantId: 'asst_R5RXI0LcyRxsgR80xb05oNQb',
    icon: Award,
    color: 'from-emerald-600 to-teal-600',
    placeholder: 'Analyze and rank resumes...'
  },
  {
    id: 'ad-headline-refiner',
    name: 'Ad Headline Refiner',
    description: 'Craft compelling ad headlines that convert',
    status: 'coming-soon',
    assistantId: null,
    icon: Sparkles,
    color: 'from-blue-600 to-cyan-600',
    placeholder: 'Coming soon...'
  },
  {
    id: 'sentiment-analyzer',
    name: 'Sentiment Analyzer',
    description: 'Analyze customer feedback and sentiment',
    status: 'coming-soon',
    assistantId: null,
    icon: Sparkles,
    color: 'from-green-600 to-teal-600',
    placeholder: 'Coming soon...'
  },
  {
    id: 'campaign-brief-builder',
    name: 'Campaign Brief Builder',
    description: 'Create comprehensive campaign briefs',
    status: 'coming-soon',
    assistantId: null,
    icon: Sparkles,
    color: 'from-orange-600 to-red-600',
    placeholder: 'Coming soon...'
  }
];

const RecruitingPromptsPage = () => {
  const [selectedPrompt, setSelectedPrompt] = useState(prompts[0]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef(null);

  // Resume Analyzer state
  const [jobDescription, setJobDescription] = useState('');
  const [clientWords, setClientWords] = useState('');
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [analyzerResult, setAnalyzerResult] = useState(null);
  const resumeInputRef = useRef(null);

  useEffect(() => {
    setUploadedFile(null);
    setEnhancedResult(null);
    setShowComparison(false);
    setJobDescription('');
    setClientWords('');
    setUploadedResumes([]);
    setAnalyzerResult(null);
  }, [selectedPrompt]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or DOCX file');
      return;
    }

    setUploadedFile(file);
    setEnhancedResult(null);
  };

  const handleEnhanceResume = async () => {
    if (!uploadedFile) return;
    if (selectedPrompt.status !== 'live') {
      alert('This prompt is coming soon!');
      return;
    }

    setIsProcessing(true);

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      const formData = new FormData();
      formData.append('message', 'Enhance my resume');
      formData.append('threadId', 'new');
      formData.append('userId', user?.email || 'anonymous');
      formData.append('file', uploadedFile);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://api.boldbusiness.com/api'}/resume-builder`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to process resume');
      }

      setEnhancedResult({
        summary: data.summary,
        improvements: data.improvements || [],
        applicantName: data.applicantName,
        applicantTitle: data.applicantTitle,
        pdfUrl: data.pdfUrl,
        pdfFilename: data.pdfFilename,
        originalFileName: uploadedFile.name
      });

      setIsProcessing(false);

    } catch (error) {
      console.error('Error enhancing resume:', error);
      alert(`Error: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!enhancedResult?.pdfUrl) return;

    // pdfUrl already includes /api/download-resume/..., so we just need the base domain
    const downloadUrl = `https://api.boldbusiness.com${enhancedResult.pdfUrl}`;
    window.open(downloadUrl, '_blank');
  };

  const handleReset = () => {
    setUploadedFile(null);
    setEnhancedResult(null);
    setShowComparison(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Resume Analyzer handlers
  const handleAddResume = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadedResumes([...uploadedResumes, ...files]);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = '';
    }
  };

  const handleRemoveResume = (index) => {
    setUploadedResumes(uploadedResumes.filter((_, i) => i !== index));
  };

  const handleAnalyzeResumes = async () => {
    if (!jobDescription.trim() || !clientWords.trim() || uploadedResumes.length === 0) {
      alert('Please fill in all fields and upload at least one resume');
      return;
    }

    setIsProcessing(true);

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      const formData = new FormData();
      formData.append('jobDescription', jobDescription);
      formData.append('clientWords', clientWords);
      formData.append('userId', user?.email || 'anonymous');

      uploadedResumes.forEach((file, index) => {
        formData.append(`resumes`, file);
      });

      const apiUrl = process.env.REACT_APP_API_URL || 'https://api.boldbusiness.com/api';
      console.log('🔍 Resume Analyzer API URL:', `${apiUrl}/resume-analyzer`);

      const response = await fetch(`${apiUrl}/resume-analyzer`, {
        method: 'POST',
        body: formData
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Non-JSON response:', textResponse.substring(0, 500));
        throw new Error(`Server returned non-JSON response (${response.status}). Check console for details.`);
      }

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to analyze resumes');
      }

      setAnalyzerResult(data.analysis);
      setIsProcessing(false);

    } catch (error) {
      console.error('Error analyzing resumes:', error);
      alert(`Error: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const handleResetAnalyzer = () => {
    setJobDescription('');
    setClientWords('');
    setUploadedResumes([]);
    setAnalyzerResult(null);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = '';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <ScrollEffects effect="fadeUp" delay={0.1}>
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              AI-Amplified Recruiting Prompts
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Streamline your recruiting process with AI-powered tools. Select a prompt from the left to get started.
            </p>
          </div>
        </ScrollEffects>

        <ScrollEffects effect="fadeUp" delay={0.2}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
            
            {/* Left Panel - Prompt List */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Available Prompts
              </h2>
              
              <div className="space-y-3">
                {prompts.map((prompt) => {
                  const Icon = prompt.icon;
                  const isSelected = selectedPrompt.id === prompt.id;
                  const isLive = prompt.status === 'live';
                  
                  return (
                    <motion.button
                      key={prompt.id}
                      onClick={() => isLive && setSelectedPrompt(prompt)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-blue-50 shadow-md'
                          : isLive
                          ? 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      }`}
                      whileHover={isLive ? { scale: 1.02 } : {}}
                      whileTap={isLive ? { scale: 0.98 } : {}}
                      disabled={!isLive}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${prompt.color} ${!isLive && 'opacity-50'}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                              {prompt.name}
                            </h3>
                            {isLive ? (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                LIVE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                                SOON
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${isSelected ? 'text-purple-700' : 'text-gray-600'}`}>
                            {prompt.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Right Panel - Resume Builder Interface */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedPrompt.color}`}>
                      {React.createElement(selectedPrompt.icon, { className: 'w-6 h-6 text-white' })}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedPrompt.name}</h2>
                      <p className="text-sm text-gray-600">{selectedPrompt.description}</p>
                    </div>
                  </div>
                  {(enhancedResult || analyzerResult) && (
                    <button
                      onClick={selectedPrompt.id === 'resume-analyzer' ? handleResetAnalyzer : handleReset}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Start New
                    </button>
                  )}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {selectedPrompt.id === 'resume-analyzer' ? (
                  // Resume Analyzer Interface
                  <div className="max-w-4xl mx-auto">
                    {!analyzerResult ? (
                      <div className="space-y-6">
                        {/* Job Description Input */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            📋 Job Description & Requirements
                          </label>
                          <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the complete job description including required skills, experience, and qualifications..."
                            className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                          />
                        </div>

                        {/* Client Words Input */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            🎤 Client's Own Words (Interview Transcripts)
                          </label>
                          <textarea
                            value={clientWords}
                            onChange={(e) => setClientWords(e.target.value)}
                            placeholder="Paste client preferences, interview notes, or call transcripts to understand what they're really looking for..."
                            className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                          />
                        </div>

                        {/* Resume Upload */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            👥 Candidate Resumes ({uploadedResumes.length})
                          </label>
                          <div className="border-2 border-dashed border-emerald-300 rounded-xl p-6 text-center bg-emerald-50">
                            <input
                              ref={resumeInputRef}
                              type="file"
                              multiple
                              accept=".pdf,.docx"
                              onChange={handleAddResume}
                              className="hidden"
                            />
                            <button
                              onClick={() => resumeInputRef.current?.click()}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                            >
                              <Upload className="w-5 h-5" />
                              Add Resumes
                            </button>
                            <p className="text-sm text-gray-600 mt-3">
                              Upload multiple resumes (PDF or DOCX)
                            </p>
                          </div>

                          {/* Uploaded Resumes List */}
                          {uploadedResumes.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {uploadedResumes.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm text-gray-700">{file.name}</span>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveResume(index)}
                                    className="text-red-600 hover:text-red-700 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Analyze Button */}
                        <button
                          onClick={handleAnalyzeResumes}
                          disabled={isProcessing || !jobDescription.trim() || !clientWords.trim() || uploadedResumes.length === 0}
                          className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <>
                              <Loader className="w-5 h-5 animate-spin" />
                              Analyzing Candidates...
                            </>
                          ) : (
                            <>
                              <Award className="w-5 h-5" />
                              Analyze & Rank Candidates
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      // Results View
                      <div className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold text-gray-900">Analysis Results</h3>
                          <button
                            onClick={handleResetAnalyzer}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Analyze New
                          </button>
                        </div>

                        {/* Top Candidate */}
                        {analyzerResult?.topCandidate && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-6"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <Award className="w-6 h-6 text-emerald-600" />
                              <h4 className="text-lg font-bold text-emerald-900">Top Candidate</h4>
                            </div>
                            <p className="text-2xl font-bold text-emerald-700">{analyzerResult.topCandidate}</p>
                          </motion.div>
                        )}

                        {/* Candidates List */}
                        <div className="space-y-4">
                          {analyzerResult?.candidates?.map((candidate, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900">{candidate.name}</h4>
                                  <p className="text-sm text-gray-600">{candidate.summary}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-3xl font-bold text-emerald-600">{candidate.matchScore}%</div>
                                  <div className={`text-sm font-semibold ${
                                    candidate.recommendation === 'Strong fit' ? 'text-emerald-600' :
                                    candidate.recommendation === 'Good fit' ? 'text-blue-600' :
                                    candidate.recommendation === 'Moderate fit' ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}>
                                    {candidate.recommendation}
                                  </div>
                                </div>
                              </div>

                              {/* Strengths */}
                              {candidate.strengths?.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="text-sm font-semibold text-gray-900 mb-2">✅ Strengths</h5>
                                  <div className="space-y-1">
                                    {candidate.strengths.map((strength, idx) => (
                                      <div key={idx} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-700">{strength}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Concerns */}
                              {candidate.concerns?.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-semibold text-gray-900 mb-2">⚠️ Concerns</h5>
                                  <div className="space-y-1">
                                    {candidate.concerns.map((concern, idx) => (
                                      <div key={idx} className="flex items-start gap-2">
                                        <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-700">{concern}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>

                        {/* Overall Analysis */}
                        {analyzerResult?.analysis && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-3">📊 Overall Analysis</h4>
                            <p className="text-gray-700 whitespace-pre-wrap">{analyzerResult.analysis}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : !uploadedFile && !enhancedResult ? (
                  /* Empty State - Upload Prompt */
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${selectedPrompt.color} flex items-center justify-center`}>
                        <Upload className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Upload Your Resume
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Upload your resume in PDF or DOCX format and let AI transform it into a polished, professional document.
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-3 mx-auto"
                      >
                        <Upload className="w-5 h-5" />
                        Choose File
                      </button>
                      <p className="text-xs text-gray-500 mt-4">
                        Supported formats: PDF, DOCX • Max size: 10MB
                      </p>
                    </div>
                  </div>
                ) : uploadedFile && !enhancedResult ? (
                  /* File Uploaded - Ready to Process */
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-lg">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
                      >
                        <CheckCircle className="w-12 h-12 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Resume Uploaded Successfully!
                      </h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3 text-left">
                          <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{uploadedFile.name}</p>
                            <p className="text-sm text-gray-600">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Click the button below to enhance your resume with AI. We'll strengthen action verbs, quantify achievements, and improve readability while keeping all facts 100% accurate.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={handleReset}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEnhanceResume}
                          disabled={isProcessing}
                          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <>
                              <Loader className="w-5 h-5 animate-spin" />
                              Enhancing Resume...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Enhance Resume
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : enhancedResult ? (
                  /* Results - Show Improvements & Download */
                  <div className="space-y-6">
                    {/* Success Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Resume Enhanced Successfully! 🎉
                      </h3>
                      <p className="text-gray-600">{enhancedResult.summary}</p>
                    </motion.div>

                    {/* Improvements List */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <h4 className="font-bold text-gray-900">Key Improvements</h4>
                      </div>
                      <ul className="space-y-2">
                        {enhancedResult.improvements.map((improvement, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{improvement}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* Download Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex gap-3 justify-center"
                    >
                      <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors flex items-center gap-2"
                      >
                        <FileText className="w-5 h-5" />
                        {showComparison ? 'Hide' : 'Show'} Comparison
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-3"
                      >
                        <Download className="w-5 h-5" />
                        Download Enhanced Resume
                      </button>
                    </motion.div>

                    {/* Before/After Comparison */}
                    <AnimatePresence>
                      {showComparison && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-2 gap-4 overflow-hidden"
                        >
                          {/* Before */}
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Before
                              </h5>
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Original</span>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 h-64 overflow-y-auto">
                              <p className="text-sm text-gray-600 italic">
                                Original file: {enhancedResult.originalFileName}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                Your original resume has been analyzed and enhanced with AI-powered improvements.
                              </p>
                            </div>
                          </div>

                          {/* After */}
                          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-300">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                After
                              </h5>
                              <span className="text-xs text-purple-700 bg-purple-200 px-2 py-1 rounded font-medium">Enhanced</span>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-purple-200 h-64 overflow-y-auto">
                              <p className="text-sm font-semibold text-gray-900">
                                {enhancedResult.applicantName !== 'Unknown' ? enhancedResult.applicantName : 'Professional Resume'}
                              </p>
                              {enhancedResult.applicantTitle !== 'Professional' && (
                                <p className="text-xs text-gray-600 mb-2">{enhancedResult.applicantTitle}</p>
                              )}
                              <div className="mt-3 space-y-2">
                                {enhancedResult.improvements.slice(0, 3).map((imp, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-700">{imp}</p>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-purple-600 mt-3 font-medium">
                                ✨ Ready to download!
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </ScrollEffects>
      </div>
    </MainLayout>
  );
};

export default RecruitingPromptsPage;

