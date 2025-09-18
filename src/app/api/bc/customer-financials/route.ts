
// This route is intentionally left blank as per the user's request
// to revert to direct client-side API calls for Business Central data.
// The previous proxy implementation has been removed from this file.

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // If this route is ever called, it means the client-side logic
  // was not updated correctly to bypass it.
  // Return an error indicating it's deprecated or not in use.
  return NextResponse.json(
    { 
      error: 'This API route for Business Central financials is deprecated. Client should call BC API directly (with caution).',
      message: 'Functionality has been moved to client-side direct calls as per specific request for reversion.'
    },
    { status: 410 } // 410 Gone
  );
}
