import { motion, useReducedMotion } from 'motion/react';
import Markdown from 'react-markdown';
import PromptBar from '../../../components/reactbits/PromptBar';
import ThoughtLine from '../../../components/reactbits/ThoughtLine';
import Button from '../../../components/ui/Button';
import { useChatScroll } from '../../../hooks/useChatScroll';
import { colors, radii } from '../../../styles/theme';
import './ChatPanel.css';

const SUGGESTIONS = ['Which allergens are listed?', 'Explain these ingredients.'];
const MARKDOWN_COMPONENTS = {
  h1: ({ children }) => <h4>{children}</h4>,
  h2: ({ children }) => <h4>{children}</h4>,
  h3: ({ children }) => <h4>{children}</h4>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
};

export default function ChatPanel({ messages, pending, disabled, onSend, onCancel }) {
  const { conversation, onScroll } = useChatScroll(messages, pending);
  const reduced = useReducedMotion();
  return (
    <div className="chatbot-panel">
      <div
        ref={conversation}
        className="chat-messages"
        role="log"
        aria-label="Conversation with label assistant"
        aria-live="polite"
        aria-relevant="additions"
        onScroll={onScroll}
      >
        {!messages.length && (
          <div className="chat-welcome">
            <h3>What would you like to know?</h3>
            <p>Ask about an ingredient or the allergens listed on this package.</p>
            <div className="chat-suggestions">
              {SUGGESTIONS.map((question) => (
                <Button
                  key={question}
                  size="sm"
                  disabled={disabled}
                  onClick={() => onSend(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <motion.article
            key={index}
            className={`chat-message chat-${message.role} ${message.error ? 'chat-message--error' : ''}`}
            aria-label={message.role === 'user' ? 'Your message' : 'Assistant reply'}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.16 }}
          >
            <span className="chat-sender">
              {message.role === 'user' ? 'You' : 'Ingredient assistant'}
            </span>
            <div className="chat-bubble">
              {message.role === 'user' ? (
                <p>{message.text}</p>
              ) : (
                <Markdown skipHtml components={MARKDOWN_COMPONENTS}>
                  {message.text}
                </Markdown>
              )}
            </div>
          </motion.article>
        ))}
        {pending && (
          <div className="chat-thinking">
            <ThoughtLine
              label="Reading your label"
              fontSize={13}
              color={colors.secondary}
              glyphColor={colors.accent}
              shimmer={false}
              breathDepth={0.2}
              showTimer={false}
            />
          </div>
        )}
      </div>
      <div className="chat-composer">
        <PromptBar
          placeholder="Ask about this label"
          sources={[]}
          commands={[]}
          models={[]}
          efforts={[]}
          width="100%"
          background={colors.surface}
          color={colors.text}
          menuBackground={colors.surface}
          sparkColor={colors.accent}
          sparkBoost={0}
          radius={radii.inner}
          maxRows={4}
          morphDuration={180}
          busy={disabled}
          onStop={pending ? onCancel : undefined}
          onSend={(text) => {
            if (!disabled) onSend(text);
          }}
        />
        <p>Answers are based on the detected label text.</p>
      </div>
    </div>
  );
}
