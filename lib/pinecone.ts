import { Pinecone } from '@pinecone-database/pinecone';

// Initialize Pinecone client
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Index names for different use cases
const USER_DOCUMENTS_INDEX = 'hometruth-user-documents';
const KNOWLEDGE_BASE_INDEX = 'hometruth-knowledge-base';

const DEFAULT_KNOWLEDGE_NAMESPACE = process.env.PINECONE_NAMESPACE_DEFAULT || 'general';
const DEFAULT_RETRIEVAL_TOPK = Number(process.env.RAG_RETRIEVAL_TOPK ?? 12);
const MAX_CONTEXT_SOURCES = Number(process.env.RAG_MAX_SOURCES ?? 5);
const MAX_CONTEXT_CHARS = Number(process.env.RAG_MAX_CONTEXT_CHARS ?? 6000);

export interface DocumentMetadata {
  id: string;
  name: string;
  type: string;
  dateAdded: string;
  starred?: boolean;
  category?: string;
  tags?: string[];
  status?: string;
  userId?: string;
  fileSize?: number;
  mimeType?: string;
  uploadDate?: string;
  documentId?: string;
  priority?: string;
  source?: string;
  url?: string;
  originalUrl?: string;
  title?: string;
  contentType?: string;
  chunkIndex?: number;
  chunkCount?: number;
  hash?: string;
  contentHash?: string;
  wordCount?: number;
  charCount?: number;
  accessedAt?: string;
  ingestedAt?: string;
  version?: string;
  namespace?: string;
  etag?: string;
  lastModified?: string;
}

export interface DocumentChunk {
  id: string;
  chunk_text: string;
  metadata: DocumentMetadata;
}

export interface KnowledgeDocumentSummary {
  documentId: string;
  name?: string;
  category?: string;
  tags?: string[];
  chunkCount: number;
  uploadDate?: string;
  fileSize?: number;
  mimeType?: string;
  priority?: string;
  source?: string;
  status?: string;
  namespace?: string;
}

export interface KnowledgeDocumentChunk {
  id: string;
  chunkText: string;
  chunkIndex: number;
  chunkCount?: number;
  wordCount?: number;
  charCount?: number;
  metadata?: Record<string, any>;
}

export type RetrievalMode = 'knowledge' | 'user' | 'hybrid';

export interface RetrievalFilters {
  category?: string[];
  namespace?: string;
  tags?: string[];
}

export interface NormalizedMatch {
  id: string;
  documentId: string;
  title?: string;
  category?: string;
  namespace: string;
  score?: number;
  url?: string;
  tags?: string[];
  chunkText: string;
  metadata?: Record<string, any>;
}

export interface ChatSource extends Omit<NormalizedMatch, 'chunkText' | 'metadata'> {
  citation: number;
  snippet?: string;
}

export interface RetrieveChatContextOptions {
  query: string;
  mode?: RetrievalMode;
  topK?: number;
  namespace?: string;
  userId?: string;
  filters?: RetrievalFilters;
}

export interface RetrieveChatContextResult {
  sources: ChatSource[];
  context: string[];
  matches: NormalizedMatch[];
}

export class PineconeService {
  private userDocumentsIndex = pc.index(USER_DOCUMENTS_INDEX);
  private knowledgeBaseIndex = pc.index(KNOWLEDGE_BASE_INDEX);

  // User Documents Methods
  async upsertUserDocuments(documents: DocumentChunk[], userId: string) {
    try {
      // Map into integrated inference records: { id, chunk_text, ...flat metadata }
      const records = documents.map((d) => ({
        id: d.id,
        chunk_text: d.chunk_text,
        // Flatten metadata; avoid key collision with `id`
        document_id: d.metadata.id,
        name: d.metadata.name,
        type: d.metadata.type,
        dateAdded: d.metadata.dateAdded,
        starred: d.metadata.starred,
        category: d.metadata.category,
        tags: d.metadata.tags,
        status: d.metadata.status,
        userId: d.metadata.userId,
        fileSize: d.metadata.fileSize,
        mimeType: d.metadata.mimeType,
        uploadDate: d.metadata.uploadDate,
      }));

      const ns: any = this.userDocumentsIndex.namespace(userId) as any;
      if (typeof ns.upsertRecords === 'function') {
        const result = await ns.upsertRecords(records);
        return result;
      }

      // Fallback: embed and upsert vectors
      const texts = documents.map((d) => d.chunk_text);
      const embeds = await pc.inference.embed(
        'llama-text-embed-v2' as any,
        texts,
        { inputType: 'passage', truncate: 'END' } as any
      );

      const vectors = documents.map((d, i) => ({
        id: d.id,
        values: (embeds as any).data[i].values,
        metadata: {
          document_id: d.metadata.id,
          name: d.metadata.name,
          type: d.metadata.type,
          dateAdded: d.metadata.dateAdded,
          starred: d.metadata.starred,
          category: d.metadata.category,
          tags: d.metadata.tags,
          status: d.metadata.status,
          userId: d.metadata.userId,
          fileSize: d.metadata.fileSize,
          mimeType: d.metadata.mimeType,
          uploadDate: d.metadata.uploadDate,
          chunk_text: d.chunk_text,
        },
      }));

      const result = await this.userDocumentsIndex.namespace(userId).upsert(vectors as any);
      return result;
    } catch (error) {
      console.error('Error upserting user documents:', error);
      throw error;
    }
  }

  async searchUserDocuments(query: string, userId: string, topK: number = 5, filter?: any) {
    try {
      const ns: any = this.userDocumentsIndex.namespace(userId) as any;
      if (typeof ns.searchRecords === 'function') {
        const result = await ns.searchRecords({
          query: { topK, inputs: { text: query } },
          includeMetadata: true,
          filter,
        });
        const rawHits = (result as any)?.result?.hits ?? (result as any)?.hits;
        const hits: any[] = Array.isArray(rawHits) ? rawHits : [];
        const matches = hits.map((hit: any) => ({
          id: hit?._id ?? hit?.id,
          score: hit?._score,
          metadata: (hit?.fields ?? hit?.metadata) || {},
        }));
        return { matches } as any;
      }

      // Fallback: embed query and use vector search
      const embed = await pc.inference.embed(
        'llama-text-embed-v2' as any,
        [query],
        { inputType: 'query', truncate: 'END' } as any
      );
      const vector = (embed as any).data[0].values;
      const result = await this.userDocumentsIndex.namespace(userId).query({
        topK,
        vector,
        includeMetadata: true,
        filter,
      } as any);
      return result;
    } catch (error) {
      console.error('Error searching user documents:', error);
      throw error;
    }
  }

  async deleteUserDocument(documentId: string, userId: string) {
    try {
      const result = await this.userDocumentsIndex.namespace(userId).deleteOne(documentId);
      return result;
    } catch (error) {
      console.error('Error deleting user document:', error);
      throw error;
    }
  }

  // Knowledge Base Methods (for general RAG content)
  async upsertKnowledgeContent(documents: DocumentChunk[], namespace: string = DEFAULT_KNOWLEDGE_NAMESPACE) {
    try {
      // Process in batches using integrated inference upserts
      // Keep requests well under rate limits and split on 429 automatically
      const BATCH_SIZE = Number(process.env.PINECONE_BATCH_SIZE ?? 48);
      const BATCH_DELAY_MS = Number(process.env.PINECONE_BATCH_DELAY_MS ?? 12000);
      const MAX_BACKOFF_MS = 30000;
      const results: any[] = [];
      const targetNamespace = namespace || DEFAULT_KNOWLEDGE_NAMESPACE;

      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      const makeRecords = (batch: DocumentChunk[]) =>
        batch.map((d) => ({
          id: d.id,
          chunk_text: d.chunk_text,
          ...this.flattenDocumentMetadata(d.metadata, targetNamespace),
        }));

      const uploadWithRetry = async (records: any[], attempt = 1): Promise<any> => {
        const ns: any = this.knowledgeBaseIndex.namespace(targetNamespace) as any;
        try {
          if (typeof ns.upsertRecords === 'function') {
            return await ns.upsertRecords(records);
          }

          // Fallback: embed and upsert vectors
          const texts = records.map((r) => r.chunk_text);
          const embeds = await pc.inference.embed(
            'llama-text-embed-v2' as any,
            texts,
            { inputType: 'passage', truncate: 'END' } as any
          );
          const vectors = records.map((r, i) => ({
            id: r.id,
            values: (embeds as any).data[i].values,
            metadata: { ...r, chunk_text: r.chunk_text },
          }));
          return await this.knowledgeBaseIndex.namespace(targetNamespace).upsert(vectors as any);
        } catch (err: any) {
          const message = String(err?.message || '');
          const status = (err as any)?.status;
          const isRate = message.includes('RESOURCE_EXHAUSTED') || status === 429;
          if (isRate) {
            // Backoff then split the batch to reduce token load per request
            const backoff = Math.min(MAX_BACKOFF_MS, attempt * 5000);
            await sleep(backoff);
            if (records.length > 1) {
              const mid = Math.ceil(records.length / 2);
              const left = await uploadWithRetry(records.slice(0, mid), attempt + 1);
              await sleep(250);
              const right = await uploadWithRetry(records.slice(mid), attempt + 1);
              return [left, right];
            }
            // Single record: retry in place
            return await uploadWithRetry(records, attempt + 1);
          }
          throw err;
        }
      };

      for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const batch = documents.slice(i, i + BATCH_SIZE);
        console.log(`📤 Uploading batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(documents.length / BATCH_SIZE)} (${batch.length} chunks)`);

        const records = makeRecords(batch);
        const result = await uploadWithRetry(records);
        results.push(result);

        if (i + BATCH_SIZE < documents.length) {
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
        }
      }

      return results;
    } catch (error) {
      console.error('Error upserting knowledge content:', error);
      throw error;
    }
  }

  async searchKnowledgeBase(query: string, topK: number = 5, filter?: any, namespace: string = DEFAULT_KNOWLEDGE_NAMESPACE) {
    try {
      const ns: any = this.knowledgeBaseIndex.namespace(namespace) as any;
      if (typeof ns.searchRecords === 'function') {
        const result = await ns.searchRecords({
          query: { topK, inputs: { text: query } },
          includeMetadata: true,
          filter,
        });
        const rawHits = (result as any)?.result?.hits ?? (result as any)?.hits;
        const hits: any[] = Array.isArray(rawHits) ? rawHits : [];
        const matches = hits.map((hit: any) => ({
          id: hit?._id ?? hit?.id,
          score: hit?._score,
          metadata: (hit?.fields ?? hit?.metadata) || {},
        }));
        return { matches } as any;
      }
      // Fallback: embed query and use vector search
      const embed = await pc.inference.embed(
        'llama-text-embed-v2' as any,
        [query],
        { inputType: 'query', truncate: 'END' } as any
      );
      const vector = (embed as any).data[0].values;
      const result = await this.knowledgeBaseIndex.namespace(namespace).query({
        topK,
        vector,
        includeMetadata: true,
        filter,
      } as any);
      return result;
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      throw error;
    }
  }

  namespace(namespace: string) {
    return this.knowledgeBaseIndex.namespace(namespace);
  }

  async getKnowledgeDocumentChunks(documentId: string, namespace: string = DEFAULT_KNOWLEDGE_NAMESPACE, topK: number = 1000): Promise<KnowledgeDocumentChunk[]> {
    try {
      const targetNamespace = namespace || DEFAULT_KNOWLEDGE_NAMESPACE;
      const ns: any = this.knowledgeBaseIndex.namespace(targetNamespace) as any;

      const chunks: KnowledgeDocumentChunk[] = [];
      const seen = new Set<string>();
      let declaredChunkTotal: number | undefined;

      const parseNumber = (value: unknown) => {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (typeof value === 'string') {
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : undefined;
        }
        return undefined;
      };

      const extractField = (fields: Record<string, any>, metadata: Record<string, any>, ...keys: string[]) => {
        for (const key of keys) {
          if (fields && fields[key] != null) return fields[key];
          if (metadata && metadata[key] != null) return metadata[key];
        }
        return undefined;
      };

      const materializeChunk = (id: string | undefined, data: { metadata?: Record<string, any>; fields?: Record<string, any> }): KnowledgeDocumentChunk | undefined => {
        if (!id || seen.has(id)) return undefined;
        const metadata = data?.metadata ?? {};
        const fields = data?.fields ?? {};
        const combined = { ...metadata, ...fields };

        const rawText = extractField(fields, metadata, 'chunk_text', 'text', 'chunkText', 'content');
        const chunkText = typeof rawText === 'string' ? rawText : rawText != null ? String(rawText) : '';

        const chunkIndexValue = extractField(fields, metadata, 'chunkIndex', 'chunk_index', 'index');
        const chunkIndex = parseNumber(chunkIndexValue) ?? 0;

        const chunkCountValue = extractField(fields, metadata, 'chunkCount', 'chunk_count', 'totalChunks');
        const chunkCount = parseNumber(chunkCountValue);

        const wordCountValue = extractField(fields, metadata, 'wordCount', 'word_count');
        const wordCount = parseNumber(wordCountValue);

        const charCountValue = extractField(fields, metadata, 'charCount', 'char_count');
        const charCount = parseNumber(charCountValue);

        const normalizedChunk: KnowledgeDocumentChunk = {
          id,
          chunkText,
          chunkIndex,
          chunkCount,
          wordCount,
          charCount,
          metadata: combined,
        };

        if (!normalizedChunk.chunkText && wordCount == null && charCount == null && Object.keys(combined).length === 0) {
          return;
        }

        if (wordCount == null && chunkText) {
          const trimmed = chunkText.trim();
          normalizedChunk.wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
        }

        if (charCount == null && chunkText) {
          normalizedChunk.charCount = chunkText.length;
        }

        chunks.push(normalizedChunk);
        seen.add(id);
        return normalizedChunk;
      };

      if (typeof ns.listPaginated === 'function' && typeof ns.fetch === 'function') {
        let paginationToken: string | undefined = undefined;
        let iterations = 0;
        const MAX_ITERATIONS = 50;

        while (iterations < MAX_ITERATIONS) {
          iterations += 1;

          const listResponse = await ns.listPaginated({
            prefix: '',
            limit: 99,
            paginationToken,
          });

          const ids: string[] = (listResponse?.vectors || [])
            .map((vector: any) => vector?.id)
            .filter((id: string | undefined): id is string => Boolean(id));

          if (ids.length === 0) {
            break;
          }

          const fetchResponse = await ns.fetch(ids);
          const records = fetchResponse?.records || {};

          Object.entries(records).forEach(([id, record]) => {
            if (!id) return;
            const metadata: Record<string, any> = record?.metadata ?? {};
            const fields: Record<string, any> = record?.fields ?? {};
            const combined = { ...metadata, ...fields };
            const recordDocumentId = combined.document_id ?? combined.documentId ?? combined.id;
            if (recordDocumentId !== documentId) return;

            const chunk = materializeChunk(id, { metadata, fields });
            const chunkCountCandidate = chunk?.chunkCount ?? parseNumber(combined.chunkCount ?? combined.chunk_count);
            if (chunkCountCandidate && (!declaredChunkTotal || declaredChunkTotal < chunkCountCandidate)) {
              declaredChunkTotal = chunkCountCandidate;
            }
          });

          if (declaredChunkTotal && chunks.length >= declaredChunkTotal) {
            break;
          }

          paginationToken = listResponse?.pagination?.next;
          if (!paginationToken) {
            break;
          }
        }

        return chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
      }

      if (typeof ns.searchRecords === 'function') {
        const response = await ns.searchRecords({
          query: { topK, inputs: { text: documentId } },
          includeMetadata: true,
          filter: { document_id: { $eq: documentId } },
        });
        if (Array.isArray(response?.hits)) {
          response.hits.forEach((hit: any) => {
            if (!hit) return;
            const id = hit.id ?? hit.vectorId ?? '';
            const fields: Record<string, any> = hit.fields ?? {};
            const metadata: Record<string, any> = hit.metadata ?? {};
            const combined = { ...metadata, ...fields };
            const recordDocumentId = combined.document_id ?? combined.documentId ?? combined.id;
            if (recordDocumentId !== documentId) return;
            const chunk = materializeChunk(id, { metadata, fields });
            if (chunk?.chunkCount && (!declaredChunkTotal || declaredChunkTotal < chunk.chunkCount)) {
              declaredChunkTotal = chunk.chunkCount;
            }
          });
        } else if (Array.isArray(response?.matches)) {
          response.matches.forEach((match: any) => {
            if (!match) return;
            const id = match.id ?? '';
            const metadata: Record<string, any> = match.metadata ?? {};
            const chunk = materializeChunk(id, { metadata });
            if (chunk?.chunkCount && (!declaredChunkTotal || declaredChunkTotal < chunk.chunkCount)) {
              declaredChunkTotal = chunk.chunkCount;
            }
          });
        }

        if (chunks.length > 0) {
          return chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
        }
      }

      // Final fallback: embed a lightweight query to satisfy classic vector search APIs
      const embed = await pc.inference.embed(
        'llama-text-embed-v2' as any,
        [documentId],
        { inputType: 'query', truncate: 'END' } as any
      );

      const vector = (embed as any)?.data?.[0]?.values;
      if (!Array.isArray(vector)) {
        return chunks;
      }

      const response = await this.knowledgeBaseIndex.namespace(targetNamespace).query({
        topK,
        vector,
        includeMetadata: true,
        filter: { document_id: { $eq: documentId } },
      } as any);

      const matches: any[] = Array.isArray(response?.matches) ? response.matches : [];
      matches.forEach((match) => {
        if (!match) return;
        const id = match.id ?? '';
        const metadata: Record<string, any> = match.metadata ?? {};
        materializeChunk(id, { metadata });
      });

      return chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
    } catch (error) {
      console.error('Error fetching knowledge document chunks:', error);
      throw error;
    }
  }

  // Combined search (both user docs and knowledge base)
  async searchAll(query: string, userId: string, topK: number = 10) {
    try {
      const [userResults, knowledgeResults] = await Promise.all([
        this.searchUserDocuments(query, userId, Math.ceil(topK / 2)),
        this.searchKnowledgeBase(query, Math.ceil(topK / 2))
      ]);

      return {
        userDocuments: userResults.matches || [],
        knowledgeBase: knowledgeResults.matches || []
      };
    } catch (error) {
      console.error('Error searching all sources:', error);
      throw error;
    }
  }

  async retrieveChatContext(options: RetrieveChatContextOptions): Promise<RetrieveChatContextResult> {
    const {
      query,
      mode = 'knowledge',
      topK = DEFAULT_RETRIEVAL_TOPK,
      namespace,
      userId,
      filters,
    } = options;

    const nsSpec = (filters?.namespace || namespace || DEFAULT_KNOWLEDGE_NAMESPACE).trim();
    const namespaces: string[] = (() => {
      if (!nsSpec) return [DEFAULT_KNOWLEDGE_NAMESPACE];
      const lowered = nsSpec.toLowerCase();
      if (lowered === 'all') {
        // Known knowledge namespaces
        return ['general', 'urls'];
      }
      return nsSpec
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => Boolean(entry));
    })();

    const retrievalFilter = this.buildFilter(filters);

    const knowledgeMatches: NormalizedMatch[] =
      mode === 'user'
        ? []
        : await (async () => {
            try {
              const perNamespaceResults = await Promise.all(
                namespaces.map(async (ns) => {
                  try {
                    const searchResponse = await this.searchKnowledgeBase(
                      query,
                      topK,
                      retrievalFilter,
                      ns,
                    );
                    const matches = Array.isArray(searchResponse?.matches)
                      ? searchResponse.matches
                      : [];
                    return this.normalizeMatches(matches, ns);
                  } catch (innerError) {
                    console.error('Knowledge base retrieval failed for namespace', ns, innerError);
                    return [] as NormalizedMatch[];
                  }
                }),
              );
              return perNamespaceResults.flat();
            } catch (error) {
              console.error('Knowledge base retrieval failed:', error);
              return [];
            }
          })();

    const userMatches: NormalizedMatch[] =
      mode === 'knowledge' || !userId
        ? []
        : await (async () => {
            try {
              const userResponse = await this.searchUserDocuments(query, userId, topK, retrievalFilter);
              const matches = Array.isArray(userResponse?.matches) ? userResponse.matches : [];
              return this.normalizeMatches(matches, userId);
            } catch (error) {
              console.error('User document retrieval failed:', error);
              return [];
            }
          })();

    const combined = [...knowledgeMatches, ...userMatches].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const dedupedByDocument = new Map<string, NormalizedMatch>();

    combined.forEach((match) => {
      const key = match.documentId || match.id;
      const existing = dedupedByDocument.get(key);
      if (!existing || (match.score ?? 0) > (existing.score ?? 0)) {
        dedupedByDocument.set(key, match);
      }
    });

    const deduped = Array.from(dedupedByDocument.values()).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const selected = deduped.slice(0, Math.max(1, MAX_CONTEXT_SOURCES));

    const sources: ChatSource[] = [];
    const context: string[] = [];
    let contextCharacterCount = 0;

    selected.forEach((match, index) => {
      const citation = index + 1;
      const bullets = this.createSummaryBullets(match.chunkText);
      const fallbackSnippet = match.chunkText.trim().slice(0, 280).replace(/\s+$/u, '');
      const chosenSnippet = bullets[0] ?? fallbackSnippet;
      const snippet = chosenSnippet ? chosenSnippet : undefined;

      const contextLines = [
        `Source [${citation}] ${match.title ?? 'Untitled'} (${match.category ?? 'General'})`,
        `Namespace: ${match.namespace}`,
        ...(match.url ? [`URL: ${match.url}`] : []),
        ...bullets.map((bullet) => `- ${bullet}`),
      ];

      const contextEntry = contextLines.join('\n');
      const prospectiveSize = contextCharacterCount + contextEntry.length;

      if (prospectiveSize <= MAX_CONTEXT_CHARS || context.length === 0) {
        context.push(contextEntry);
        contextCharacterCount = prospectiveSize;
      }

      sources.push({
        id: match.id,
        documentId: match.documentId,
        title: match.title,
        category: match.category,
        namespace: match.namespace,
        score: match.score,
        url: match.url,
        tags: match.tags,
        citation,
        snippet,
      });
    });

    return {
      sources,
      context,
      matches: deduped,
    };
  }

  async getUserDocumentStats(userId: string) {
    try {
      const stats = await this.userDocumentsIndex.describeIndexStats();
      return stats;
    } catch (error) {
      console.error('Error getting user document stats:', error);
      throw error;
    }
  }

  async getKnowledgeBaseStats() {
    try {
      const stats = await this.knowledgeBaseIndex.describeIndexStats();
      return stats;
    } catch (error) {
      console.error('Error getting knowledge base stats:', error);
      throw error;
    }
  }

  async listKnowledgeDocuments(options: { limit?: number; paginationToken?: string; namespace?: string } = {}) {
    const { limit = 20, paginationToken, namespace = 'general' } = options;

    try {
      const ns: any = this.knowledgeBaseIndex.namespace(namespace) as any;

      if (typeof ns.listPaginated !== 'function' || typeof ns.fetch !== 'function') {
        console.warn('Knowledge namespace does not support listPaginated/fetch operations; returning empty document list.');
        return {
          documents: [] as KnowledgeDocumentSummary[],
          nextPageToken: undefined as string | undefined,
        };
      }

      const documents = new Map<string, KnowledgeDocumentSummary>();
      let currentToken: string | undefined = paginationToken || undefined;
      let nextToken: string | undefined = undefined;
      let iterations = 0;
      const MAX_ITERATIONS = 10;

      while (documents.size < limit && iterations < MAX_ITERATIONS) {
        iterations += 1;

        const listResponse = await ns.listPaginated({
          prefix: '',
          limit: 99,
          paginationToken: currentToken,
        });

        const ids: string[] = (listResponse?.vectors || [])
          .map((v: any) => v?.id)
          .filter((id: string | undefined): id is string => Boolean(id));

        if (ids.length === 0) {
          nextToken = undefined;
          break;
        }

        for (let i = 0; i < ids.length; i += 100) {
          const batchIds = ids.slice(i, i + 100);
          const fetchResponse = await ns.fetch(batchIds);
          const namespaceName = fetchResponse?.namespace || namespace;
          const records = fetchResponse?.records || {};

          for (const recordId of Object.keys(records)) {
            const record = records[recordId];
            const metadata: any = record?.metadata || {};
            const documentId = metadata?.document_id || metadata?.documentId;
            if (!documentId) continue;

            const existing = documents.get(documentId) || {
              documentId,
              chunkCount: 0,
              name: metadata?.name,
              category: metadata?.category,
              tags: Array.isArray(metadata?.tags) ? metadata.tags : undefined,
              uploadDate: metadata?.uploadDate,
              fileSize: metadata?.fileSize,
              mimeType: metadata?.mimeType,
              priority: metadata?.priority,
              source: metadata?.source,
              status: metadata?.status,
              namespace: namespaceName,
            };

            existing.chunkCount += 1;

            if (!existing.name && metadata?.name) existing.name = metadata.name;
            if (!existing.category && metadata?.category) existing.category = metadata.category;
            if ((!existing.tags || existing.tags.length === 0) && Array.isArray(metadata?.tags)) {
              existing.tags = metadata.tags;
            }
            if (!existing.uploadDate && metadata?.uploadDate) existing.uploadDate = metadata.uploadDate;
            if (!existing.fileSize && metadata?.fileSize) existing.fileSize = metadata.fileSize;
            if (!existing.mimeType && metadata?.mimeType) existing.mimeType = metadata.mimeType;
            if (!existing.priority && metadata?.priority) existing.priority = metadata.priority;
            if (!existing.source && metadata?.source) existing.source = metadata.source;
            if (!existing.status && metadata?.status) existing.status = metadata.status;
            if (!existing.namespace) existing.namespace = namespaceName;

            documents.set(documentId, existing);
          }
        }

        currentToken = listResponse?.pagination?.next;
        nextToken = currentToken;

        if (!currentToken) {
          break;
        }
      }

      const sortedDocuments = Array.from(documents.values())
        .sort((a, b) => {
          const aDate = a.uploadDate ? Date.parse(a.uploadDate) : 0;
          const bDate = b.uploadDate ? Date.parse(b.uploadDate) : 0;
          if (aDate && bDate) {
            return bDate - aDate;
          }
          if (aDate) return -1;
          if (bDate) return 1;
          return b.documentId.localeCompare(a.documentId);
        })
        .slice(0, limit);

      return {
        documents: sortedDocuments,
        nextPageToken: nextToken,
      };
    } catch (error) {
      console.error('Error listing knowledge documents:', error);
      throw error;
    }
  }

  // Delete all chunks for a given documentId
  async deleteKnowledgeDocument(documentId: string) {
    try {
      const ns: any = this.knowledgeBaseIndex.namespace('general') as any;

      // Prefer record deletion with filter (integrated inference)
      if (typeof ns.deleteRecords === 'function') {
        const result = await ns.deleteRecords({
          filter: { document_id: { $eq: documentId } },
        });
        return result;
      }

      // Fallback: use delete with filter (classic API supports filter)
      if (typeof ns.delete === 'function') {
        try {
          const res = await ns.delete({
            filter: { document_id: { $eq: documentId } },
          } as any);
          return res;
        } catch (e) {
          // continue to last-resort fallback
        }
      }

      // Last resort: find ids via search and delete by ids
      const searchAny: any = (typeof ns.searchRecords === 'function')
        ? await ns.searchRecords({ query: { topK: 1000, inputs: { text: documentId } }, filter: { document_id: { $eq: documentId } } })
        : await this.knowledgeBaseIndex.namespace('general').query({
            topK: 1000,
            vector: new Array(1024).fill(0), // dummy vector; filter will narrow
            includeMetadata: true,
            filter: { document_id: { $eq: documentId } },
          } as any);

      const ids: string[] = (searchAny?.matches || []).map((m: any) => m.id).filter(Boolean);
      if (ids.length === 0) return { deletedCount: 0 } as any;
      const delRes = await this.knowledgeBaseIndex.namespace('general').delete({ ids } as any);
      return delRes;
    } catch (error) {
      console.error('Error deleting knowledge document:', error);
      throw error;
    }
  }

  private buildFilter(filters?: RetrievalFilters) {
    if (!filters) return undefined;

    const filter: Record<string, any> = {};

    if (Array.isArray(filters.category) && filters.category.length > 0) {
      filter.category = { $in: filters.category };
    }

    if (Array.isArray(filters.tags) && filters.tags.length > 0) {
      filter.tags = { $in: filters.tags };
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
  }

  private normalizeMatches(matches: any[], fallbackNamespace: string): NormalizedMatch[] {
    const normalized: NormalizedMatch[] = [];

    matches.forEach((match: any, index: number) => {
      if (!match) return;
      const metadata: Record<string, any> = match.metadata ?? {};
      const rawChunk =
        typeof metadata.chunk_text === 'string'
          ? metadata.chunk_text
          : typeof metadata.chunkText === 'string'
            ? metadata.chunkText
            : '';
      const chunkText = rawChunk.trim();
      if (!chunkText) {
        return;
      }

      const resolvedDocumentId =
        metadata.document_id ??
        metadata.documentId ??
        metadata.id ??
        match.id ??
        `doc-${index}`;

      const resolvedNamespace = match.namespace ?? metadata.namespace ?? fallbackNamespace;

      const rawTags = metadata.tags;
      const tags = Array.isArray(rawTags)
        ? rawTags
        : typeof rawTags === 'string'
          ? rawTags
              .split(',')
              .map((tag: string) => tag.trim())
              .filter(Boolean)
          : undefined;

      const url =
        metadata.url ??
        metadata.sourceUrl ??
        metadata.href ??
        metadata.link;

      normalized.push({
        id: match.id ?? resolvedDocumentId,
        documentId: resolvedDocumentId,
        title: metadata.name ?? metadata.title ?? metadata.document_title,
        category: metadata.category ?? metadata.type,
        namespace: resolvedNamespace,
        score: typeof match.score === 'number' ? match.score : undefined,
        url: typeof url === 'string' ? url : undefined,
        tags,
        chunkText,
        metadata,
      });
    });

    return normalized;
  }

  private createSummaryBullets(text: string, maxBullets = 2, maxLength = 280): string[] {
    const cleaned = (text || '').replace(/\s+/g, ' ').trim();
    if (!cleaned) return [];

    const segments = cleaned
      .split(/(?<=[.!?])\s+/)
      .map((segment) => segment.trim())
      .filter(Boolean);

    const bullets: string[] = [];

    for (const segment of segments) {
      const entry = segment.length > maxLength ? `${segment.slice(0, maxLength).trimEnd()}…` : segment;
      bullets.push(entry);
      if (bullets.length >= maxBullets) break;
    }

    if (bullets.length === 0) {
      bullets.push(cleaned.length > maxLength ? `${cleaned.slice(0, maxLength).trimEnd()}…` : cleaned);
    }

    return bullets;
  }

  private flattenDocumentMetadata(metadata: DocumentMetadata, fallbackNamespace: string) {
    return {
      document_id: metadata.documentId ?? metadata.id,
      name: metadata.name,
      type: metadata.type,
      dateAdded: metadata.dateAdded,
      starred: metadata.starred,
      category: metadata.category,
      tags: metadata.tags,
      status: metadata.status,
      userId: metadata.userId,
      fileSize: metadata.fileSize,
      mimeType: metadata.mimeType ?? metadata.contentType,
      uploadDate: metadata.uploadDate ?? metadata.ingestedAt,
      source: metadata.source,
      url: metadata.url,
      originalUrl: metadata.originalUrl,
      title: metadata.title ?? metadata.name,
      contentType: metadata.contentType ?? metadata.mimeType,
      chunkIndex: metadata.chunkIndex,
      chunkCount: metadata.chunkCount,
      hash: metadata.hash ?? metadata.contentHash,
      contentHash: metadata.contentHash ?? metadata.hash,
      wordCount: metadata.wordCount,
      charCount: metadata.charCount,
      accessedAt: metadata.accessedAt,
      ingestedAt: metadata.ingestedAt ?? metadata.uploadDate,
      version: metadata.version,
      namespace: metadata.namespace ?? fallbackNamespace,
      etag: metadata.etag,
      lastModified: metadata.lastModified,
    };
  }
}

export const pineconeService = new PineconeService();
