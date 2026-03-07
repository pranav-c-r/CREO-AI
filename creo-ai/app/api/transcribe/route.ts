import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement transcription logic
    return NextResponse.json(
      { error: 'Transcription endpoint not yet implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
