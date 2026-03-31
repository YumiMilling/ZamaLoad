// src/components/shared/AppShell.jsx
import React from 'react';
import { useApp } from '../../context/AppContext';
import BottomNav from './BottomNav';

export default function AppShell({ children }) {
  const { state, dispatch } = useApp();

  const roleClass = state.role === 'owner' ? 'role-pill--owner' : 'role-pill--shipper';
  const roleLabel = state.role === 'owner' ? 'Owner' : 'Shipper';

  return (
    <div className="app-frame">
      <header className="app-header">
        <div className="road-stripe" />
        <div className="header-inner">
          <div className="logo">
            Zama<span>Load</span>
          </div>
          <button
            className={`role-pill ${roleClass}`}
            onClick={() => dispatch({ type: 'SWITCH_ROLE' })}
          >
            {roleLabel}
          </button>
        </div>
      </header>

      <div className="content">
        {children}
      </div>

      <BottomNav />
    </div>
  );
}
