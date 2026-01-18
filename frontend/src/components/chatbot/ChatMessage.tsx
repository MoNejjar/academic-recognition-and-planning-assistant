import type { ChatMessage as ChatMessageType } from '../../types';
import SourcesDisplay from './SourcesDisplay';

interface Props {
  message: ChatMessageType;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatContent(text: string, isUserMessage: boolean): string {
  const escaped = escapeHtml(text);

  if (isUserMessage) {
    return escaped.replace(/\n/g, '<br/>');
  }

  // For assistant messages, apply markdown formatting to escaped content
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.*)$/gm, '• $1')
    .replace(/\n/g, '<br/>');
}

export default function ChatMessage({ message }: Props): JSX.Element {
  const isUser = message.role === 'user';
  const hasSources = !isUser && message.sources && message.sources.length > 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: 12,
      marginBottom: 8,
      background: '#f5f5f5',
      borderRadius: 12,
      flexDirection: isUser ? 'row-reverse' : 'row',
    }}>
      {/* Avatar */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: isUser ? '#0051a2' : '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        flexShrink: 0,
      }}>
        {isUser ? '👤' : '🎓'}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: '#333',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
          dangerouslySetInnerHTML={{ __html: formatContent(message.content, isUser) }}
        />
        {hasSources && <SourcesDisplay sources={message.sources!} />}
      </div>
    </div>
  );
}
