import { useState } from 'react';
import type { SourceReference } from '../../types';

export default function SourcesDisplay({ sources }: { sources: SourceReference[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!sources?.length) return null;

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
        {sources.length} Source{sources.length !== 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sources.map((s, i) => (
          <div key={i}>
            <button
              onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: 12,
                color: '#0051a2',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 10 }}>{expandedIndex === i ? '▼' : '▶'}</span>
              <span style={{ fontWeight: 500 }}>
                {s.document}{s.page && ` (p. ${s.page})`}
              </span>
            </button>
            {expandedIndex === i && (
              <div style={{
                marginTop: 6,
                marginLeft: 16,
                padding: 12,
                background: 'white',
                borderRadius: 6,
                border: '1px solid #e0e0e0',
                fontSize: 13,
                lineHeight: 1.6,
                color: '#333',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                maxHeight: 300,
                overflowY: 'auto',
              }}>
                {s.chunk_text}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
