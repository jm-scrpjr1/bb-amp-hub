const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { File } = require('@web-std/file');
const { Blob } = require('@web-std/blob');
const puppeteer = require('puppeteer');

// Polyfill File and Blob for Node.js < 20
if (typeof globalThis.File === 'undefined') {
  globalThis.File = File;
}
if (typeof globalThis.Blob === 'undefined') {
  globalThis.Blob = Blob;
}

class ResumeBuilderService {
  constructor() {
    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    });

    // Resume Builder Assistant ID (Enhanced version with JSON output)
    this.assistantId = 'asst_QKKMPc2rfE8O6gHx25WCugzo';

    // Store active threads
    this.activeThreads = new Map();
  }

  async createThread() {
    try {
      const thread = await this.client.beta.threads.create();
      console.log('📄 Created new Resume Builder thread:', thread.id);
      return thread.id;
    } catch (error) {
      console.error('Error creating Resume Builder thread:', error);
      throw error;
    }
  }

  async uploadFile(fileBuffer, fileName) {
    try {
      console.log('📤 Uploading file to OpenAI:', fileName);

      // Determine MIME type based on file extension
      const mimeType = fileName.toLowerCase().endsWith('.pdf')
        ? 'application/pdf'
        : 'application/octet-stream';

      // Create a File object from buffer using the polyfilled File class
      const fileObj = new File([fileBuffer], fileName, { type: mimeType });

      console.log('📋 File details:', {
        name: fileObj.name,
        size: fileObj.size,
        type: fileObj.type
      });

      const file = await this.client.files.create({
        file: fileObj,
        purpose: 'assistants'
      });

      console.log('✅ File uploaded successfully:', file.id);
      return file.id;
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async processResume(message, threadId = null, fileId = null, userId = null) {
    try {
      console.log('📄 Resume Builder processing request');
      console.log('🧵 Thread ID:', threadId || 'new');
      console.log('📎 File ID:', fileId || 'none');
      console.log('👤 User ID:', userId || 'anonymous');

      // Create new thread if not provided
      let currentThreadId = threadId;
      if (!currentThreadId || currentThreadId === 'new') {
        currentThreadId = await this.createThread();
      }

      // Add message to thread with file attachment if provided
      const messageParams = {
        role: 'user',
        content: message
      };

      if (fileId) {
        messageParams.attachments = [{
          file_id: fileId,
          tools: [{ type: 'file_search' }]
        }];
      }

      await this.client.beta.threads.messages.create(
        currentThreadId,
        messageParams
      );

      console.log('💬 Message added to thread');

      // Run the assistant
      const run = await this.client.beta.threads.runs.create(
        currentThreadId,
        {
          assistant_id: this.assistantId
        }
      );

      console.log('🏃 Started Resume Builder run:', run.id);
      console.log('🔍 Retrieving run status for thread:', currentThreadId, 'run:', run.id);

      // Poll for completion
      let runStatus = await this.client.beta.threads.runs.retrieve(
        run.id,
        { thread_id: currentThreadId }
      );

      let attempts = 0;
      const maxAttempts = 60; // 60 seconds max wait

      while (runStatus.status !== 'completed' && attempts < maxAttempts) {
        if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
          console.error('❌ Run failed with status:', runStatus.status);
          throw new Error(`Assistant run ${runStatus.status}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await this.client.beta.threads.runs.retrieve(
          run.id,
          { thread_id: currentThreadId }
        );
        attempts++;
        console.log(`⏳ Run status: ${runStatus.status} (${attempts}/${maxAttempts})`);
      }

      if (runStatus.status !== 'completed') {
        throw new Error('Assistant run timed out');
      }

      // Get the assistant's response
      const messages = await this.client.beta.threads.messages.list(
        currentThreadId
      );

      const assistantMessage = messages.data.find(
        msg => msg.role === 'assistant' && msg.run_id === run.id
      );

      if (!assistantMessage) {
        throw new Error('No response from assistant');
      }

      const responseText = assistantMessage.content[0]?.text?.value || 'No response generated';

      console.log('✅ Resume Builder responded');
      console.log('📄 Raw response:', responseText.substring(0, 200) + '...');

      // Parse JSON response
      let parsedResponse;
      try {
        // Try to extract JSON from response (in case there's extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          parsedResponse = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        // Fallback to old format
        return {
          success: true,
          response: responseText,
          threadId: currentThreadId,
          format: 'html'
        };
      }

      console.log('✅ Parsed JSON response successfully');
      console.log('📊 Improvements:', parsedResponse.improvements?.length || 0);

      return {
        success: true,
        enhancedHTML: parsedResponse.enhancedHTML,
        improvements: parsedResponse.improvements || [],
        summary: parsedResponse.summary || 'Resume enhanced successfully',
        applicantName: parsedResponse.applicantName || 'Unknown',
        applicantTitle: parsedResponse.applicantTitle || 'Professional',
        threadId: currentThreadId,
        format: 'json'
      };

    } catch (error) {
      console.error('❌ Resume Builder error:', error);
      return {
        success: false,
        error: error.message,
        threadId: threadId
      };
    }
  }

  async generatePDF(htmlContent, applicantName = 'Resume') {
    let browser = null;
    let pdfPath = null;

    try {
      console.log('📄 Generating PDF from HTML...');

      // Create full HTML document with styling
      const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 60px;
    }
    h1 {
      color: #2c3e50;
      font-size: 32px;
      margin-bottom: 5px;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    h5 {
      color: #7f8c8d;
      font-size: 18px;
      font-weight: 500;
      margin-top: 0;
      margin-bottom: 20px;
    }
    h2 {
      color: #2c3e50;
      font-size: 20px;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 5px;
    }
    p {
      margin: 10px 0;
    }
    ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    li {
      margin: 8px 0;
    }
    table {
      width: 100%;
      margin: 15px 0;
      border-collapse: collapse;
    }
    table td {
      padding: 5px 0;
    }
    b {
      color: #2c3e50;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
      `;

      // Generate unique filename with format: "Boldified Resume (INITIALS).pdf"
      const getInitials = (name) => {
        if (!name || name === 'Unknown' || name === 'Resume') {
          return 'XX';
        }
        const words = name.trim().split(/\s+/);
        if (words.length === 1) {
          return words[0].substring(0, 2).toUpperCase();
        }
        return words.map(w => w[0]).join('').toUpperCase().substring(0, 3);
      };

      const initials = getInitials(applicantName);
      const timestamp = Date.now();
      const filename = `Boldified Resume (${initials})_${timestamp}.pdf`;
      pdfPath = path.join(os.tmpdir(), filename);

      // Launch puppeteer and generate PDF
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(fullHTML, { waitUntil: 'networkidle0' });

      await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true
      });

      console.log('✅ PDF generated successfully:', filename);

      return {
        success: true,
        pdfPath: pdfPath,
        filename: filename
      };

    } catch (error) {
      console.error('❌ PDF generation error:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

module.exports = new ResumeBuilderService();

