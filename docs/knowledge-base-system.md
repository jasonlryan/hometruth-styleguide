# HomeTruth Knowledge Base System

## Overview

The HomeTruth Knowledge Base System is a comprehensive AI-powered document management and retrieval system that enables intelligent storage, search, and automatic updates of homebuying-related content. The system combines Pinecone vector database, OpenAI language models, and web scraping capabilities to create a powerful RAG (Retrieval Augmented Generation) system.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                           │
│  /admin/knowledge - Admin Interface for Knowledge Management│
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                  INPUT METHODS                              │
│  • URL Scraping (Puppeteer)                               │
│  • File Upload (PDF, DOC, TXT, etc.)                      │
│  • Manual Text Entry                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                 AI PROCESSING                               │
│  • OpenAI GPT-4o-mini for metadata analysis               │
│  • Content extraction and chunking                         │
│  • Automatic categorization and tagging                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                VECTOR STORAGE                               │
│  • Pinecone with Llama-text-embed-v2                      │
│  • Automatic embedding generation                          │
│  • Metadata filtering and search                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│              UPDATE MANAGEMENT                              │
│  • Content hash tracking                                   │
│  • Automatic change detection                              │
│  • Version control and history                             │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Admin Interface (`/admin/knowledge`)

**Location**: `app/admin/knowledge/page.tsx`

The main interface for managing the knowledge base, providing:

- **Document Upload**: File upload with drag-and-drop support
- **URL Scraping**: Web content extraction from URLs
- **Manual Text Entry**: Direct content input
- **AI Metadata Suggestion**: Automated metadata generation
- **Search Interface**: Query and explore existing knowledge
- **Metadata Management**: Full control over document properties

### 2. Pinecone Integration

**Location**: `lib/pinecone.ts`

Manages vector storage and retrieval:

```typescript
// Index Configuration
USER_DOCUMENTS_INDEX = "hometruth-user-documents"; // For user-specific docs
KNOWLEDGE_BASE_INDEX =
  "hometruth-knowledge-base" - // For shared knowledge
  // Core Operations
  upsertKnowledgeContent() - // Store documents
  searchKnowledgeBase() - // Semantic search
  deleteDocument(); // Remove documents
```

**Pinecone Setup**:

- **Embedding Model**: Llama-text-embed-v2 (1024 dimensions)
- **Metric**: Cosine similarity
- **Cloud**: AWS (us-east-1)
- **Namespace Strategy**: User isolation for personal docs, shared for knowledge base

### 3. OpenAI Integration

**Location**: `lib/openai.ts`

Provides AI-powered analysis and responses:

```typescript
// Core Functions
-analyzeDocument() - // Extract metadata from content
  generateResponse() - // RAG-powered chatbot responses
  extractTextFromFile(); // File content extraction
```

**OpenAI Configuration**:

- **Model**: GPT-4o-mini (cost-effective for analysis)
- **Temperature**: 0.3 for metadata analysis, 0.7 for chat responses
- **Response Format**: JSON for structured metadata output

### 4. Web Scraping

**Location**: `lib/scraper.ts`

Extracts content from web URLs using Puppeteer:

```typescript
// Scraping Features
- Smart content detection (main content vs navigation/ads)
- Metadata extraction (title, description, author, date)
- Content cleaning and normalization
- Domain identification and source attribution
```

**Supported Content Types**:

- News articles and blog posts
- Government documentation
- Legal and financial guides
- Property market reports

### 5. Document Processing

**Location**: `lib/document-processor.ts`

Handles document chunking and metadata enrichment:

```typescript
// Processing Pipeline
1. Text extraction from files
2. Content chunking (1000 chars with 200 overlap)
3. Metadata generation and validation
4. Content hash generation for update tracking
5. Vector preparation for Pinecone storage
```

## Data Flow

### Document Upload Process

```
1. User Input
   ├── File Upload → File Processing
   ├── URL Input → Web Scraping
   └── Text Input → Direct Processing

2. Content Processing
   ├── Text Extraction
   ├── Content Chunking
   └── Hash Generation

3. AI Analysis
   ├── OpenAI Metadata Analysis
   ├── Category Classification
   ├── Tag Generation
   └── Priority Assessment

4. Storage
   ├── Pinecone Vector Storage
   ├── Metadata Attachment
   └── Update Tracking Setup

5. Indexing
   ├── Embedding Generation (Llama-v2)
   ├── Similarity Indexing
   └── Search Optimization
```

### Search Process

```
1. Query Input
   └── Natural language search query

2. Vector Search
   ├── Query embedding generation
   ├── Similarity search in Pinecone
   └── Relevance scoring

3. Result Processing
   ├── Metadata filtering
   ├── Source attribution
   └── Relevance ranking

4. Response Generation
   ├── Context compilation
   ├── OpenAI response generation
   └── Source citation
```

## Metadata Schema

### Document Metadata Structure

```typescript
interface DocumentMetadata {
  // Core Identifiers
  id: string; // Unique document ID
  documentId: string; // User-friendly document ID
  name: string; // Document title

  // Content Classification
  type: string; // "Knowledge Base Article"
  category: string; // "Legal", "Financial", "Property Assessment", etc.
  tags: string[]; // ["mortgage", "first-time-buyer", "legal"]
  priority: string; // "low", "normal", "high", "critical"

  // Source Information
  source: string; // "Government", "Legal Firm", "Manual Upload"
  url?: string; // Original URL (if scraped)
  userId: string; // "system" for knowledge base

  // Technical Metadata
  fileSize?: number; // File size in bytes
  mimeType?: string; // MIME type of original file
  uploadDate: string; // ISO timestamp
  dateAdded: string; // Human-readable date

  // Update Tracking
  version: number; // Version number (starts at 1)
  contentHash: string; // SHA-256 hash for change detection
  autoUpdate: boolean; // Enable automatic updates
  lastUpdated: string; // Last update timestamp

  // Status Information
  status: string; // "Processing", "Ready", "Error"
  starred?: boolean; // Important flag
}
```

### Pinecone Vector Structure

```typescript
interface PineconeVector {
  id: string; // "{documentId}_chunk_{index}"
  values: number[]; // 1024-dimensional embedding
  metadata: DocumentMetadata; // Full metadata object
}
```

## API Endpoints

### Knowledge Management APIs

#### Upload Knowledge Content

- **Endpoint**: `POST /api/knowledge/upload`
- **Purpose**: Add new documents to knowledge base
- **Input**: FormData with file/metadata
- **Output**: Document ID and upload confirmation

#### Search Knowledge Base

- **Endpoint**: `POST /api/knowledge/search`
- **Purpose**: Semantic search across knowledge base
- **Input**: Query string and filters
- **Output**: Relevant documents with scores

#### Update Document

- **Endpoint**: `POST /api/knowledge/update`
- **Purpose**: Update existing documents when content changes
- **Input**: Document ID and URL
- **Output**: Update confirmation and new version

### AI Services APIs

#### Suggest Metadata

- **Endpoint**: `POST /api/ai/suggest-metadata`
- **Purpose**: AI-powered metadata generation
- **Input**: Document text and filename
- **Output**: Suggested metadata fields

#### Chat Interface

- **Endpoint**: `POST /api/chat`
- **Purpose**: RAG-powered conversational interface
- **Input**: User message
- **Output**: AI response with source citations

### Web Scraping APIs

#### Scrape URL

- **Endpoint**: `POST /api/scrape/url`
- **Purpose**: Extract content from web URLs
- **Input**: URL string
- **Output**: Scraped content and metadata

## Update Management System

### Automatic Update Detection

The system tracks content changes through:

1. **Content Hashing**: SHA-256 hash of document content
2. **Version Control**: Incremental version numbering
3. **Change Detection**: Periodic URL monitoring
4. **Update Triggers**: Manual or scheduled updates

### Update Process

```typescript
// Update Detection Flow
1. Scheduled Check (daily/weekly)
   ├── Query documents with autoUpdate: true
   ├── Re-scrape original URLs
   └── Compare content hashes

2. Change Detection
   ├── Hash comparison
   ├── Content diff analysis
   └── Update decision

3. Update Execution
   ├── Delete old document chunks
   ├── Process new content
   ├── Re-generate metadata with AI
   ├── Update version number
   └── Store updated vectors

4. Notification
   ├── Log update results
   ├── Track version history
   └── Optional user notification
```

### Version Control

Each document maintains:

- **Version Number**: Incremental counter
- **Update History**: Timestamp of changes
- **Content Hash**: For change detection
- **Source URL**: For re-scraping capability

## Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here

# Optional
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Pinecone Configuration

```typescript
// Index Settings
{
  name: "hometruth-knowledge-base",
  dimension: 1024,
  metric: "cosine",
  embed: {
    model: "llama-text-embed-v2",
    fieldMap: { text: "chunk_text" }
  }
}
```

### OpenAI Settings

```typescript
// Model Configuration
{
  model: "gpt-4o-mini",
  temperature: 0.3,           // For metadata analysis
  max_tokens: 1000,
  response_format: { type: "json_object" }
}
```

## Usage Examples

### Adding Knowledge via URL

```typescript
// 1. Enter URL in admin interface
const url = "https://gov.uk/buying-first-home";

// 2. System scrapes content
const scrapedContent = await WebScraper.scrapeUrl(url);

// 3. AI analyzes content
const metadata = await OpenAIService.analyzeDocument(
  scrapedContent.content,
  scrapedContent.title
);

// 4. Store in knowledge base
await pineconeService.upsertKnowledgeContent(processedChunks);
```

### Searching Knowledge Base

```typescript
// Natural language search
const query = "What documents do I need for a mortgage application?";

// Vector search
const results = await pineconeService.searchKnowledgeBase(query, 5);

// AI-powered response
const response = await OpenAIService.generateResponse(query, context);
```

### Updating Content

```typescript
// Check for updates
const updateCheck = await ContentUpdater.checkForUpdates(url, currentHash);

// Apply updates if content changed
if (updateCheck.hasChanged) {
  await ContentUpdater.updateDocument(
    documentId,
    updateCheck.newContent,
    url,
    existingMetadata
  );
}
```

## Best Practices

### Content Guidelines

1. **Quality Sources**: Use authoritative sources (government, legal, financial institutions)
2. **Content Categorization**: Consistent use of categories and tags
3. **Regular Updates**: Enable auto-update for frequently changing content
4. **Source Attribution**: Always maintain original source information

### Metadata Management

1. **Consistent Naming**: Use standardized document IDs and titles
2. **Proper Categorization**: Use predefined categories for consistency
3. **Meaningful Tags**: Add relevant, searchable tags
4. **Priority Assignment**: Set appropriate priority levels

### Search Optimization

1. **Chunking Strategy**: 1000 characters with 200 overlap for optimal retrieval
2. **Metadata Filtering**: Use category and tag filters for precise results
3. **Query Formatting**: Natural language queries work best
4. **Result Validation**: Always review AI-generated responses

## Troubleshooting

### Common Issues

1. **Scraping Failures**: Check URL accessibility and content structure
2. **AI Analysis Errors**: Verify OpenAI API key and content format
3. **Search Quality**: Review chunking strategy and metadata completeness
4. **Update Failures**: Check URL stability and change detection logic

### Monitoring

- **Vector Storage**: Monitor Pinecone usage and performance
- **API Usage**: Track OpenAI token consumption
- **Update Status**: Monitor automatic update success rates
- **Search Quality**: Review user query success rates

## Future Enhancements

### Planned Features

1. **Bulk Upload**: Multiple document processing
2. **Advanced Analytics**: Usage statistics and insights
3. **Export Capabilities**: Data backup and migration tools
4. **Enhanced Security**: User permissions and access controls
5. **Real-time Updates**: Webhook-based instant updates

### Integration Opportunities

1. **CRM Integration**: Link with customer management systems
2. **Notification Systems**: Email/SMS alerts for updates
3. **API Expansion**: Public API for third-party integrations
4. **Mobile Support**: Mobile-optimized interfaces

---

_This documentation covers the complete HomeTruth Knowledge Base System as of January 2024. For the latest updates and API changes, refer to the codebase and version control history._
