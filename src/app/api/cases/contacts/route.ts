
import { NextRequest, NextResponse } from 'next/server';

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
    
    const response = await fetch('https://demo.gopro.net/demo-is/services/v2/Case/GetCaseContacts', {
      method: 'POST',
      headers: {
        'Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
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
