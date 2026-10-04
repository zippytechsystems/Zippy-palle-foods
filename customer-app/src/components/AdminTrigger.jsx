import React from 'react';

/**
 * AdminTrigger Component
 * 
 * Discreet 24px low-opacity 'Z' logo trigger placed on the side edge.
 * Completely invisible to standard residents, but gives the owner 1-click
 * instant access to the Admin Dashboard (admin.<mydomain>).
 */
export default function AdminTrigger({ adminUrl }) {
  const targetUrl = adminUrl || (window.location.hostname.includes('localhost') 
    ? 'http://localhost:5173' 
    : `https://admin.${window.location.hostname.replace(/^www\./, '')}`);

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Staff"
      title="Admin Dashboard"
      className="secret-z-trigger"
    >
      Z
    </a>
  );
}
