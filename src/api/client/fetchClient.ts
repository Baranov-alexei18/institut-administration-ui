const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function fetchClient<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let errorData: any;

    try {
      errorData = await res.json();
    } catch {
      errorData = { message: res.statusText };
    }

    throw {
      status: res.status,
      data: errorData,
    };
  }

  // пустые ответы (204)
  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json();

  return data;
}
