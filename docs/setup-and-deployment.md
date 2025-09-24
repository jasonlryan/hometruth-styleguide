# HomeTruth Knowledge Base Setup and Deployment Guide

## Prerequisites

### Required Accounts and Services

1. **Pinecone Account**

   - Sign up at [pinecone.io](https://pinecone.io)
   - Create API key
   - Set up indexes

2. **OpenAI Account**

   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Create API key
   - Ensure sufficient credits/quota

3. **Development Environment**
   - Node.js 18+
   - npm or pnpm
   - Git

### System Requirements

- **Memory**: Minimum 2GB RAM for development
- **Storage**: 1GB for dependencies and cache
- **Network**: Stable internet for API calls

---

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd hometruth-styleguide

# Install dependencies
npm install
# or
pnpm install
```

### 2. Environment Configuration

Create `.env.local` file in the project root:

```bash
# Required API Keys
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
PINECONE_API_KEY=pcsk-your-pinecone-api-key-here

# Optional Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Puppeteer Configuration (optional)
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### 3. Pinecone Index Setup

#### Using Pinecone Console (Recommended)

1. Log into [Pinecone Console](https://app.pinecone.io)
2. Create new index with these settings:
   ```
   Name: hometruth-knowledge-base
   Dimensions: 1024
   Metric: cosine
   Cloud: AWS
   Region: us-east-1
   ```
3. Enable serverless if available

#### Using Pinecone MCP (Alternative)

The project includes MCP configuration in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "pinecone": {
      "command": "npx",
      "args": ["-y", "@pinecone-database/mcp"],
      "env": {
        "PINECONE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 4. Verify Setup

Run the development server:

```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000/admin/knowledge` to access the admin interface.

### 5. Test Core Functionality

1. **Upload Test**: Try uploading a text file
2. **URL Scraping**: Test with a simple webpage
3. **AI Metadata**: Verify OpenAI integration
4. **Search**: Perform a test search query

---

## Production Deployment

### Deployment Platforms

#### Vercel (Recommended)

1. **Setup**:

   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Configure Environment Variables**:

   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add PINECONE_API_KEY
   ```

3. **Deploy**:

   ```bash
   vercel --prod
   ```

4. **Custom Domain** (optional):
   ```bash
   vercel domains add yourdomain.com
   ```

#### Netlify

1. **Build Settings**:

   ```
   Build command: npm run build
   Publish directory: .next
   ```

2. **Environment Variables**:
   Add in Netlify dashboard under Site Settings > Environment Variables

#### Railway

1. **Connect Repository**: Link your GitHub repo
2. **Environment Variables**: Add in Railway dashboard
3. **Deploy**: Automatic deployment on push

#### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t hometruth-kb .
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your-key \
  -e PINECONE_API_KEY=your-key \
  hometruth-kb
```

---

## Configuration Management

### Environment Variables Reference

| Variable                    | Required | Description            | Example                  |
| --------------------------- | -------- | ---------------------- | ------------------------ |
| `OPENAI_API_KEY`            | ✅       | OpenAI API key         | `sk-proj-...`            |
| `PINECONE_API_KEY`          | ✅       | Pinecone API key       | `pcsk-...`               |
| `NODE_ENV`                  | ❌       | Environment mode       | `production`             |
| `NEXT_PUBLIC_APP_URL`       | ❌       | Application URL        | `https://yourdomain.com` |
| `PUPPETEER_EXECUTABLE_PATH` | ❌       | Chrome executable path | `/usr/bin/chromium`      |

### Pinecone Index Configuration

```typescript
// lib/pinecone.ts configuration
const indexConfig = {
  name: "hometruth-knowledge-base",
  dimension: 1024,
  metric: "cosine",
  embed: {
    model: "llama-text-embed-v2",
    fieldMap: { text: "chunk_text" },
  },
};
```

### OpenAI Model Settings

```typescript
// lib/openai.ts configuration
const modelConfig = {
  model: "gpt-4o-mini", // Cost-effective option
  temperature: 0.3, // For metadata analysis
  max_tokens: 1000,
  response_format: { type: "json_object" },
};
```

---

## Performance Optimization

### Next.js Configuration

Update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable edge runtime for API routes
  experimental: {
    runtime: "edge",
  },

  // Optimize images
  images: {
    domains: ["yourdomain.com"],
  },

  // File upload limits
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Caching Strategy

1. **API Response Caching**:

   ```typescript
   // Add to API routes
   export const runtime = "edge";
   export const revalidate = 3600; // 1 hour
   ```

2. **Static Asset Caching**:
   ```javascript
   // next.config.mjs
   async headers() {
     return [
       {
         source: '/images/:all*(svg|jpg|png)',
         headers: [
           { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
         ],
       },
     ];
   }
   ```

### Database Optimization

1. **Pinecone Performance**:

   - Use appropriate `topK` values (5-10 for most queries)
   - Implement metadata filtering for better results
   - Monitor index performance metrics

2. **Vector Search Optimization**:
   ```typescript
   // Optimize search queries
   const searchResults = await pineconeService.searchKnowledgeBase(
     query,
     topK: 5,           // Limit results
     filter: {          // Use filters
       category: 'Legal'
     }
   );
   ```

---

## Monitoring and Maintenance

### Health Checks

Create health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    openai: await checkOpenAI(),
    pinecone: await checkPinecone(),
    timestamp: new Date().toISOString(),
  };

  return Response.json(checks);
}
```

### Logging

Implement structured logging:

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({ level: "info", message, ...meta }));
  },
  error: (message: string, error?: Error) => {
    console.error(
      JSON.stringify({
        level: "error",
        message,
        error: error?.message,
        stack: error?.stack,
      })
    );
  },
};
```

### Monitoring Metrics

Track these key metrics:

1. **API Response Times**
2. **Error Rates**
3. **Token Usage (OpenAI)**
4. **Vector Storage Usage (Pinecone)**
5. **Search Quality Metrics**

### Backup Strategy

1. **Vector Data**:

   - Export Pinecone vectors periodically
   - Store backups in cloud storage

2. **Configuration**:
   - Version control all configuration files
   - Document environment variable changes

---

## Security Considerations

### API Security

1. **Environment Variables**:

   - Never commit API keys to version control
   - Use different keys for development/production
   - Rotate keys regularly

2. **Input Validation**:

   ```typescript
   // Validate all user inputs
   const validateInput = (input: string) => {
     if (!input || input.length > 10000) {
       throw new Error("Invalid input");
     }
     return input.trim();
   };
   ```

3. **Rate Limiting**:

   ```typescript
   // Implement rate limiting
   import rateLimit from "express-rate-limit";

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
   });
   ```

### Content Security

1. **Scraping Safety**:

   - Validate URLs before scraping
   - Implement timeout limits
   - Sanitize scraped content

2. **File Upload Security**:
   - Limit file types and sizes
   - Scan for malicious content
   - Implement virus scanning if needed

---

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**:

   ```
   Error: Rate limit exceeded
   Solution: Implement exponential backoff and request queuing
   ```

2. **Pinecone Connection Issues**:

   ```
   Error: Unable to connect to index
   Solution: Verify API key and index name
   ```

3. **Puppeteer Issues**:

   ```
   Error: Chrome executable not found
   Solution: Install chromium or set PUPPETEER_EXECUTABLE_PATH
   ```

4. **Memory Issues**:
   ```
   Error: JavaScript heap out of memory
   Solution: Increase Node.js memory limit: node --max-old-space-size=4096
   ```

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

### Performance Debugging

1. **Profile API calls**:

   ```typescript
   console.time("pinecone-search");
   const results = await pineconeService.searchKnowledgeBase(query);
   console.timeEnd("pinecone-search");
   ```

2. **Monitor memory usage**:
   ```typescript
   const used = process.memoryUsage();
   console.log("Memory usage:", used);
   ```

---

## Update and Maintenance

### Regular Maintenance Tasks

1. **Weekly**:

   - Check error logs
   - Monitor API usage
   - Review search quality

2. **Monthly**:

   - Update dependencies
   - Review and update content
   - Check system performance

3. **Quarterly**:
   - Rotate API keys
   - Review security settings
   - Plan feature updates

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update major versions carefully
npm install package@latest
```

### Content Maintenance

1. **Update Tracking**: Use the automatic update system for URL-based content
2. **Quality Review**: Regularly review and improve document categorization
3. **Performance Optimization**: Monitor and optimize search performance

---

## Support and Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Pinecone Documentation](https://docs.pinecone.io)
- [OpenAI API Documentation](https://platform.openai.com/docs)

### Community Resources

- [Pinecone Community](https://community.pinecone.io)
- [OpenAI Community](https://community.openai.com)
- [Next.js Discord](https://discord.gg/nextjs)

### Professional Support

For enterprise deployments or complex customizations, consider:

- Professional development services
- Managed hosting solutions
- Custom integration development

---

_Setup guide last updated: January 2024_
