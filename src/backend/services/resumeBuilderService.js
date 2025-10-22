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

      // Read and convert header image to base64
      // Use absolute path from the services directory
      const headerImagePath = path.resolve(__dirname, '../frontend/react_workbench/public/images/Resume Header.png');
      let headerImageBase64 = '';

      try {
        console.log('🔍 Looking for header image at:', headerImagePath);
        const imageBuffer = fs.readFileSync(headerImagePath);
        headerImageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
        console.log('✅ Header image loaded successfully');
      } catch (imgError) {
        console.warn('⚠️ Could not load header image:', imgError.message);
        console.warn('📂 Tried path:', headerImagePath);
      }

      // Create full HTML document with styling and header
      const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
    }
    .header-image {
      width: 100%;
      display: block;
      margin-bottom: 30px;
    }
    .content {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 60px 40px 60px;
    }
    h1 {
      color: #2c3e50;
      font-size: 32px;
      margin-bottom: 8px;
      border-bottom: 3px solid #6366f1;
      padding-bottom: 10px;
    }
    h5 {
      color: #6b7280;
      font-size: 18px;
      font-weight: 500;
      margin-top: 0;
      margin-bottom: 25px;
    }
    h2 {
      color: #2c3e50;
      font-size: 22px;
      margin-top: 35px;
      margin-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
      font-weight: 600;
    }
    p {
      margin: 12px 0;
      font-size: 14px;
    }
    ul {
      margin: 12px 0;
      padding-left: 25px;
    }
    li {
      margin: 8px 0;
      font-size: 14px;
    }
    table {
      width: 100%;
      margin: 15px 0;
      border-collapse: collapse;
    }
    table td {
      padding: 5px 0;
      vertical-align: top;
    }
    table td:first-child {
      width: 70%;
    }
    table td:last-child {
      width: 30%;
      text-align: right;
      color: #6b7280;
      font-size: 13px;
    }
    b, strong {
      color: #1f2937;
      font-weight: 600;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 10px;
    }
  </style>
</head>
<body>
  ${headerImageBase64 ? `<img src="${headerImageBase64}" alt="Boldified Resume Header" class="header-image" />` : ''}
  <div class="content">
    ${htmlContent}
    <div class="footer">
      Enhanced by Bold Business AI Workbench - Boldified Resume Builder
    </div>
  </div>
</body>
</html>
      `;

      // Generate unique filename with format: "Boldified Resume.pdf"
      const timestamp = Date.now();
      const filename = `Boldified Resume_${timestamp}.pdf`;
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
          top: '10mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm'
        },
        printBackground: true,
        preferCSSPageSize: false
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

