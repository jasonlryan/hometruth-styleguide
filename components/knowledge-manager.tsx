"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  Calendar,
  Tag,
  Loader2,
} from "lucide-react";

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export function KnowledgeManager() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Add knowledge form state
  const [newKnowledge, setNewKnowledge] = useState({
    title: "",
    content: "",
    category: "",
    tags: [] as string[],
  });
  const [adding, setAdding] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery.trim(),
          topK: 10,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results || []);
      } else {
        console.error("Knowledge search failed:", data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Knowledge search error:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddKnowledge = async () => {
    if (!newKnowledge.title || !newKnowledge.content) return;

    setAdding(true);

    try {
      const response = await fetch("/api/knowledge/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newKnowledge),
      });

      const data = await response.json();

      if (data.success) {
        setNewKnowledge({
          title: "",
          content: "",
          category: "",
          tags: [],
        });
        setShowAddForm(false);
        // Optionally refresh search results
        if (hasSearched) {
          handleSearch();
        }
      } else {
        console.error("Failed to add knowledge:", data.error);
      }
    } catch (error) {
      console.error("Error adding knowledge:", error);
    } finally {
      setAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Knowledge Base
          </h2>
          <p className="text-muted-foreground">
            Manage general homebuying knowledge and advice
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Knowledge
        </Button>
      </div>

      {/* Add Knowledge Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Knowledge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newKnowledge.title}
                onChange={(e) =>
                  setNewKnowledge((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., First-time Buyer Checklist"
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newKnowledge.content}
                onChange={(e) =>
                  setNewKnowledge((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Enter the knowledge content here..."
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newKnowledge.category}
                onChange={(e) =>
                  setNewKnowledge((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="e.g., Buying Process, Legal, Financial"
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newKnowledge.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() =>
                      setNewKnowledge((prev) => ({
                        ...prev,
                        tags: prev.tags.filter((t) => t !== tag),
                      }))
                    }
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add tag and press Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const tag = e.currentTarget.value.trim();
                    if (tag && !newKnowledge.tags.includes(tag)) {
                      setNewKnowledge((prev) => ({
                        ...prev,
                        tags: [...prev.tags, tag],
                      }));
                    }
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddKnowledge} disabled={adding}>
                {adding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Knowledge"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search homebuying knowledge..."
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
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
            {searching ? "Searching..." : `Found ${searchResults.length} results`}
          </h3>

          {searchResults.length === 0 && !searching ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No knowledge found matching your search.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {searchResults.map((result) => (
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
                            {result.metadata?.name || "Knowledge Item"}
                          </h4>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {result.metadata?.type || "Knowledge"}
                          </span>
                          {result.metadata?.category && (
                            <Badge variant="outline">
                              {result.metadata.category}
                            </Badge>
                          )}
                        </div>

                        {result.metadata?.tags &&
                          result.metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {result.metadata.tags.map((tag: string) => (
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
