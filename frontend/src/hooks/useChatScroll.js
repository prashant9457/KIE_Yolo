import { useEffect, useRef } from 'react';

export function useChatScroll(messages, pending) {
  const conversation = useRef(null);
  const followLatest = useRef(true);
  useEffect(() => {
    const element = conversation.current;
    if (element && !messages.length) {
      element.scrollTop = 0;
      return;
    }
    if (element && (followLatest.current || messages.at(-1)?.role === 'user')) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, pending]);
  const onScroll = () => {
    const element = conversation.current;
    if (element)
      followLatest.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
  };
  return { conversation, onScroll };
}
