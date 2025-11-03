
import { NextRequest, NextResponse } from 'next/server';

async function callSearchCases(token: string, body: unknown) {
  return fetch('https://demo.gopro.net/demo-is/services/v2/Case/Search', {
    method: 'POST',
    headers: {
      'Token': token, // GoPro expects 'Token'
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('x-token');

    console.log('[API /cases/search] ===== REQUEST START =====');
    console.log('[API /cases/search] Token received:', token ? token.substring(0, 20) + '...' : 'NONE');
    console.log('[API /cases/search] Body:', body);
    console.log('[API /cases/search] ENV DEMO_USERNAME:', process.env.DEMO_USERNAME);
    console.log('[API /cases/search] ENV DEMO_PASSWORD:', process.env.DEMO_PASSWORD ? '***SET***' : 'NOT SET');

    if (!token) {
      console.error('[API /cases/search] No token provided!');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // 1st attempt
    console.log('[API /cases/search] Making 1st attempt to GoPro API...');
    let response = await callSearchCases(token, body);

    // Optional: single silent retry if 401 and demo creds are available
    if (response.status === 401 && process.env.DEMO_USERNAME && process.env.DEMO_PASSWORD) {
      console.log('[API /cases/search] Got 401! Attempting silent retry...');
      console.log('[API /cases/search] Demo credentials available:', {
        hasUsername: !!process.env.DEMO_USERNAME,
        hasPassword: !!process.env.DEMO_PASSWORD
      });

      // Construct base URL from request
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host') || 'localhost:9002';
      const baseUrl = `${protocol}://${host}`;

      console.log('[API /cases/search] Calling auth endpoint:', `${baseUrl}/api/auth`);
      const authRes = await fetch(`${baseUrl}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: process.env.DEMO_USERNAME,
          password: process.env.DEMO_PASSWORD
        }),
      });

      if (authRes.ok) {
        const { token: newToken } = await authRes.json();
        console.log('[API /cases/search] Got new token, retrying GoPro call...');
        response = await callSearchCases(newToken, body);
        // Return the refreshed token to the client so it can replace its copy
        if (response.ok) {
          console.log('[API /cases/search] Retry succeeded! Returning data with refreshed token');
          const data = await response.json();
          return NextResponse.json(data, {
            headers: { 'x-refreshed-token': newToken }
          });
        } else {
          console.error('[API /cases/search] Retry failed with status:', response.status);
        }
      } else {
        console.error('[API /cases/search] Re-auth failed with status:', authRes.status);
      }
    } else if (response.status === 401) {
      console.log('[API /cases/search] Got 401 but no demo credentials available for retry');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GoPro API Case Search failed:', response.status, errorText);

      // Handle token expiration specifically
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'GoPro token er útrunnið. Vinsamlega skráðu þig inn aftur.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: `Search failed: ${response.statusText} (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Search proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error during search proxy' },
      { status: 500 }
    );
  }
}
