
import { NextRequest, NextResponse } from 'next/server';

async function callGetCaseContacts(token: string, body: unknown) {
  return fetch('https://demo.gopro.net/demo-is/services/v2/Case/GetCaseContacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`, // GoPro expects Authorization: Bearer
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('x-token');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // 1st attempt
    let response = await callGetCaseContacts(token, body);

    // Optional: single silent retry if 401 and demo creds are available
    if (response.status === 401 && process.env.DEMO_USERNAME && process.env.DEMO_PASSWORD) {
      // Construct base URL from request
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host') || 'localhost:9002';
      const baseUrl = `${protocol}://${host}`;

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
        response = await callGetCaseContacts(newToken, body);
        // Return the refreshed token to the client so it can replace its copy
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data, {
            headers: { 'x-refreshed-token': newToken }
          });
        }
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GoPro API Get Case Contacts failed:', response.status, errorText);

      // Handle token expiration specifically
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'GoPro token er útrunnið. Vinsamlega skráðu þig inn aftur.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: `Get contacts failed: ${response.statusText} (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Get contacts proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error during get contacts proxy' },
      { status: 500 }
    );
  }
}
