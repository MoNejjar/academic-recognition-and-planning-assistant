import { useState } from 'react';
import type { SourceReference } from '../../types';
import { getDocumentUrl } from '../../services/chatbot';

export default function SourcesDisplay({ sources }: { sources: SourceReference[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources?.length) return null;

  return (
    <div style={{
      marginTop: 12,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 12px',
          background: '#f1f5f9',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 12,
          color: '#64748b',
          fontWeight: 600,
          transition: 'all 0.15s',
          width: '100%',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#e2e8f0';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#f1f5f9';
        }}
      >
        <span style={{
          fontSize: 10,
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
          transition: 'transform 0.15s',
          display: 'inline-block',
        }}>
          ▶
        </span>
        <span>Sources ({sources.length})</span>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div style={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {sources.map((s, i) => (
            <div
              key={i}
              style={{
                borderLeft: '3px solid #3b82f6',
                paddingLeft: 12,
                paddingTop: 4,
                paddingBottom: 4,
              }}
            >
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#3b82f6',
                marginBottom: 6,
              }}>
                {s.document}
                {s.page && <span style={{ fontWeight: 400, color: '#64748b' }}> · p. {s.page}</span>}
              </div>

              <div style={{
                fontSize: 12,
                lineHeight: 1.6,
                color: '#475569',
                fontStyle: 'italic',
                background: '#f8fafc',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                maxHeight: 120,
                overflowY: 'auto',
              }}>
                "{s.chunk_text}"
              </div>

              {s.url && (
                <a
                  href={getDocumentUrl(s.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 6,
                    fontSize: 11,
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  View document →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
