const OpenAI = require('openai');
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

class ResumeAnalyzerService {
  constructor() {
    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    });

    // Model configuration for two-tier screening
    this.cheapModel = 'gpt-4o-mini'; // For initial screening
    this.accurateModel = 'gpt-4o'; // For top candidates only
  }

  async extractTextFromDocx(fileBuffer) {
    try {
      console.log('📄 Extracting text from DOCX file...');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      console.log('✅ DOCX text extracted successfully');
      return result.value;
    } catch (error) {
      console.error('Error extracting DOCX text:', error);
      throw new Error(`Failed to extract text from DOCX: ${error.message}`);
    }
  }

  async extractTextFromPdf(fileBuffer) {
    try {
      console.log('📄 Extracting text from PDF file...');
      const data = await pdfParse(fileBuffer);
      console.log('✅ PDF text extracted successfully');
      console.log(`📊 Extracted ${data.numpages} pages, ~${data.text.length} characters`);
      return data.text;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Smart PDF Splitting: Detect and split multiple resumes in a single PDF
   * Looks for common resume boundary patterns (names, contact info, page breaks)
   * @param {string} text - Full PDF text that may contain multiple resumes
   * @returns {Array<string>} Array of individual resume texts
   */
  splitMultipleResumes(text) {
    console.log('🔍 Analyzing PDF for multiple resumes...');

    // STRATEGY 1: Try splitting by page breaks (form feed character \f)
    // This is the most reliable method for PDFs where each resume starts on a new page
    const pageBreakPattern = /\f/g;
    const pageBreaks = text.match(pageBreakPattern) || [];

    if (pageBreaks.length > 0) {
      console.log(`📄 Detected ${pageBreaks.length + 1} pages in PDF`);
      const pages = text.split('\f').filter(page => page.trim().length > 100);

      if (pages.length > 1) {
        console.log(`✅ Split into ${pages.length} resumes by page breaks`);
        return pages;
      }
    }

    // STRATEGY 2: Try splitting by detecting resume headers (name + email pattern)
    // Look for patterns like: Name on one line, followed by email/phone within next 5 lines
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const namePattern = /^[A-Z][a-z]+(?:[\s-][A-Z][a-z]+){1,3}$/;
    const lines = text.split('\n');

    // Find potential resume start positions (name followed by contact info)
    const resumeStarts = [];
    for (let i = 0; i < lines.length - 5; i++) {
      const line = lines[i].trim();

      // Check if this line looks like a name
      if (namePattern.test(line)) {
        // Check if email appears in next 5 lines
        let hasEmail = false;
        for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
          if (emailPattern.test(lines[j])) {
            hasEmail = true;
            break;
          }
        }

        if (hasEmail) {
          // Make sure this isn't too close to the previous resume start
          if (resumeStarts.length === 0 || i - resumeStarts[resumeStarts.length - 1] > 30) {
            resumeStarts.push(i);
          }
        }
      }
      emailPattern.lastIndex = 0; // Reset regex
    }

    if (resumeStarts.length > 1) {
      console.log(`📧 Detected ${resumeStarts.length} resume headers (name + email pattern)`);
      const resumes = [];

      for (let i = 0; i < resumeStarts.length; i++) {
        const startLine = resumeStarts[i];
        const endLine = i < resumeStarts.length - 1 ? resumeStarts[i + 1] : lines.length;
        const resumeText = lines.slice(startLine, endLine).join('\n').trim();

        if (resumeText.length > 200) {
          resumes.push(resumeText);
        }
      }

      if (resumes.length > 1) {
        console.log(`✅ Split into ${resumes.length} resumes by name+email pattern`);
        return resumes;
      }
    }

    // STRATEGY 3: Try splitting by multiple consecutive blank lines (common page separator)
    const multipleBlankLinePattern = /\n\s*\n\s*\n\s*\n/g;
    const sections = text.split(multipleBlankLinePattern).filter(section => section.trim().length > 200);

    if (sections.length > 1) {
      console.log(`✅ Split into ${sections.length} resumes by blank line separators`);
      return sections;
    }

    // No splitting patterns found - treat as single resume
    console.log('📄 Single resume detected (no splitting patterns found)');
    return [text];
  }

  /**
   * 🚀 SMART RESUME PARSING: Extract only key sections to reduce tokens by 50-70%
   * This is where we save MASSIVE amounts of money!
   */
  parseResumeKeyInfo(resumeText) {
    console.log('🔍 Parsing resume to extract key information...');

    const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Extract candidate name - IMPROVED LOGIC
    let candidateName = 'Unknown Candidate';
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;

    // Common words that indicate this is NOT a name
    const skipWords = [
      'resume', 'curriculum', 'vitae', 'cv', 'professional', 'summary',
      'objective', 'profile', 'contact', 'email', 'phone', 'address',
      'skills', 'experience', 'education', 'certification', 'linkedin',
      'github', 'portfolio', 'website', 'mentoring', 'work', 'employment',
      'manager', 'engineer', 'developer', 'analyst', 'administrator', 'specialist',
      'coordinator', 'director', 'consultant', 'architect', 'technician',
      'services', 'infrastructure', 'support', 'senior', 'junior', 'lead',
      'assistant', 'associate', 'officer', 'representative', 'supervisor'
    ];

    // Pattern for a likely name: 2-4 capitalized words, no special chars except spaces/hyphens
    const namePattern = /^[A-Z][a-z]+(?:[\s-][A-Z][a-z]+){1,3}$/;

    for (let i = 0; i < Math.min(15, lines.length); i++) {
      const line = lines[i].trim();

      // Skip empty or very short lines
      if (line.length < 3) continue;

      // Skip lines with common non-name keywords
      const lowerLine = line.toLowerCase();
      if (skipWords.some(word => lowerLine.includes(word))) continue;

      // Skip lines with URLs, emails, or phone numbers
      if (line.includes('@') || line.includes('http') || line.includes('www.') || /\d{3}[-.\s]?\d{3}/.test(line)) continue;

      // Check if line matches name pattern (e.g., "John Doe", "Mary Jane Smith")
      if (namePattern.test(line)) {
        candidateName = line;
        break;
      }

      // If we find an email, check the previous 2 lines for a name
      if (emailPattern.test(line)) {
        for (let j = Math.max(0, i - 2); j < i; j++) {
          const prevLine = lines[j].trim();
          if (namePattern.test(prevLine)) {
            candidateName = prevLine;
            break;
          }
        }
        if (candidateName !== 'Unknown Candidate') break;
      }

      // Fallback: First line that looks like a name (2-4 words, each word capitalized like a name)
      // This is more strict - each word must start with capital and have lowercase letters
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 &&
          words.every(w => /^[A-Z][a-z]+$/.test(w)) &&  // Each word must be like "John" not "JOHN" or "john"
          line.length < 50) {
        candidateName = line;
        break;
      }
    }

    // Extract contact info (email, phone)
    const email = resumeText.match(emailPattern)?.[0] || '';
    const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phone = resumeText.match(phonePattern)?.[0] || '';

    // Extract skills section
    const skills = this.extractSection(resumeText, [
      'skills', 'technical skills', 'core competencies', 'expertise',
      'technologies', 'proficiencies'
    ]);

    // Extract experience section
    const experience = this.extractSection(resumeText, [
      'experience', 'work experience', 'professional experience',
      'employment history', 'work history'
    ]);

    // Extract education section
    const education = this.extractSection(resumeText, [
      'education', 'academic background', 'qualifications', 'degrees'
    ]);

    // Extract certifications
    const certifications = this.extractSection(resumeText, [
      'certifications', 'certificates', 'licenses', 'professional development'
    ]);

    // Build condensed resume (only key info)
    const condensedResume = {
      name: candidateName,
      contact: { email, phone },
      skills: skills.substring(0, 1000), // Limit to 1000 chars (~250 tokens)
      experience: experience.substring(0, 2000), // Limit to 2000 chars (~500 tokens)
      education: education.substring(0, 500), // Limit to 500 chars (~125 tokens)
      certifications: certifications.substring(0, 500) // Limit to 500 chars (~125 tokens)
    };

    const estimatedTokens = Math.ceil(
      (condensedResume.skills.length +
       condensedResume.experience.length +
       condensedResume.education.length +
       condensedResume.certifications.length) / 4
    );

    console.log(`✅ Parsed resume: ${candidateName}`);
    console.log(`📊 Estimated tokens: ~${estimatedTokens} (vs ~${Math.ceil(resumeText.length / 4)} original)`);
    console.log(`💰 Token reduction: ${Math.round((1 - estimatedTokens / (resumeText.length / 4)) * 100)}%`);

    return condensedResume;
  }

  /**
   * Extract a specific section from resume text
   */
  extractSection(text, sectionHeaders) {
    const lines = text.split('\n');
    let sectionContent = [];
    let inSection = false;
    let sectionStarted = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();

      // Check if this line is a section header we're looking for
      const isTargetSection = sectionHeaders.some(header =>
        lowerLine === header ||
        lowerLine.startsWith(header + ':') ||
        lowerLine.startsWith(header + ' ')
      );

      if (isTargetSection) {
        inSection = true;
        sectionStarted = true;
        continue; // Skip the header itself
      }

      // Check if we've hit a different section (common section headers)
      const isOtherSection = /^(summary|objective|experience|education|skills|certifications|projects|awards|references|interests|hobbies)/i.test(lowerLine);

      if (sectionStarted && isOtherSection && !sectionHeaders.some(h => lowerLine.includes(h))) {
        inSection = false;
      }

      // Collect lines in the target section
      if (inSection && line.length > 0) {
        sectionContent.push(line);
      }
    }

    return sectionContent.join('\n').trim();
  }

  /**
   * 🚀 OPTIMIZED: Screen resumes with a specific model using Chat Completions API
   * This replaces the expensive Assistants API!
   */
  async screenWithModel(model, jobDescription, clientWords, parsedResumes, analysisType = 'initial') {
    console.log(`🤖 Using ${model} for ${analysisType} analysis...`);

    // Build condensed resume content
    const resumeContent = parsedResumes.map((resume, index) => {
      return `
--- CANDIDATE ${index + 1}: ${resume.name} ---
Contact: ${resume.contact.email} ${resume.contact.phone}

SKILLS:
${resume.skills}

EXPERIENCE:
${resume.experience}

EDUCATION:
${resume.education}

CERTIFICATIONS:
${resume.certifications}
`;
    }).join('\n');

    // Calculate token estimate
    const promptLength = jobDescription.length + clientWords.length + resumeContent.length;
    const estimatedInputTokens = Math.ceil(promptLength / 4);
    console.log(`📊 Estimated input tokens: ~${estimatedInputTokens}`);

    // Build prompt based on analysis type
    const systemPrompt = analysisType === 'deep'
      ? `You are an expert executive recruiter with 20+ years of experience in talent assessment. Provide detailed, nuanced analysis of candidates.`
      : `You are an experienced recruiter. Provide quick, accurate initial screening of candidates.`;

    const userPrompt = `Analyze the following candidates against the job requirements and client preferences.

JOB DESCRIPTION:
${jobDescription}

CLIENT'S PREFERENCES (from interviews/calls):
${clientWords}

CANDIDATES:
${resumeContent}

${analysisType === 'deep'
  ? 'Provide DETAILED analysis for each candidate including specific examples from their experience that match the requirements.'
  : 'Provide CONCISE initial screening scores and key highlights for each candidate.'}

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "candidates": [
    {
      "name": "Candidate Name",
      "matchScore": 85,
      "strengths": ["strength1", "strength2", "strength3"],
      "concerns": ["concern1", "concern2"],
      "summary": "Brief summary of fit",
      "recommendation": "Strong fit" | "Good fit" | "Moderate fit" | "Poor fit"
    }
  ]
}`;

    try {
      const startTime = Date.now();

      const response = await this.client.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent scoring
        response_format: { type: 'json_object' } // Force JSON response
      });

      const duration = Date.now() - startTime;
      const usage = response.usage;

      console.log(`✅ ${model} analysis complete in ${duration}ms`);
      console.log(`📊 Token usage: ${usage.prompt_tokens} input + ${usage.completion_tokens} output = ${usage.total_tokens} total`);
      console.log(`💰 Estimated cost: $${this.calculateCost(model, usage.prompt_tokens, usage.completion_tokens).toFixed(4)}`);

      const result = JSON.parse(response.choices[0].message.content);
      return result.candidates || [];

    } catch (error) {
      console.error(`❌ Error with ${model}:`, error);
      throw error;
    }
  }

  /**
   * Calculate cost based on model and token usage
   */
  calculateCost(model, inputTokens, outputTokens) {
    const pricing = {
      'gpt-4o-mini': { input: 0.00015 / 1000, output: 0.0006 / 1000 }, // $0.15/$0.60 per 1M tokens
      'gpt-4o': { input: 0.0025 / 1000, output: 0.01 / 1000 } // $2.50/$10 per 1M tokens
    };

    const rates = pricing[model] || pricing['gpt-4o'];
    return (inputTokens * rates.input) + (outputTokens * rates.output);
  }

  /**
   * 🎯 TWO-TIER SCREENING: Use cheap model first, accurate model for top candidates
   */
  async screenResumesWithChatAPI(jobDescription, clientWords, parsedResumes) {
    console.log('🎯 Starting two-tier screening process...');
    console.log(`� Screening ${parsedResumes.length} candidates`);

    // TIER 1: Initial screening with gpt-4o-mini (CHEAP!)
    console.log('💰 TIER 1: Initial screening with gpt-4o-mini...');

    const tier1Results = await this.screenWithModel(
      this.cheapModel,
      jobDescription,
      clientWords,
      parsedResumes,
      'initial'
    );

    // Sort by match score and get top 3
    const topCandidates = tier1Results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    console.log(`✅ TIER 1 complete. Top 3 candidates: ${topCandidates.map(c => c.name).join(', ')}`);

    // TIER 2: Deep analysis of top 3 with gpt-4o (ACCURATE!)
    console.log('🎯 TIER 2: Deep analysis of top 3 with gpt-4o...');

    // Extract candidate indices from names like "Candidate 18"
    const topCandidateResumes = topCandidates.map(c => {
      const match = c.name.match(/Candidate (\d+)/);
      if (match) {
        const index = parseInt(match[1]) - 1; // Convert to 0-based index
        return parsedResumes[index];
      }
      // Fallback: try to find by exact name match
      return parsedResumes.find(r => r.name === c.name);
    }).filter(r => r !== undefined); // Remove any undefined entries

    const tier2Results = await this.screenWithModel(
      this.accurateModel,
      jobDescription,
      clientWords,
      topCandidateResumes,
      'deep'
    );

    // Map Tier 2 results back to actual resume names
    // Tier 2 results have names like "Candidate 1", "Candidate 2", "Candidate 3"
    // We need to map them to the actual resume names from topCandidateResumes
    const tier2WithRealNames = tier2Results.map((result, index) => {
      const actualResume = topCandidateResumes[index];
      return {
        ...result,
        name: actualResume?.name || result.name,
        tier: 'deep_analysis'
      };
    });

    // Merge results: Tier 2 for top 3, Tier 1 for the rest
    const finalResults = parsedResumes.map(resume => {
      // Check if this resume got Tier 2 analysis
      const tier2Result = tier2WithRealNames.find(r => r.name === resume.name);
      if (tier2Result) {
        return tier2Result;
      }
      // Otherwise use Tier 1 result
      const tier1Result = tier1Results.find(r => {
        // Match by "Candidate X" format
        const match = r.name.match(/Candidate (\d+)/);
        if (match) {
          const index = parseInt(match[1]) - 1;
          return parsedResumes[index]?.name === resume.name;
        }
        return r.name === resume.name;
      });
      return { ...tier1Result, name: resume.name, tier: 'initial_screening' };
    });

    console.log('✅ Two-tier screening complete!');

    return {
      candidates: finalResults.sort((a, b) => b.matchScore - a.matchScore),
      topCandidate: tier2WithRealNames[0]?.name || topCandidates[0]?.name,
      analysis: `Screened ${parsedResumes.length} candidates using two-tier approach. Top 3 received deep analysis with ${this.accurateModel}.`
    };
  }

  /**
   * 🚀 OPTIMIZED analyzeResumes: Uses Chat Completions API + Two-Tier Screening
   * Cost reduction: 80-90% compared to Assistants API!
   */
  async analyzeResumes(jobDescription, clientWords, resumeFiles, userId = null) {
    try {
      console.log('� TalentFit OPTIMIZED processing request');
      console.log('👤 User ID:', userId || 'anonymous');
      console.log('📄 Number of resumes:', resumeFiles.length);

      // STEP 1: Extract text from all files (IN PARALLEL for speed)
      console.log('⚡ STEP 1: Extracting text from all files in parallel...');

      const fileProcessingPromises = resumeFiles.map(async (resumeFile) => {
        const fileExtension = path.extname(resumeFile.originalname).toLowerCase();

        if (fileExtension === '.docx') {
          const extractedText = await this.extractTextFromDocx(resumeFile.buffer);
          console.log(`✅ Extracted text from DOCX: ${resumeFile.originalname}`);
          return {
            name: resumeFile.originalname,
            text: extractedText
          };
        } else if (fileExtension === '.pdf') {
          const extractedText = await this.extractTextFromPdf(resumeFile.buffer);
          console.log(`✅ Extracted text from PDF: ${resumeFile.originalname}`);
          return {
            name: resumeFile.originalname,
            text: extractedText
          };
        } else {
          console.warn(`⚠️ Unsupported file type: ${fileExtension}`);
          return null;
        }
      });

      const processedFiles = await Promise.all(fileProcessingPromises);
      const resumeTexts = processedFiles.filter(f => f !== null);

      console.log(`✅ Extracted text from ${resumeTexts.length} files`);

      // STEP 2: Split multi-resume files
      console.log('🔍 STEP 2: Checking for multiple resumes in each file...');
      const splitResumes = [];

      resumeTexts.forEach((resume) => {
        const individualResumes = this.splitMultipleResumes(resume.text);

        if (individualResumes.length > 1) {
          console.log(`📚 File "${resume.name}" contains ${individualResumes.length} resumes`);
          individualResumes.forEach((resumeText, resumeIndex) => {
            splitResumes.push({
              name: `${resume.name} - Candidate ${resumeIndex + 1}`,
              text: resumeText
            });
          });
        } else {
          splitResumes.push({
            name: resume.name,
            text: individualResumes[0]
          });
        }
      });

      console.log(`✅ Total resumes after splitting: ${splitResumes.length}`);

      // STEP 3: Parse resumes to extract only key information (MASSIVE token savings!)
      console.log('🔍 STEP 3: Parsing resumes to extract key information...');
      const parsedResumes = splitResumes.map(resume => this.parseResumeKeyInfo(resume.text));

      console.log(`✅ Parsed ${parsedResumes.length} resumes with smart extraction`);

      // STEP 4: Run two-tier screening with Chat Completions API
      console.log('🎯 STEP 4: Running two-tier screening...');
      const analysisResult = await this.screenResumesWithChatAPI(
        jobDescription,
        clientWords,
        parsedResumes
      );

      console.log('✅ TalentFit OPTIMIZED analysis complete!');
      console.log(`🏆 Top candidate: ${analysisResult.topCandidate}`);

      return {
        success: true,
        analysis: analysisResult,
        format: 'json'
      };

    } catch (error) {
      console.error('❌ TalentFit error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ResumeAnalyzerService;

