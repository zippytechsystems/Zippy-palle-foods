import React from 'react';

/**
 * CustomerAppTrigger Component
 * 
 * Embed this tiny 24px low-opacity 'Z' logo trigger into the customer app.
 * It sits discreetly at the side edge of the screen, completely invisible to normal
 * residents, but gives the business owner immediate 1-click access to the Admin Dashboard.
 * 
 * Props:
 * - adminUrl: Full URL to the admin dashboard (e.g. from env or Vercel URL)
 */
export default function CustomerAppTrigger({ 
  adminUrl = 'https://zfresh-admin.vercel.app' 
}) {
  return (
    <a
      href={adminUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Staff Portal"
      title="Admin Dashboard"
      style={{
        position: 'fixed',
        right: '6px',
        bottom: '80px',
        width: '24px',
        height: '24px',
        opacity: 0.18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1b4332',
        color: '#ffffff',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '900',
        fontFamily: 'sans-serif',
        textDecoration: 'none',
        zIndex: 9999,
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.9';
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.18';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      Z
    </a>
  );
}
