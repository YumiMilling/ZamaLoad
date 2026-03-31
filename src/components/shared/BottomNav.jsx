// src/components/shared/BottomNav.jsx
import React from 'react';
import { useApp } from '../../context/AppContext';

const ownerTabs = [
  {
    key: 'ownerDash',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="13" width="8" height="8" rx="1" />
        <path d="M6 13V5a2 2 0 012-2h8l4 4v6" />
        <path d="M14 3v4h4" />
        <circle cx="18" cy="18" r="4" />
        <path d="M18 16v2h2" />
      </svg>
    ),
  },
  {
    key: 'postLoad',
    label: 'Post Load',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    key: 'earnings',
    label: 'Earnings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <path d="M6 16h4" />
      </svg>
    ),
  },
];

const shipperTabs = [
  {
    key: 'browse',
    label: 'Browse',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    key: 'myBookings',
    label: 'My Bookings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
];

// Map sub-views to their parent tab for highlighting
const VIEW_TO_TAB = {
  tripDetail: 'ownerDash',
  loadDetail: 'browse',
  confirmDelivery: 'myBookings',
};

export default function BottomNav() {
  const { state, dispatch } = useApp();
  const tabs = state.role === 'owner' ? ownerTabs : shipperTabs;
  const activeTab = VIEW_TO_TAB[state.view] || state.view;

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            className={`nav-tab ${isActive ? 'nav-tab--active' : ''}`}
            onClick={() => dispatch({ type: 'NAV', view: tab.key })}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
