let fallbackClientId;

function createClientId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    return (character === 'x' ? random : (random & 3) | 8).toString(16);
  });
}

export function getFeedbackClientId() {
  try {
    const saved = localStorage.getItem('ingredient-feedback-id');
    if (saved) return saved;
    fallbackClientId = fallbackClientId || createClientId();
    localStorage.setItem('ingredient-feedback-id', fallbackClientId);
    return fallbackClientId;
  } catch {
    fallbackClientId = fallbackClientId || createClientId();
    return fallbackClientId;
  }
}

async function feedbackRequest(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body.detail || 'Feedback could not be synced.');
  return body;
}

export function getFeedbackStats(clientId) {
  return feedbackRequest(`/stats?client_id=${encodeURIComponent(clientId)}`);
}

export function saveFeedback(clientId, update) {
  return feedbackRequest('/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, ...update }),
  });
}
