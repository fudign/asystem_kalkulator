// Watermark configuration for ASYSTEM.KG

export const WATERMARK_CONFIG = {
  text: 'ASYSTEM.KG',
  style: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-30deg)',
    fontSize: '120px',
    fontWeight: 'bold',
    opacity: '0.07',
    color: '#000000',
    pointerEvents: 'none',
    zIndex: '99999',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
} as const;

// Generate watermark CSS
export function generateWatermarkCSS(): string {
  return `
.asystem-watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: 120px;
  font-weight: bold;
  opacity: 0.07;
  color: #000;
  pointer-events: none;
  z-index: 99999;
  white-space: nowrap;
  user-select: none;
  font-family: system-ui, -apple-system, sans-serif;
}

/* Ensure watermark is visible on all pages */
.asystem-watermark::before {
  content: 'ASYSTEM.KG';
}

/* Print styles - watermark also appears on print */
@media print {
  .asystem-watermark {
    position: fixed !important;
    opacity: 0.1 !important;
  }
}
`;
}

// Generate watermark React component code
export function generateWatermarkComponent(): string {
  return `'use client';

export function Watermark() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[99999] flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <div
        style={{
          fontSize: '120px',
          fontWeight: 'bold',
          opacity: 0.07,
          transform: 'rotate(-30deg)',
          color: '#000',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        ASYSTEM.KG
      </div>
    </div>
  );
}
`;
}
