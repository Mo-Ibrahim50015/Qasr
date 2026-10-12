const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  // Set default content type if not uploading FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Auth Token from localStorage if present
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('qasr_token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Pass guest session ID
    let sessionId = localStorage.getItem('qasr_session_id');
    if (!sessionId) {
      sessionId = `sess_${Math.random().toString(36).substring(2)}_${Date.now()}`;
      localStorage.setItem('qasr_session_id', sessionId);
    }
    headers.set('x-session-id', sessionId);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      json.message || 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.',
      response.status,
      json
    );
  }

  return json as T;
}

