export async function parseApiResponse<T>(response: Response, fallbackMessage = "تعذر تنفيذ العملية."): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? fallbackMessage);
  }

  return payload?.data as T;
}
