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
        return result;
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
      // Pinecone integrated inference `upsertRecords` has a hard cap of 96 items
      const BATCH_SIZE = 96;
      const BATCH_DELAY_MS = Number(process.env.PINECONE_BATCH_DELAY_MS ?? 12000);
      const results: any[] = [];
      const targetNamespace = namespace || DEFAULT_KNOWLEDGE_NAMESPACE;

      for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const batch = documents.slice(i, i + BATCH_SIZE);
        console.log(`📤 Uploading batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(documents.length / BATCH_SIZE)} (${batch.length} chunks)`);

        const records = batch.map((d) => ({
          id: d.id,
          chunk_text: d.chunk_text,
          ...this.flattenDocumentMetadata(d.metadata, targetNamespace),
        }));

        const ns: any = this.knowledgeBaseIndex.namespace(targetNamespace) as any;
        if (typeof ns.upsertRecords === 'function') {
          const result = await ns.upsertRecords(records);
          results.push(result);
        } else {
          // Fallback: embed and upsert vectors
          const texts = batch.map((d) => d.chunk_text);
          const embeds = await pc.inference.embed(
            'llama-text-embed-v2' as any,
            texts,
            { inputType: 'passage', truncate: 'END' } as any
          );
          const vectors = batch.map((d, i) => ({
            id: d.id,
            values: (embeds as any).data[i].values,
            metadata: {
              ...this.flattenDocumentMetadata(d.metadata, targetNamespace),
              chunk_text: d.chunk_text,
            },
          }));
          const result = await this.knowledgeBaseIndex.namespace(targetNamespace).upsert(vectors as any);
          results.push(result);
        }

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
        return result;
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

    const requestedNamespace = filters?.namespace || namespace || DEFAULT_KNOWLEDGE_NAMESPACE;
    const retrievalFilter = this.buildFilter(filters);

    const knowledgeMatches: NormalizedMatch[] =
      mode === 'user'
        ? []
        : await (async () => {
            try {
              const searchResponse = await this.searchKnowledgeBase(
                query,
                topK,
                retrievalFilter,
                requestedNamespace,
              );
              const matches = Array.isArray(searchResponse?.matches)
                ? searchResponse.matches
                : [];
              return this.normalizeMatches(matches, requestedNamespace);
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
