# HomeTruth Knowledge Base API Reference

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication. Future versions will implement proper authentication and authorization.

## Content Types

All API endpoints accept and return `application/json` unless otherwise specified.

---

## Knowledge Base Management

### Upload Knowledge Content

**Endpoint**: `POST /api/knowledge/upload`

**Description**: Add new documents to the knowledge base from file upload, URL scraping, or manual text entry.

**Request Format**: `multipart/form-data`

**Parameters**:

- `file` (optional): File to upload (PDF, DOC, TXT, etc.)
- `metadata` (required): JSON string containing document metadata

**Metadata Schema**:

```typescript
{
  title: string,              // Document title
  content?: string,           // Text content (if no file)
  category: string,           // Document category
  tags: string[],            // Array of tags
  documentId?: string,       // Custom document ID
  priority: string,          // "low" | "normal" | "high" | "critical"
  source: string,            // Source attribution
  url?: string,              // Original URL (if scraped)
  autoUpdate?: boolean       // Enable automatic updates
}
```

**Example Request**:

```javascript
const formData = new FormData();
formData.append("file", fileObject);
formData.append(
  "metadata",
  JSON.stringify({
    title: "First-time Buyer Guide",
    category: "Buying Process",
    tags: ["first-time", "mortgage", "legal"],
    priority: "high",
    source: "Government Website",
    autoUpdate: true,
  })
);

const response = await fetch("/api/knowledge/upload", {
  method: "POST",
  body: formData,
});
```

**Response**:

```json
{
  "success": true,
  "documentId": "kb_1704123456_abc123",
  "chunksUploaded": 15,
  "result": {
    "upsertedCount": 15
  }
}
```

**Error Responses**:

- `400`: Missing required fields
- `500`: Processing or storage error

---

### Search Knowledge Base

**Endpoint**: `POST /api/knowledge/search`

**Description**: Perform semantic search across the knowledge base using natural language queries.

**Request Body**:

```json
{
  "query": "What documents do I need for a mortgage?",
  "topK": 5,
  "filter": {
    "category": "Financial"
  }
}
```

**Parameters**:

- `query` (required): Natural language search query
- `topK` (optional): Number of results to return (default: 5)
- `filter` (optional): Metadata filters to apply

**Response**:

```json
{
  "success": true,
  "results": [
    {
      "id": "kb_mortgage_guide_chunk_0",
      "score": 0.85,
      "metadata": {
        "name": "Mortgage Application Guide",
        "category": "Financial",
        "tags": ["mortgage", "documents", "application"],
        "source": "Legal Firm",
        "chunk_text": "For a mortgage application, you will need..."
      }
    }
  ],
  "totalResults": 5
}
```

---

### Update Document

**Endpoint**: `POST /api/knowledge/update`

**Description**: Update an existing document by checking for content changes and applying updates if necessary.

**Request Body**:

```json
{
  "documentId": "kb_homebuying_guide_001",
  "url": "https://gov.uk/buying-first-home"
}
```

**Response**:

```json
{
  "success": true,
  "updated": true,
  "documentId": "kb_homebuying_guide_001",
  "newVersion": 2,
  "chunksUpdated": 12
}
```

**Response (No Changes)**:

```json
{
  "success": true,
  "updated": false,
  "message": "No changes detected"
}
```

---

## AI Services

### Suggest Metadata

**Endpoint**: `POST /api/ai/suggest-metadata`

**Description**: Use OpenAI to analyze document content and suggest appropriate metadata.

**Request Body**:

```json
{
  "text": "This comprehensive guide covers the legal requirements for first-time homebuyers...",
  "filename": "homebuying-guide.pdf"
}
```

**Response**:

```json
{
  "success": true,
  "title": "First-time Homebuyer Legal Guide",
  "category": "Legal",
  "priority": "high",
  "source": "Legal Firm",
  "tags": ["legal", "first-time-buyer", "requirements"],
  "summary": "Comprehensive guide covering legal requirements for first-time homebuyers including contracts, conveyancing, and statutory obligations."
}
```

---

### Chat Interface

**Endpoint**: `POST /api/chat`

**Description**: Generate AI responses using RAG (Retrieval Augmented Generation) with the knowledge base.

**Request Body**:

```json
{
  "message": "What are the steps to buy my first home?"
}
```

**Response**:

```json
{
  "success": true,
  "response": "Based on the available guides, here are the key steps to buy your first home:\n\n1. **Get your finances in order**: Check your credit score, save for a deposit (typically 5-20% of the property value), and get a mortgage agreement in principle.\n\n2. **Research the market**: Look at properties in your budget, research neighborhoods, and understand local market conditions.\n\n3. **Engage professionals**: Find a solicitor for conveyancing and a surveyor for property inspection...",
  "sources": [
    {
      "title": "First-time Buyer Guide",
      "category": "Buying Process",
      "relevance": "92.3"
    },
    {
      "title": "Mortgage Application Process",
      "category": "Financial",
      "relevance": "87.1"
    }
  ]
}
```

---

## Web Scraping

### Scrape URL

**Endpoint**: `POST /api/scrape/url`

**Description**: Extract content from a web URL using Puppeteer for knowledge base ingestion.

**Request Body**:

```json
{
  "url": "https://www.gov.uk/buying-first-home"
}
```

**Response**:

```json
{
  "success": true,
  "title": "Buying your first home - GOV.UK",
  "content": "This guide will help you understand the process of buying your first home. You'll need to consider your budget, get a mortgage, find a property...",
  "url": "https://www.gov.uk/buying-first-home",
  "metadata": {
    "description": "Government guidance on buying your first home",
    "author": "HM Government",
    "publishedDate": "2024-01-15",
    "domain": "gov.uk",
    "wordCount": 2847
  }
}
```

**Error Response**:

```json
{
  "success": false,
  "error": "Failed to scrape URL: Invalid URL format"
}
```

---

## Error Handling

### Standard Error Format

All API endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Description of the error",
  "code": "ERROR_CODE" // Optional
}
```

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request (missing/invalid parameters)
- `404`: Resource not found
- `500`: Internal server error
- `503`: Service unavailable (external service issues)

### Common Error Scenarios

1. **Invalid URL for scraping**:

   ```json
   {
     "success": false,
     "error": "Invalid URL format"
   }
   ```

2. **OpenAI API error**:

   ```json
   {
     "success": false,
     "error": "Failed to analyze document: Rate limit exceeded"
   }
   ```

3. **Pinecone storage error**:

   ```json
   {
     "success": false,
     "error": "Failed to store document in knowledge base"
   }
   ```

4. **Missing required fields**:
   ```json
   {
     "success": false,
     "error": "Content and title are required"
   }
   ```

---

## Rate Limits

Current implementation does not enforce rate limits, but consider the following service limits:

- **OpenAI API**: Depends on your plan and usage tier
- **Pinecone**: Based on your subscription and index configuration
- **Puppeteer Scraping**: Limited by server resources and target site policies

---

## Usage Examples

### Complete Document Upload Workflow

```javascript
// 1. Upload a document with AI metadata suggestion
const uploadDocument = async (file) => {
  // First, get AI-suggested metadata
  const text = await file.text();
  const metadataResponse = await fetch("/api/ai/suggest-metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: text.substring(0, 4000),
      filename: file.name,
    }),
  });

  const suggestedMetadata = await metadataResponse.json();

  // Then upload with metadata
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "metadata",
    JSON.stringify({
      title: suggestedMetadata.title,
      category: suggestedMetadata.category,
      tags: suggestedMetadata.tags,
      priority: suggestedMetadata.priority,
      source: suggestedMetadata.source,
      autoUpdate: false,
    })
  );

  const uploadResponse = await fetch("/api/knowledge/upload", {
    method: "POST",
    body: formData,
  });

  return await uploadResponse.json();
};
```

### URL Scraping and Knowledge Addition

```javascript
// Complete URL scraping and knowledge base addition
const addFromUrl = async (url) => {
  // 1. Scrape the URL
  const scrapeResponse = await fetch("/api/scrape/url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const scrapedData = await scrapeResponse.json();

  if (!scrapedData.success) {
    throw new Error(scrapedData.error);
  }

  // 2. Get AI-suggested metadata
  const metadataResponse = await fetch("/api/ai/suggest-metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: scrapedData.content.substring(0, 4000),
      filename: scrapedData.title,
    }),
  });

  const metadata = await metadataResponse.json();

  // 3. Upload to knowledge base
  const formData = new FormData();
  formData.append(
    "metadata",
    JSON.stringify({
      title: metadata.title,
      content: scrapedData.content,
      category: metadata.category,
      tags: metadata.tags,
      priority: metadata.priority,
      source: metadata.source,
      url: url,
      autoUpdate: true, // Enable auto-updates for URL-based content
    })
  );

  const uploadResponse = await fetch("/api/knowledge/upload", {
    method: "POST",
    body: formData,
  });

  return await uploadResponse.json();
};
```

### Search and Chat Integration

```javascript
// Search knowledge base and generate response
const searchAndRespond = async (userQuery) => {
  // Search knowledge base
  const searchResponse = await fetch("/api/knowledge/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: userQuery,
      topK: 5,
    }),
  });

  const searchResults = await searchResponse.json();

  // Generate AI response with context
  const chatResponse = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: userQuery,
    }),
  });

  return await chatResponse.json();
};
```

---

## Development Notes

### Testing APIs

Use tools like Postman, curl, or browser developer tools to test the APIs:

```bash
# Test search endpoint
curl -X POST http://localhost:3000/api/knowledge/search \
  -H "Content-Type: application/json" \
  -d '{"query": "mortgage requirements", "topK": 3}'

# Test URL scraping
curl -X POST http://localhost:3000/api/scrape/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.gov.uk/buying-first-home"}'
```

### Environment Setup

Ensure the following environment variables are set:

```bash
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

### Performance Considerations

1. **Large Files**: File uploads are limited by Next.js default limits
2. **Long Content**: Text content is truncated to 4000 characters for AI analysis
3. **Concurrent Requests**: Consider implementing request queuing for resource-intensive operations
4. **Caching**: Implement response caching for frequently accessed content

---

_API Reference last updated: January 2024_
