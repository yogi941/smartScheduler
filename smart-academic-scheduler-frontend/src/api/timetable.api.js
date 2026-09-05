import apiClient from './client';

export async function listTimetables(params = {}) {
  const response = await apiClient.get('/timetables', { params });
  return { data: response.data.data, meta: response.data.meta };
}

export async function getTimetableById(id) {
  const response = await apiClient.get(`/timetables/${id}`);
  return response.data.data;
}

export async function generateTimetables(payload) {
  const response = await apiClient.post('/timetables/generate', payload);
  return response.data.data;
}

export async function publishTimetable(id) {
  const response = await apiClient.patch(`/timetables/${id}/publish`);
  return response.data.data;
}

export async function archiveTimetable(id) {
  const response = await apiClient.patch(`/timetables/${id}/archive`);
  return response.data.data;
}

/**
 * Downloads a timetable export (PDF or Excel) and triggers a browser
 * save. Deliberately routed through the shared Axios `apiClient` — a
 * plain `<a href="...">` to this URL would NOT carry the Bearer access
 * token (it lives in memory, attached only via the request interceptor),
 * so the export endpoint would 401 for anyone whose token isn't also
 * somehow available via cookie. `responseType: 'blob'` lets Axios return
 * the raw binary response, which we then turn into a temporary object
 * URL to drive the download without ever writing the file to disk
 * ourselves.
 *
 * @param {string} id - Timetable id
 * @param {'pdf'|'excel'} format
 * @param {string} [suggestedFileName]
 */
export async function downloadTimetableExport(id, format, suggestedFileName) {
  const response = await apiClient.get(`/timetables/${id}/export/${format}`, {
    responseType: 'blob',
  });

  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = suggestedFileName || `timetable.${format === 'excel' ? 'xlsx' : 'pdf'}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}
