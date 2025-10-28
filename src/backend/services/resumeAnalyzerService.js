const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class ResumeAnalyzerService {
  constructor() {
    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    });

    // Resume Analyzer Assistant ID
    this.assistantId = 'asst_R5RXI0LcyRxsgR80xb05oNQb'; // Using ARIA's assistant for consistency
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
      console.log('🔍 Resume Analyzer processing request');
      console.log('👤 User ID:', userId || 'anonymous');
      console.log('📄 Number of resumes:', resumeFiles.length);

      // Create new thread
      const threadId = await this.createThread();

      // Upload all resume files
      const uploadedFileIds = [];
      for (const resumeFile of resumeFiles) {
        const fileId = await this.uploadFile(resumeFile.buffer, resumeFile.originalname);
        uploadedFileIds.push(fileId);
      }

      console.log('✅ All files uploaded:', uploadedFileIds.length);

      // Create the analysis prompt
      const analysisPrompt = `You are an expert recruiter and talent analyst. Analyze the following resumes against the job requirements and client's own words/preferences.

JOB DESCRIPTION:
${jobDescription}

CLIENT'S OWN WORDS (from interview/call transcripts):
${clientWords}

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

      console.log('🏃 Started Resume Analyzer run:', run.id);

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

      console.log('✅ Resume analysis completed');

      // Get the response
      const messages = await this.client.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find(msg => msg.role === 'assistant');

      if (!assistantMessage) {
        throw new Error('No response from assistant');
      }

      const responseText = assistantMessage.content[0]?.text?.value || 'No response generated';

      console.log('✅ Resume Analyzer responded');

      // Parse JSON response
      let parsedResponse;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          parsedResponse = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        return {
          success: true,
          response: responseText,
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
      console.error('❌ Resume Analyzer error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ResumeAnalyzerService;

