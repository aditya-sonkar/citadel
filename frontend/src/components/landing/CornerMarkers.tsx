import React from 'react';

const CornerMarkers: React.FC = () => (
  <>
    <span aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none', lineHeight: 0, top: '-1px', left: '-1px' }}>
      <svg width="7" height="7" viewBox="0 0 10 10" fill="none" overflow="visible">
        <path d="M 1.250 10.000 L 1.250 1.250 L 10.000 1.250" stroke="currentColor" strokeWidth="1.5" strokeLinecap="butt" strokeLinejoin="miter" fill="none" />
      </svg>
    </span>
    <span aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none', lineHeight: 0, top: '-1px', right: '-1px' }}>
      <svg width="7" height="7" viewBox="0 0 10 10" fill="none" overflow="visible">
        <path d="M 0.000 1.250 L 8.750 1.250 L 8.750 10.000" stroke="currentColor" strokeWidth="1.5" strokeLinecap="butt" strokeLinejoin="miter" fill="none" />
      </svg>
    </span>
    <span aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none', lineHeight: 0, bottom: '-1px', left: '-1px' }}>
      <svg width="7" height="7" viewBox="0 0 10 10" fill="none" overflow="visible">
        <path d="M 1.250 0.000 L 1.250 8.750 L 10.000 8.750" stroke="currentColor" strokeWidth="1.5" strokeLinecap="butt" strokeLinejoin="miter" fill="none" />
      </svg>
    </span>
    <span aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none', lineHeight: 0, bottom: '-1px', right: '-1px' }}>
      <svg width="7" height="7" viewBox="0 0 10 10" fill="none" overflow="visible">
        <path d="M 0.000 8.750 L 8.750 8.750 L 8.750 0.000" stroke="currentColor" strokeWidth="1.5" strokeLinecap="butt" strokeLinejoin="miter" fill="none" />
      </svg>
    </span>
  </>
);

export default CornerMarkers;
