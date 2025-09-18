
// Use relative URLs to call our API routes instead of external API
const API_BASE_URL = '/api';
const CREDENTIALS_KEY_TOKEN = 'gopro_token';
const CREDENTIALS_KEY_USERNAME = 'gopro_username';
const CREDENTIALS_KEY_IDNUMBER = 'gopro_idnumber';
const BC_TOKEN_KEY = 'bc_api_token'; // New key for Business Central token

// Authentication function - calls our proxy
export async function authenticate(username: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json(); // Always try to parse JSON first

  if (!response.ok) {
    // Use error message from proxy if available, otherwise generic
    throw new Error(data.error || `Authentication failed: ${response.statusText} (${response.status})`);
  }
  
  return data.token;
}

// Search cases - calls our proxy
export async function searchCases(token: string, idNumber: string): Promise<{ succeeded: boolean; cases: import('@/types').Case[]; message?: string }> {
  const response = await fetch(`${API_BASE_URL}/cases/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-token': token, // Send token in custom header
    },
    body: JSON.stringify({
      contactIdNumber: idNumber,
    })
  });
  
  const data = await response.json();

  if (!response.ok) {
     throw new Error(data.error || `Search failed: ${response.statusText} (${response.status})`);
  }

  return data;
}

// Get case details - calls our proxy
export async function getCaseDetails(token: string, caseNumber: string): Promise<{ succeeded: boolean; case: import('@/types').Case; message?: string }> {
  const response = await fetch(`${API_BASE_URL}/cases/details`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-token': token,
    },
    body: JSON.stringify({
      caseNumber: caseNumber,
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Get case failed: ${response.statusText} (${response.status})`);
  }

  return data;
}

// Get case contacts - calls our proxy
export async function getCaseContacts(token: string, caseNumber: string): Promise<{ succeeded: boolean; contacts: import('@/types').CaseContact[]; message?: string }> {
  const response = await fetch(`${API_BASE_URL}/cases/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-token': token,
    },
    body: JSON.stringify({
      caseNumber: caseNumber
    })
  });

  const data = await response.json();

  if (!response.ok) {
     throw new Error(data.error || `Get contacts failed: ${response.statusText} (${response.status})`);
  }

  return data;
}

// Storage helpers for main app credentials
export function storeCredentials(token: string, username: string, idNumber: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CREDENTIALS_KEY_TOKEN, token);
    localStorage.setItem(CREDENTIALS_KEY_USERNAME, username);
    localStorage.setItem(CREDENTIALS_KEY_IDNUMBER, idNumber);
  }
}

export function getStoredCredentials() {
  if (typeof window !== 'undefined') {
    return {
      token: localStorage.getItem(CREDENTIALS_KEY_TOKEN),
      username: localStorage.getItem(CREDENTIALS_KEY_USERNAME),
      idNumber: localStorage.getItem(CREDENTIALS_KEY_IDNUMBER),
    };
  }
  return { token: null, username: null, idNumber: null };
}

// Storage helpers for Business Central token
export function storeBusinessCentralToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BC_TOKEN_KEY, token);
  }
}

export function getStoredBusinessCentralToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(BC_TOKEN_KEY);
  }
  return null;
}

export function clearBusinessCentralToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(BC_TOKEN_KEY);
  }
}

// Clear all stored credentials on logout
export function clearCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CREDENTIALS_KEY_TOKEN);
    localStorage.removeItem(CREDENTIALS_KEY_USERNAME);
    localStorage.removeItem(CREDENTIALS_KEY_IDNUMBER);
    clearBusinessCentralToken(); // Also clear the BC token
  }
}
