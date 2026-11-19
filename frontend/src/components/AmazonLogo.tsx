import React from 'react';

/**
 * Authentic Amazon "a" with smile arrow vector icon
 */
export const AmazonIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-label="Amazon"
  >
    {/* Stylized Amazon 'a' */}
    <path d="M13.9 11.2c-.1-1.3-.8-2-2.1-2-.9 0-1.6.4-2 1.1l1.7 1c.2-.3.4-.5.7-.5.5 0 .7.3.7.8v.3c-1.8.1-3.2.5-3.2 2 0 1.2.9 1.9 2 1.9 1 0 1.6-.4 2-1v.9h1.9v-4.5h-1zm-.1 3c-.2.6-.7 1-1.3 1-.5 0-.9-.3-.9-.9 0-.8.7-1.1 1.7-1.1h.5v1z" />
    {/* Famous Amazon Smile Arrow from A to Z */}
    <path
      d="M19.8 17.5c-2.4 1.8-5.8 2.7-8.8 2.7-4.2 0-8-1.5-10.9-4-.2-.2-.2-.5 0-.7.3-.2.6-.1.8.1 2.6 2.2 6.1 3.5 10 3.5 2.7 0 5.7-.8 7.9-2.3.4-.3.8.2.4.6l.6.1z"
      fill="#FF9900"
    />
    {/* Arrowhead */}
    <path
      d="M20.5 16.3c-.3-.4-1.7-.8-2.6-.5-.3.1-.3-.2-.1-.4.9-.7 2.4-.5 2.7-.1.3.4.1 1.9-.6 2.6-.2.2-.4.1-.3-.2.2-.6.7-1.1.9-1.4z"
      fill="#FF9900"
    />
  </svg>
);

/**
 * Full Amazon.in Wordmark with Smile Arrow
 */
export const AmazonWordmark: React.FC<{ className?: string }> = ({ className = 'h-5' }) => (
  <svg
    viewBox="0 0 100 24"
    fill="currentColor"
    className={className}
    aria-label="Amazon.in"
  >
    {/* 'amazon' text */}
    <text
      x="0"
      y="15"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="16"
      fontWeight="bold"
      letterSpacing="-0.5"
    >
      amazon<tspan fontSize="11" fontWeight="normal" fill="#FF9900">.in</tspan>
    </text>
    {/* Smile arrow */}
    <path
      d="M3 18.5 Q 26 25 50 18"
      stroke="#FF9900"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <polygon points="50,16 54,19 49,21" fill="#FF9900" />
  </svg>
);
