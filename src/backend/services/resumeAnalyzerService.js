const OpenAI = require('openai');
const fs = require('fs');
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

    // TalentFit Assistant ID
    this.assistantId = 'asst_R5RXI0LcyRxsgR80xb05oNQb'; // Using ARIA's assistant for consistency
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
    // Common patterns that indicate a new resume is starting:
    // 1. Email addresses (usually at the top of each resume)
    // 2. Phone numbers in specific formats
    // 3. Multiple consecutive newlines (page breaks)
    // 4. Common resume headers like "RESUME", "CV", "CURRICULUM VITAE"

    // Strategy: Split by patterns that indicate resume boundaries
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emails = text.match(emailPattern) || [];

    console.log(`📧 Detected ${emails.length} email addresses in PDF (potential resume count)`);

    // If only 1 email found, it's likely a single resume
    if (emails.length <= 1) {
      console.log('📄 Single resume detected');
      return [text];
    }

    // Multiple emails found - likely multiple resumes
    console.log(`📚 Multiple resumes detected (${emails.length} candidates)`);

    // Split by finding each email and extracting text around it
    const resumes = [];
    const lines = text.split('\n');
    let currentResume = [];
    let lastEmailIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hasEmail = emailPattern.test(line);
      emailPattern.lastIndex = 0; // Reset regex

      // If we find an email and we already have content, start a new resume
      if (hasEmail && currentResume.length > 0 && i - lastEmailIndex > 10) {
        // Save previous resume
        const resumeText = currentResume.join('\n').trim();
        if (resumeText.length > 100) { // Only save if substantial content
          resumes.push(resumeText);
        }
        // Start new resume
        currentResume = [line];
        lastEmailIndex = i;
      } else {
        currentResume.push(line);
      }
    }

    // Don't forget the last resume
    if (currentResume.length > 0) {
      const resumeText = currentResume.join('\n').trim();
      if (resumeText.length > 100) {
        resumes.push(resumeText);
      }
    }

    console.log(`✅ Split into ${resumes.length} individual resumes`);
    return resumes.length > 0 ? resumes : [text]; // Fallback to original text if splitting failed
  }

  /**
   * Smart chunking: Truncate resume text to stay within token limits
   * Keeps the most important parts: beginning (name, summary, recent experience)
   * and end (skills, education)
   * @param {string} text - Full resume text
   * @param {number} maxTokens - Maximum tokens to keep (default: 2500)
   * @returns {string} Truncated resume text
   */
  smartChunkResume(text, maxTokens = 2500) {
    // Rough estimate: 1 token ≈ 4 characters
    const maxChars = maxTokens * 4;

    if (text.length <= maxChars) {
      // Resume is already short enough
      return text;
    }

    console.log(`✂️ Truncating resume from ${text.length} to ~${maxChars} characters`);

    // Strategy: Keep first 70% and last 30% of allowed length
    const firstPartChars = Math.floor(maxChars * 0.7);
    const lastPartChars = Math.floor(maxChars * 0.3);

    const firstPart = text.substring(0, firstPartChars);
    const lastPart = text.substring(text.length - lastPartChars);

    return `${firstPart}\n\n[... middle section truncated for brevity ...]\n\n${lastPart}`;
  }

  async createThread() {
    try {
      const thread = await this.client.beta.threads.create();
      console.log('🔍 Created new Resume Analyzer thread:', thread.id);
      return thread.id;
    } catch (error) {
      console.error('Error creating Resume Analyzer thread:', error);
      throw error;
    }
  }

  async uploadFile(fileBuffer, fileName) {
    try {
      console.log('📤 Uploading file to OpenAI:', fileName);

      const file = await this.client.files.create({
        file: new File([fileBuffer], fileName, { type: 'application/pdf' }),
        purpose: 'assistants'
      });

      console.log('✅ File uploaded successfully:', file.id);
      return file.id;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async analyzeResumes(jobDescription, clientWords, resumeFiles, userId = null) {
    try {
      console.log('🔍 TalentFit processing request');
      console.log('👤 User ID:', userId || 'anonymous');
      console.log('📄 Number of resumes:', resumeFiles.length);

      // Create new thread
      console.log('🔄 Creating OpenAI thread...');
      const threadId = await this.createThread();
      console.log('✅ Thread created successfully:', threadId);

      // Process resume files - extract text from DOCX, upload PDFs (IN PARALLEL for speed)
      console.log('⚡ Processing all files in parallel for maximum speed...');

      const fileProcessingPromises = resumeFiles.map(async (resumeFile) => {
        const fileExtension = path.extname(resumeFile.originalname).toLowerCase();

        if (fileExtension === '.docx') {
          // Extract text from DOCX
          const extractedText = await this.extractTextFromDocx(resumeFile.buffer);
          console.log(`✅ Extracted text from DOCX: ${resumeFile.originalname}`);
          return {
            type: 'text',
            name: resumeFile.originalname,
            text: extractedText
          };
        } else if (fileExtension === '.pdf') {
          // Extract text from PDF (same as DOCX)
          const extractedText = await this.extractTextFromPdf(resumeFile.buffer);
          console.log(`✅ Extracted text from PDF: ${resumeFile.originalname}`);
          return {
            type: 'text',
            name: resumeFile.originalname,
            text: extractedText
          };
        } else {
          console.warn(`⚠️ Unsupported file type: ${fileExtension}`);
          return null;
        }
      });

      // Wait for all files to be processed in parallel
      const processedFiles = await Promise.all(fileProcessingPromises);

      // All files are now text-based (both DOCX and PDF)
      const resumeTexts = processedFiles
        .filter(f => f && f.type === 'text')
        .map(f => ({ name: f.name, text: f.text }));

      console.log(`✅ Processed ${resumeTexts.length} resume files (DOCX + PDF) with text extraction`);

      // SMART PDF SPLITTING: Detect if any file contains multiple resumes
      console.log('🔍 Checking for multiple resumes in each file...');
      const splitResumes = [];

      resumeTexts.forEach((resume) => {
        // Try to split this file into multiple resumes
        const individualResumes = this.splitMultipleResumes(resume.text);

        if (individualResumes.length > 1) {
          // Multiple resumes found in this file
          console.log(`📚 File "${resume.name}" contains ${individualResumes.length} resumes`);
          individualResumes.forEach((resumeText, resumeIndex) => {
            splitResumes.push({
              name: `${resume.name} - Candidate ${resumeIndex + 1}`,
              text: resumeText
            });
          });
        } else {
          // Single resume in this file
          splitResumes.push({
            name: resume.name,
            text: individualResumes[0]
          });
        }
      });

      console.log(`✅ Total resumes after splitting: ${splitResumes.length}`);

      // Apply smart chunking to each resume to stay within TPM limits
      console.log('✂️ Applying smart chunking to resumes to optimize token usage...');
      const chunkedResumes = splitResumes.map(resume => ({
        name: resume.name,
        text: this.smartChunkResume(resume.text, 2500) // Max 2500 tokens per resume
      }));

      // Calculate total estimated tokens
      const totalChars = chunkedResumes.reduce((sum, r) => sum + r.text.length, 0);
      const estimatedTokens = Math.ceil(totalChars / 4);
      console.log(`📊 Estimated input tokens after chunking: ~${estimatedTokens} (${chunkedResumes.length} resumes)`);

      // Build resume content string from all chunked texts
      let resumeContent = '';
      if (chunkedResumes.length > 0) {
        resumeContent = '\n\nRESUMES (extracted from uploaded files):\n';
        chunkedResumes.forEach((resume, index) => {
          resumeContent += `\n--- Resume ${index + 1}: ${resume.name} ---\n${resume.text}\n`;
        });
      }

      // Create the analysis prompt
      const analysisPrompt = `You are an expert recruiter and talent analyst. Analyze the following resumes against the job requirements and client's own words/preferences.

JOB DESCRIPTION:
${jobDescription}

CLIENT'S OWN WORDS (from interview/call transcripts):
${clientWords}
${resumeContent}

Please analyze each resume and provide:
1. A match score (0-100) for each candidate
2. Key strengths aligned with the job and client preferences
3. Potential concerns or gaps
4. Overall ranking recommendation

Format your response as JSON with this structure:
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
  ],
  "topCandidate": "Name of best match",
  "analysis": "Overall analysis and recommendations"
}`;

      // Add message to thread (no file attachments needed - all text is in prompt)
      await this.client.beta.threads.messages.create(
        threadId,
        {
          role: 'user',
          content: analysisPrompt
        }
      );

      console.log('💬 Analysis message added to thread');

      // Run the assistant with reduced token limit to stay within TPM limits
      console.log('🔄 Creating assistant run...');
      const run = await this.client.beta.threads.runs.create(
        threadId,
        {
          assistant_id: this.assistantId,
          max_completion_tokens: 5000  // Reduced to stay within 30k TPM limit
        }
      );

      console.log('🏃 Started TalentFit run:', run.id);

      // Poll for completion
      let runStatus = await this.client.beta.threads.runs.retrieve(
        run.id,
        { thread_id: threadId }
      );

      let attempts = 0;
      const maxAttempts = 120; // 2 minutes max

      while (runStatus.status !== 'completed' && attempts < maxAttempts) {
        if (runStatus.status === 'failed') {
          console.error('❌ OpenAI Assistant run failed:', JSON.stringify(runStatus, null, 2));
          throw new Error(`Resume analysis failed: ${runStatus.last_error?.message || 'Unknown error'}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await this.client.beta.threads.runs.retrieve(
          run.id,
          { thread_id: threadId }
        );
        attempts++;
      }

      if (runStatus.status !== 'completed') {
        throw new Error('Resume analysis timed out');
      }

      console.log('✅ TalentFit analysis completed');

      // Get the response
      const messages = await this.client.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find(msg => msg.role === 'assistant');

      if (!assistantMessage) {
        throw new Error('No response from assistant');
      }

      const responseText = assistantMessage.content[0]?.text?.value || 'No response generated';

      console.log('✅ TalentFit responded');
      console.log('📄 Raw response preview:', responseText.substring(0, 200));

      // Parse JSON response
      let parsedResponse;
      try {
        // Try to extract JSON from markdown code blocks first
        const codeBlockMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          console.log('📦 Found JSON in code block');
          parsedResponse = JSON.parse(codeBlockMatch[1]);
        } else {
          // Try to find JSON object in the text
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            console.log('📦 Found JSON object in text');
            parsedResponse = JSON.parse(jsonMatch[0]);
          } else {
            console.log('📦 Attempting to parse entire response as JSON');
            parsedResponse = JSON.parse(responseText);
          }
        }
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        console.error('📄 Response text:', responseText);
        return {
          success: true,
          analysis: {
            candidates: [],
            topCandidate: 'Unknown',
            analysis: responseText,
            error: 'Failed to parse JSON response'
          },
          threadId: threadId,
          format: 'text'
        };
      }

      console.log('✅ Parsed analysis response successfully');

      return {
        success: true,
        analysis: parsedResponse,
        threadId: threadId,
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

