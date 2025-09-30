# HomeTruth Knowledge Base Admin User Guide

## Overview

The HomeTruth Knowledge Base Admin Interface provides a comprehensive toolkit for managing your homebuying knowledge base. This guide covers all features and workflows available in the admin interface at `/admin/knowledge`.

## Getting Started

### Accessing the Admin Interface

1. Navigate to `http://localhost:3000/admin/knowledge` (or your deployed URL)
2. The interface loads with three main sections:
   - **Add Knowledge**: Upload and manage content
   - **Search Knowledge**: Find and explore existing content
   - **Chatbot**: Test AI responses with your knowledge base

### Interface Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard                          │
├─────────────────────────────────────────────────────────────┤
│  [Add Knowledge] [Search Knowledge] [Chatbot] [×]           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Content input area (forms, results, chat)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Adding Knowledge to the System

### Method 1: File Upload

**Best for**: PDF documents, Word files, text documents

1. **Select File**:

   - Click "Choose File" or drag and drop a file
   - Supported formats: PDF, DOC, DOCX, TXT, MD
   - Maximum file size: 10MB

2. **Auto-fill Information**:

   - File name automatically populates the Document ID field
   - Title field is pre-filled with the filename

3. **AI Metadata Suggestion**:

   - Click "AI Suggest Metadata" after uploading
   - System analyzes content and suggests:
     - Title
     - Category
     - Tags
     - Priority level
     - Source type

4. **Review and Edit**:

   - Verify suggested metadata
   - Modify any fields as needed
   - Add custom tags or categories

5. **Submit**:
   - Click "Add to Knowledge Base"
   - System processes and stores the document

### Method 2: URL Scraping

**Best for**: Government websites, legal resources, online guides

1. **Enter URL**:

   - Paste the complete URL in the URL field
   - Example: `https://www.gov.uk/buying-first-home`

2. **Auto-update Option**:

   - Check "Auto-update when URL content changes"
   - Enables automatic monitoring for content updates

3. **AI Analysis**:

   - Click "AI Suggest Metadata"
   - System scrapes the URL and analyzes content
   - Auto-fills title and content fields
   - Suggests appropriate metadata

4. **Review Content**:

   - Check the scraped content in the Content field
   - Verify title and metadata suggestions
   - Make adjustments as needed

5. **Submit**:
   - Click "Add to Knowledge Base"
   - Content is processed and stored with update tracking

### Method 3: Manual Text Entry

**Best for**: Short articles, notes, custom content

1. **Enter Content**:

   - Type or paste content directly into the Content field
   - Use the large text area for longer content

2. **Fill Metadata**:

   - Enter title manually
   - Select appropriate category
   - Add relevant tags
   - Set priority level

3. **AI Enhancement** (optional):

   - Click "AI Suggest Metadata" for content analysis
   - System suggests improved metadata based on text

4. **Submit**:
   - Click "Add to Knowledge Base"
   - Content is processed and stored

---

## Metadata Management

### Required Fields

- **Title**: Clear, descriptive document name
- **Content**: The actual text content (auto-filled for files/URLs)

### Optional Fields

- **Category**: Organize documents by topic
  - Common categories: Legal, Financial, Property Assessment, Buying Process
- **Tags**: Searchable keywords (press Enter to add)
  - Examples: "mortgage", "first-time-buyer", "legal-requirements"
- **Document ID**: Custom identifier (auto-generated if empty)
- **Priority**: Importance level (low, normal, high, critical)
- **Source**: Attribution information
  - Examples: "Government Website", "Legal Firm", "Financial Institution"

### AI-Suggested Metadata

When you click "AI Suggest Metadata", the system:

1. **Analyzes Content**: Uses OpenAI to understand the document
2. **Suggests Categories**: Based on content analysis
3. **Generates Tags**: Relevant keywords and phrases
4. **Determines Priority**: Based on content importance
5. **Identifies Source**: Based on domain or content type

**Visual Indicators**: AI-suggested fields show a blue "AI" badge next to them.

### Best Practices for Metadata

1. **Consistent Categories**: Use standardized categories across documents
2. **Relevant Tags**: Add 3-7 tags that users would search for
3. **Clear Titles**: Use descriptive, searchable titles
4. **Accurate Source**: Always credit the original source
5. **Appropriate Priority**: Reserve "high" and "critical" for essential content

---

## Content Update Management

### Auto-Update Feature

For URL-based content, enable automatic updates:

1. **Enable During Upload**:

   - Check "Auto-update when URL content changes"
   - System stores the original URL for monitoring

2. **How It Works**:

   - System periodically checks the URL
   - Compares content with stored hash
   - Automatically updates if changes detected
   - Increments version number

3. **Update Notifications**:
   - System logs all updates
   - Version history is maintained
   - Original metadata is preserved where appropriate

### Manual Updates

To manually update existing content:

1. **Find Document**: Use the search function to locate content
2. **Note Document ID**: Copy the document identifier
3. **Re-upload**: Use the same process with updated content
4. **Version Control**: System automatically manages versions

---

## Searching the Knowledge Base

### Basic Search

1. **Enter Query**: Type natural language questions
   - Example: "What documents do I need for a mortgage?"
2. **Review Results**: See relevant documents with relevance scores
3. **Read Content**: Click on results to see full content

### Advanced Search Features

1. **Category Filtering**: Filter results by document category
2. **Tag-based Search**: Use tags to find specific topics
3. **Relevance Scoring**: Results are ranked by semantic similarity
4. **Source Attribution**: See where each piece of information comes from

### Search Tips

- **Natural Language**: Use complete questions for best results
- **Specific Terms**: Include specific homebuying terminology
- **Multiple Attempts**: Try different phrasings for comprehensive results
- **Context Matters**: Include context about your specific situation

---

## Testing with the Chatbot

### Using the Chatbot Interface

1. **Access Chatbot**: Click the "Chatbot" toggle button
2. **Ask Questions**: Type homebuying-related questions
3. **Review Responses**: See AI-generated answers with source citations
4. **Verify Sources**: Check which documents informed the response

### Streaming Controls

- **Pause auto-scroll**: Scroll upward or click inside the message panel while a reply is streaming. The interface pauses automatic scrolling so you can read or copy earlier content without losing your place.
- **Resume**: Scroll back to the bottom manually or press the "Jump to latest" button that appears while new tokens arrive. This clears the pause and restores automatic scrolling for future replies.
- **Visual cue**: When paused, the sticky "Jump to latest" pill appears above the composer to highlight that new activity is available off-screen.

### Example Conversations

**Query**: "What's the first step in buying a home?"

**Response**: Based on the knowledge base, provides step-by-step guidance with citations to relevant documents.

**Query**: "How much deposit do I need as a first-time buyer?"

**Response**: Detailed information about deposit requirements with references to financial guides and government resources.

### Response Quality

The chatbot:

- **Uses Your Knowledge**: Only references uploaded documents
- **Provides Citations**: Shows which documents informed each answer
- **Maintains Context**: Can handle follow-up questions
- **Stays Focused**: Concentrates on homebuying topics

---

## Quality Control and Best Practices

### Content Quality Guidelines

1. **Authoritative Sources**: Upload content from reliable sources

   - Government websites
   - Established legal firms
   - Recognized financial institutions
   - Licensed real estate professionals

2. **Current Information**: Ensure content is up-to-date

   - Enable auto-updates for web content
   - Regularly review and update manual entries
   - Remove outdated information

3. **Comprehensive Coverage**: Include diverse topics
   - Legal requirements
   - Financial planning
   - Property search and evaluation
   - Buying process steps
   - Post-purchase considerations

### Metadata Best Practices

1. **Standardized Categories**:

   ```
   Legal               - Laws, regulations, contracts
   Financial           - Mortgages, budgeting, costs
   Property Assessment - Surveys, valuations, inspections
   Buying Process      - Steps, timeline, procedures
   Market Information  - Trends, pricing, locations
   ```

2. **Effective Tagging**:

   - Use consistent terminology
   - Include synonyms users might search for
   - Add location-specific tags when relevant
   - Include process-stage tags (pre-approval, house-hunting, etc.)

3. **Priority Levels**:
   - **Critical**: Legal requirements, safety issues
   - **High**: Important financial information, key processes
   - **Normal**: General guidance, tips
   - **Low**: Background information, nice-to-know content

### Content Organization

1. **Document Naming**: Use clear, descriptive titles

   - ✅ "UK Mortgage Application Requirements 2024"
   - ❌ "Document 1" or "Untitled"

2. **Consistent Sources**: Maintain consistent source attribution

   - ✅ "HM Revenue & Customs"
   - ❌ "HMRC" (use full name for clarity)

3. **Regular Reviews**: Periodically review content for:
   - Accuracy and currency
   - Proper categorization
   - Effective tagging
   - User search patterns

---

## Workflow Examples

### Workflow 1: Adding Government Guide

1. **Source URL**: `https://www.gov.uk/buying-first-home`
2. **Process**:

   - Enter URL in URL field
   - Check "Auto-update when URL content changes"
   - Click "AI Suggest Metadata"
   - Review suggestions:
     - Title: "Buying your first home - Government Guide"
     - Category: "Buying Process"
     - Tags: ["first-time-buyer", "government-guide", "buying-process"]
     - Priority: "High"
     - Source: "HM Government"
   - Click "Add to Knowledge Base"

3. **Result**: Document is stored with auto-update enabled

### Workflow 2: Adding Legal Document

1. **Source**: PDF file from solicitor
2. **Process**:

   - Upload PDF file
   - AI suggests metadata
   - Customize metadata:
     - Category: "Legal"
     - Tags: Add ["conveyancing", "property-law", "contracts"]
     - Priority: "High"
     - Source: "Smith & Associates Legal"
   - Submit to knowledge base

3. **Result**: Document is processed and searchable

### Workflow 3: Testing Knowledge Base

1. **Add Content**: Upload several documents on different topics
2. **Test Search**: Try various queries:
   - "What is conveyancing?"
   - "How much deposit do I need?"
   - "What surveys should I get?"
3. **Test Chatbot**: Ask follow-up questions
4. **Refine**: Adjust metadata based on search results

---

## Troubleshooting

### Common Issues

1. **File Upload Fails**:

   - Check file size (max 10MB)
   - Verify file format is supported
   - Try refreshing the page

2. **URL Scraping Fails**:

   - Verify URL is accessible
   - Check for paywall or login requirements
   - Try different URL format

3. **AI Metadata Suggestion Not Working**:

   - Check OpenAI API key configuration
   - Verify content is not too short/long
   - Try manual metadata entry

4. **Search Returns Poor Results**:
   - Check document metadata quality
   - Try different search terms
   - Verify documents are properly uploaded

### Getting Help

1. **Check Logs**: Browser developer console for error messages
2. **Verify Setup**: Ensure API keys are properly configured
3. **Test Components**: Try individual features to isolate issues
4. **Review Documentation**: Check API reference and setup guides

---

## Advanced Features

### Bulk Operations

For adding multiple documents:

1. **Batch Upload**: Upload multiple files individually
2. **Consistent Metadata**: Use similar categories and tags
3. **AI Assistance**: Use AI suggestion for each document
4. **Quality Check**: Test search across all uploaded content

### Integration with External Systems

The knowledge base can be integrated with:

1. **CRM Systems**: Link customer queries to relevant knowledge
2. **Website Integration**: Embed search functionality
3. **Mobile Apps**: API access for mobile interfaces
4. **Analytics Tools**: Track usage and search patterns

---

## Security and Privacy

### Data Handling

1. **Content Storage**: Documents are stored in Pinecone vector database
2. **API Security**: All API calls use secure connections
3. **Access Control**: Admin interface should be restricted in production

### Best Practices

1. **Sensitive Information**: Avoid uploading personal client data
2. **Public Information**: Focus on publicly available guides and resources
3. **Regular Updates**: Keep system dependencies updated
4. **Access Logs**: Monitor system usage in production

---

_Admin User Guide last updated: January 2024_
