
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Attempting GoPro authentication for user:', body.username);
    
    // Make request from server-side (no CORS)
    const response = await fetch('https://demo.gopro.net/demo-is/services/v2/Authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GoPro API Authentication failed:', response.status, errorText);
      
      // Check if it's a server error from GoPro's side
      if (response.status === 500 || response.status === 502 || response.status === 503) {
        return NextResponse.json(
          { error: 'GoPro þjónusta er ekki í boði. Vinsamlega reynið aftur síðar. (GoPro service is temporarily unavailable)' },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: `Authentication failed: ${response.statusText} (${response.status})` },
        { status: response.status }
      );
    }
    
    const token = await response.text();
    // Assume ~30 min token lifetime; refresh a bit earlier to be safe
    const expiresAt = Date.now() + 25 * 60 * 1000;

    return NextResponse.json({
      token: token.replace(/"/g, ''),
      expiresAt
    });
    
  } catch (error) {
    console.error('Auth proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication proxy' },
      { status: 500 }
    );
  }
}
