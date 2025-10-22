import React, { useState, useRef, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { ScrollEffects } from '../components/effects';
import { Send, Upload, Download, Loader, FileText, Sparkles, CheckCircle, TrendingUp } from 'lucide-react';
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
  const [selectedPrompt, setSelectedPrompt] = useState(prompts[0]); // Default to Resume Builder
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef(null);

  // Reset when switching prompts
  useEffect(() => {
    setUploadedFile(null);
    setEnhancedResult(null);
    setShowComparison(false);
  }, [selectedPrompt]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or DOCX file');
      return;
    }

    setUploadedFile(file);
    setEnhancedResult(null); // Reset previous results
  };

  const handleEnhanceResume = async () => {
    if (!uploadedFile) return;
    if (selectedPrompt.status !== 'live') {
      alert('This prompt is coming soon!');
      return;
    }

    setIsProcessing(true);

    try {
      // Get user email from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('message', 'Enhance my resume');
      formData.append('threadId', 'new');
      formData.append('userId', user?.email || 'anonymous');
      formData.append('file', uploadedFile);

      // Call Resume Builder API
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://api.boldbusiness.com/api'}/resume-builder`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to process resume');
      }

      // Store the enhanced result
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

    const downloadUrl = `${process.env.REACT_APP_API_URL || 'https://api.boldbusiness.com/api'}${enhancedResult.pdfUrl}`;
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

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
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

        {/* Split Panel Layout */}
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

            {/* Right Panel - Chat Interface */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              
              {/* Chat Header */}
              <div className={`p-6 border-b border-gray-100 bg-gradient-to-r ${selectedPrompt.color}`}>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {selectedPrompt.name}
                </h2>
                <p className="text-white/90 text-sm">
                  {selectedPrompt.description}
                </p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${selectedPrompt.color} flex items-center justify-center`}>
                        <FileText className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedPrompt.status === 'live' ? 'Ready to help!' : 'Coming Soon'}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {selectedPrompt.status === 'live' 
                          ? selectedPrompt.placeholder
                          : 'This prompt is currently under development. Check back soon!'}
                      </p>
                      {selectedPrompt.status === 'live' && selectedPrompt.id === 'resume-builder' && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                        >
                          <Upload className="w-5 h-5" />
                          Upload Resume
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                              : message.role === 'system'
                              ? 'bg-blue-50 text-blue-900 border border-blue-200'
                              : message.role === 'error'
                              ? 'bg-red-50 text-red-900 border border-red-200'
                              : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                          <Loader className="w-5 h-5 text-purple-600 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-end gap-3">
                  {selectedPrompt.id === 'resume-builder' && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={selectedPrompt.status !== 'live'}
                        className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Upload file"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  
                  <div className="flex-1">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={selectedPrompt.status === 'live' ? 'Type your message...' : 'This prompt is coming soon...'}
                      disabled={selectedPrompt.status !== 'live' || isLoading}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      rows="2"
                    />
                  </div>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={selectedPrompt.status !== 'live' || isLoading || (!inputMessage.trim() && !uploadedFile)}
                    className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                {uploadedFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="flex-1">{uploadedFile.name}</span>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollEffects>
      </div>
    </MainLayout>
  );
};

export default RecruitingPromptsPage;

