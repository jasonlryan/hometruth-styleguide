import { NextRequest, NextResponse } from 'next/server';

interface Note {
  id: string;
  title: string;
  excerpt: string;
  content: any;
  type?: string;
  createdAt: number;
  updatedAt: number;
}

function generateId() {
  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, excerpt, content, type } = body;

    if (!title || !excerpt) {
      return NextResponse.json(
        { error: 'Title and excerpt are required' },
        { status: 400 }
      );
    }

    // In a real app, this would save to a database
    // For now, we'll return success with a note ID
    // The client-side will handle localStorage persistence
    const note: Note = {
      id: generateId(),
      title,
      excerpt,
      content: content || {},
      type: type || 'general',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error('Notes API error:', error);
    return NextResponse.json(
      { error: 'Failed to save note' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // In a real app, this would fetch from a database
    // For now, return empty array - client will load from localStorage
    return NextResponse.json({
      notes: [],
    });
  } catch (error) {
    console.error('Notes API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

