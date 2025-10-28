const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

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
      // For now, we'll send PDF directly to OpenAI
      // OpenAI's file_search tool can handle PDFs
      return null; // Return null to indicate PDF should be uploaded as-is
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw error;
    }
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
      
      const file = await this.client.beta.files.upload({
        file: new File([fileBuffer], fileName, { type: 'application/octet-stream' }),
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
      const threadId = await this.createThread();

      // Process resume files - extract text from DOCX, upload PDFs
      const resumeTexts = [];
      const uploadedFileIds = [];

      for (const resumeFile of resumeFiles) {
        const fileExtension = path.extname(resumeFile.originalname).toLowerCase();

        if (fileExtension === '.docx') {
          // Extract text from DOCX
          const extractedText = await this.extractTextFromDocx(resumeFile.buffer);
          resumeTexts.push({
            name: resumeFile.originalname,
            text: extractedText
          });
          console.log(`✅ Extracted text from DOCX: ${resumeFile.originalname}`);
        } else if (fileExtension === '.pdf') {
          // Upload PDF to OpenAI for file_search
          const fileId = await this.uploadFile(resumeFile.buffer, resumeFile.originalname);
          uploadedFileIds.push(fileId);
          console.log(`✅ Uploaded PDF: ${resumeFile.originalname}`);
        } else {
          console.warn(`⚠️ Unsupported file type: ${fileExtension}`);
        }
      }

      console.log(`✅ Processed ${resumeTexts.length} DOCX files and ${uploadedFileIds.length} PDF files`);

      // Build resume content string from extracted DOCX texts
      let resumeContent = '';
      if (resumeTexts.length > 0) {
        resumeContent = '\n\nRESUMES (extracted from uploaded files):\n';
        resumeTexts.forEach((resume, index) => {
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

      // Add message to thread with file attachments
      const messageParams = {
        role: 'user',
        content: analysisPrompt
      };

      if (uploadedFileIds.length > 0) {
        messageParams.attachments = uploadedFileIds.map(fileId => ({
          file_id: fileId,
          tools: [{ type: 'file_search' }]
        }));
      }

      await this.client.beta.threads.messages.create(
        threadId,
        messageParams
      );

      console.log('💬 Analysis message added to thread');

      // Run the assistant
      const run = await this.client.beta.threads.runs.create(
        threadId,
        {
          assistant_id: this.assistantId
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
          throw new Error('Resume analysis failed');
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

