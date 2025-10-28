import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, Sparkles, TrendingUp, Award, AlertCircle } from 'lucide-react';

const TalentFitModal = ({ isOpen, onClose }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [clientWords, setClientWords] = useState('');
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const resumeInputRef = useRef(null);

  const handleAddResume = (event) => {
    const files = Array.from(event.target.files);
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    const validFiles = files.filter(file => validTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      alert('Please upload only PDF or DOCX files');
    }
    
    setUploadedResumes(prev => [...prev, ...validFiles]);
  };

  const handleRemoveResume = (index) => {
    setUploadedResumes(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!jobDescription || !clientWords || uploadedResumes.length === 0) {
      alert('Please fill in all fields and upload at least one resume');
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('jobDescription', jobDescription);
      formData.append('clientWords', clientWords);
      
      uploadedResumes.forEach((file) => {
        formData.append('resumes', file);
      });

      const response = await fetch('https://api.boldbusiness.com/api/public/talentfit/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.analysis);
      } else {
        alert('Analysis failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze resumes. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setJobDescription('');
    setClientWords('');
    setUploadedResumes([]);
    setAnalysisResult(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl"
        onClick={onClose}
      >
        {/* Animated Particles Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-cyan-400/30"
          style={{
            boxShadow: '0 0 60px rgba(6, 229, 236, 0.3), inset 0 0 60px rgba(6, 229, 236, 0.1)'
          }}
        >
          {/* Animated Border Glow */}
          <div className="absolute inset-0 rounded-3xl opacity-50 pointer-events-none">
            <motion.div
              className="absolute inset-0 rounded-3xl"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(6, 229, 236, 0.3)',
                  '0 0 40px rgba(6, 229, 236, 0.6)',
                  '0 0 20px rgba(6, 229, 236, 0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full transition-all duration-300 border border-cyan-400/30 hover:border-cyan-400/60 group"
            style={{
              boxShadow: '0 0 20px rgba(6, 229, 236, 0.3)'
            }}
          >
            <X className="w-6 h-6 text-cyan-300 group-hover:text-cyan-100 transition-colors" />
          </button>

          {/* Content */}
          <div className="relative z-10 p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(6, 229, 236, 0.5)',
                    '0 0 40px rgba(6, 229, 236, 0.8)',
                    '0 0 20px rgba(6, 229, 236, 0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">
                  TalentFit
                </h2>
                <p className="text-cyan-100/70 text-sm mt-1">
                  Intelligently rank candidates against job requirements and client fit
                </p>
              </div>
            </div>

            {!analysisResult ? (
              <div className="space-y-6">
                {/* Job Description */}
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-cyan-300 mb-3">
                    <FileText className="w-5 h-5" />
                    Job Description & Requirements
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the complete job description including required skills, experience, and qualifications..."
                    className="w-full h-32 px-4 py-3 bg-slate-800/50 border-2 border-cyan-400/30 rounded-xl text-cyan-100 placeholder-cyan-100/30 focus:outline-none focus:border-cyan-400/60 transition-all duration-300 backdrop-blur-sm resize-none"
                    style={{
                      boxShadow: '0 0 20px rgba(6, 229, 236, 0.1)'
                    }}
                  />
                </div>

                {/* Client's Own Words */}
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-cyan-300 mb-3">
                    <Sparkles className="w-5 h-5" />
                    Client's Own Words (Interview Transcripts)
                  </label>
                  <textarea
                    value={clientWords}
                    onChange={(e) => setClientWords(e.target.value)}
                    placeholder="Paste client preferences, interview notes, or call transcripts to understand what they're really looking for..."
                    className="w-full h-32 px-4 py-3 bg-slate-800/50 border-2 border-cyan-400/30 rounded-xl text-cyan-100 placeholder-cyan-100/30 focus:outline-none focus:border-cyan-400/60 transition-all duration-300 backdrop-blur-sm resize-none"
                    style={{
                      boxShadow: '0 0 20px rgba(6, 229, 236, 0.1)'
                    }}
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-cyan-300 mb-3">
                    <Upload className="w-5 h-5" />
                    Candidate Resumes ({uploadedResumes.length})
                  </label>
                  <div className="border-2 border-dashed border-cyan-400/30 rounded-xl p-8 text-center bg-slate-800/30 backdrop-blur-sm hover:border-cyan-400/60 transition-all duration-300"
                    style={{
                      boxShadow: '0 0 20px rgba(6, 229, 236, 0.1)'
                    }}
                  >
                    <input
                      ref={resumeInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.docx"
                      onChange={handleAddResume}
                      className="hidden"
                    />
                    <motion.button
                      onClick={() => resumeInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-cyan-400 hover:to-emerald-400 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        boxShadow: '0 0 30px rgba(6, 229, 236, 0.5)'
                      }}
                    >
                      <Upload className="w-5 h-5" />
                      Add Resumes
                    </motion.button>
                    <p className="text-sm text-cyan-100/50 mt-3">
                      Upload multiple resumes (PDF or DOCX)
                    </p>
                  </div>

                  {/* Uploaded Resumes List */}
                  {uploadedResumes.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedResumes.map((file, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-cyan-400/20 backdrop-blur-sm"
                          style={{
                            boxShadow: '0 0 15px rgba(6, 229, 236, 0.1)'
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-cyan-400" />
                            <span className="text-sm text-cyan-100">{file.name}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveResume(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Analyze Button */}
                <motion.button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full py-5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-cyan-400 hover:to-emerald-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
                  whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
                  style={{
                    boxShadow: '0 0 40px rgba(6, 229, 236, 0.6)'
                  }}
                >
                  {isAnalyzing ? (
                    <>
                      <motion.div
                        className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Analyzing Candidates...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Analyze & Rank Candidates
                    </>
                  )}
                </motion.button>
              </div>
            ) : (
              // Results Display
              <div className="space-y-6">
                {/* Top Candidate Banner */}
                {analysisResult.topCandidate && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-400/50 rounded-2xl p-6 backdrop-blur-sm"
                    style={{
                      boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-8 h-8 text-emerald-300" />
                      <h3 className="text-2xl font-bold text-emerald-300">Top Candidate</h3>
                    </div>
                    <p className="text-cyan-100 text-lg">{analysisResult.topCandidate}</p>
                  </motion.div>
                )}

                {/* Overall Analysis */}
                {analysisResult.analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/50 border border-cyan-400/30 rounded-2xl p-6 backdrop-blur-sm"
                    style={{
                      boxShadow: '0 0 20px rgba(6, 229, 236, 0.2)'
                    }}
                  >
                    <h3 className="text-xl font-bold text-cyan-300 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6" />
                      Overall Analysis
                    </h3>
                    <p className="text-cyan-100/80 leading-relaxed">{analysisResult.analysis}</p>
                  </motion.div>
                )}

                {/* Candidates List */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    Ranked Candidates
                  </h3>
                  {analysisResult.candidates?.map((candidate, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="bg-slate-800/50 border border-cyan-400/30 rounded-2xl p-6 hover:border-cyan-400/60 transition-all duration-300 backdrop-blur-sm"
                      style={{
                        boxShadow: '0 0 20px rgba(6, 229, 236, 0.1)'
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold text-cyan-300">#{index + 1}</span>
                            <h4 className="text-xl font-bold text-cyan-100">{candidate.name}</h4>
                          </div>
                          <p className="text-cyan-100/70 text-sm">{candidate.summary}</p>
                        </div>
                        <div className="text-right ml-4">
                          <motion.div
                            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300"
                            animate={{
                              textShadow: [
                                '0 0 10px rgba(6, 229, 236, 0.5)',
                                '0 0 20px rgba(6, 229, 236, 0.8)',
                                '0 0 10px rgba(6, 229, 236, 0.5)',
                              ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {candidate.matchScore}%
                          </motion.div>
                          <div className={`text-sm font-semibold mt-1 ${
                            candidate.recommendation === 'Strong fit' ? 'text-emerald-400' :
                            candidate.recommendation === 'Good fit' ? 'text-cyan-400' :
                            candidate.recommendation === 'Moderate fit' ? 'text-yellow-400' :
                            'text-orange-400'
                          }`}>
                            {candidate.recommendation}
                          </div>
                        </div>
                      </div>

                      {/* Strengths */}
                      {candidate.strengths && candidate.strengths.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-emerald-300 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Key Strengths
                          </h5>
                          <ul className="space-y-1">
                            {candidate.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-cyan-100/70 flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">✓</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Concerns */}
                      {candidate.concerns && candidate.concerns.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-orange-300 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Potential Concerns
                          </h5>
                          <ul className="space-y-1">
                            {candidate.concerns.map((concern, idx) => (
                              <li key={idx} className="text-sm text-cyan-100/70 flex items-start gap-2">
                                <span className="text-orange-400 mt-1">!</span>
                                <span>{concern}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    onClick={handleReset}
                    className="flex-1 py-4 bg-slate-700/50 border border-cyan-400/30 text-cyan-300 rounded-xl font-semibold hover:bg-slate-700 hover:border-cyan-400/60 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Analyze New Candidates
                  </motion.button>
                  <motion.button
                    onClick={onClose}
                    className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-cyan-400 hover:to-emerald-400 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      boxShadow: '0 0 30px rgba(6, 229, 236, 0.5)'
                    }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TalentFitModal;

