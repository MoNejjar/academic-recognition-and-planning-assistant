import { useState } from 'react';
import type { SourceReference } from '../../types';
import { getDocumentUrl } from '../../services/chatbot';

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export default function SourcesDisplay({ sources }: { sources: SourceReference[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!sources?.length) return null;

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
      <div style={{
        fontSize: 11,
        color: '#888',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: 600,
      }}>
        Sources ({sources.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sources.map((s, i) => {
          const isExpanded = expandedIndex === i;
          const preview = truncateText(s.chunk_text, 120);

          return (
            <div
              key={i}
              style={{
                borderLeft: '3px solid #0051a2',
                paddingLeft: 12,
                background: isExpanded ? '#f8fafc' : 'transparent',
                borderRadius: isExpanded ? '0 8px 8px 0' : 0,
                transition: 'background 0.2s',
              }}
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                style={{
                  display: 'block',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '8px 0',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#0051a2',
                  }}>
                    {s.document}
                    {s.page && <span style={{ fontWeight: 400, color: '#666' }}> · p. {s.page}</span>}
                  </span>
                  <span style={{
                    fontSize: 10,
                    color: '#999',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                  }}>
                    ▼
                  </span>
                </div>
                {!isExpanded && (
                  <div style={{
                    fontSize: 12,
                    color: '#666',
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                  }}>
                    "{preview}"
                  </div>
                )}
              </button>

              {isExpanded && (
                <div style={{ paddingBottom: 12 }}>
                  <blockquote style={{
                    margin: 0,
                    padding: '12px 16px',
                    background: 'white',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: 8,
                      left: 12,
                      fontSize: 24,
                      color: '#ddd',
                      fontFamily: 'Georgia, serif',
                      lineHeight: 1,
                    }}>"</span>
                    <div style={{
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: '#444',
                      fontStyle: 'italic',
                      paddingLeft: 16,
                      paddingRight: 8,
                      maxHeight: 200,
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                    }}>
                      {s.chunk_text}
                    </div>
                  </blockquote>
                  {s.url && (
                    <a
                      href={getDocumentUrl(s.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 8,
                        fontSize: 12,
                        color: '#0051a2',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      View original document →
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
