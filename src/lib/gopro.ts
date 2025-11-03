// GoPro API client with robust token management
// Handles token refresh on 401 errors with clear user feedback

export type TokenBundle = { token: string; expiresAt?: number };

let tokenCache: TokenBundle | null = null;

/**
 * Store token bundle in memory and localStorage
 */
export function setToken(bundle: TokenBundle): void {
  tokenCache = bundle;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('gopro_token', JSON.stringify(bundle));
    } catch (e) {
      console.error('[gopro.ts] Failed to store token in localStorage:', e);
    }
  }
}

/**
 * Retrieve token bundle from cache or localStorage
 * ALWAYS checks localStorage to ensure persistence across navigation
 */
export function getToken(): TokenBundle | null {
  // Always read from localStorage in browser to handle module reinitialization
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('gopro_token');
    if (!raw) {
      tokenCache = null;
      return null;
    }
    try {
      tokenCache = JSON.parse(raw);
      return tokenCache;
    } catch (e) {
      console.error('[gopro.ts] Failed to parse token from localStorage:', e);
      tokenCache = null;
      return null;
    }
  }

  // Fallback to cache if not in browser (shouldn't happen in practice)
  return tokenCache;
}

/**
 * Clear token from cache and storage
 */
export function clearToken(): void {
  tokenCache = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gopro_token');
  }
}

/**
 * Authenticate with GoPro and get a fresh token
 */
export async function authenticate(username: string, password: string): Promise<TokenBundle> {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(data.error || `Innskráning mistókst: ${response.statusText} (${response.status})`);
  }

  const data = await response.json();
  return { token: data.token, expiresAt: data.expiresAt };
}

/**
 * Search for cases by ID number
 */
export async function searchCases(idNumber: string): Promise<any> {
  const bundle = getToken();

  if (!bundle?.token) {
    throw new Error('Auðkenni vantar. Vinsamlega skráðu þig inn.');
  }

  const res = await fetch('/api/cases/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-token': bundle.token,
    },
    body: JSON.stringify({ contactIdNumber: idNumber }),
  });

  // Accept refresh from server if provided
  const refreshed = res.headers.get('x-refreshed-token');
  if (refreshed) {
    setToken({ token: refreshed, expiresAt: Date.now() + 25 * 60 * 1000 });
  }

  if (res.status === 401) {
    throw new Error('Auðkenni útrunnið. Vinsamlega skráðu þig inn á ný.');
  }

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error || 'Leit mistókst');
  }

  return res.json();
}

/**
 * Get case details by case number
 */
export async function getCaseDetails(caseNumber: string): Promise<any> {
  const bundle = getToken();
  if (!bundle?.token) {
    throw new Error('Auðkenni vantar. Vinsamlega skráðu þig inn.');
  }

  const res = await fetch('/api/cases/details', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-token': bundle.token,
    },
    body: JSON.stringify({ caseNumber }),
  });

  // Accept refresh from server if provided
  const refreshed = res.headers.get('x-refreshed-token');
  if (refreshed) {
    setToken({ token: refreshed, expiresAt: Date.now() + 25 * 60 * 1000 });
  }

  if (res.status === 401) {
    throw new Error('Auðkenni útrunnið. Vinsamlega skráðu þig inn á ný.');
  }

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error || 'Mistókst að sækja málsgögn');
  }

  return res.json();
}

/**
 * Get case contacts by case number
 */
export async function getCaseContacts(caseNumber: string): Promise<any> {
  const bundle = getToken();
  if (!bundle?.token) {
    throw new Error('Auðkenni vantar. Vinsamlega skráðu þig inn.');
  }

  const res = await fetch('/api/cases/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-token': bundle.token,
    },
    body: JSON.stringify({ caseNumber }),
  });

  // Accept refresh from server if provided
  const refreshed = res.headers.get('x-refreshed-token');
  if (refreshed) {
    setToken({ token: refreshed, expiresAt: Date.now() + 25 * 60 * 1000 });
  }

  if (res.status === 401) {
    throw new Error('Auðkenni útrunnið. Vinsamlega skráðu þig inn á ný.');
  }

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error || 'Mistókst að sækja málsaðila');
  }

  return res.json();
}
