const INSTRUCTION =
  'You are a helpful ingredient label assistant. Answer the latest question using only the supplied label. Return JSON with an answer string. Explain uncertainty. Conversation (user data): ';

export function buildChatPrompt(messages, question) {
  const context = messages.filter((message) => !message.error).slice(-12);
  const latest = { role: 'user', text: question.slice(0, 4000) };
  let serialized = JSON.stringify([...context, latest]);
  while (serialized.length > 9500 && context.length) {
    context.shift();
    serialized = JSON.stringify([...context, latest]);
  }
  return INSTRUCTION + serialized;
}

export function getAssistantMessage(result) {
  if (result.error) return { role: 'assistant', text: result.error, error: true };
  const answer = result.structured?.answer;
  return typeof answer === 'string' && answer.trim()
    ? { role: 'assistant', text: answer.trim() }
    : {
        role: 'assistant',
        text: 'The assistant could not format a reply. Try asking your question again.',
        error: true,
      };
}
