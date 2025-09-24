"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Calendar, Tag, Star } from "lucide-react";

interface SearchResult {
  id: string;
  score: number;
  metadata: {
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
  };
}

export function DocumentSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch("/api/documents/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          topK: 10,
          searchType: 'user', // Search user documents only
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results || []);
      } else {
        console.error("Search failed:", data.error);
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search My Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search your documents..."
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
            >
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {searching ? "Searching..." : `Found ${results.length} results`}
          </h3>

          {results.length === 0 && !searching ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No documents found matching your search.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {results.map((result) => (
                <Card
                  key={result.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium">
                            {result.metadata.name}
                          </h4>
                          {result.metadata.starred && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {result.metadata.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {result.metadata.dateAdded}
                          </span>
                          {result.metadata.category && (
                            <Badge variant="outline">
                              {result.metadata.category}
                            </Badge>
                          )}
                        </div>

                        {result.metadata.tags &&
                          result.metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {result.metadata.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                        <div className="text-xs text-muted-foreground">
                          Relevance: {(result.score * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
