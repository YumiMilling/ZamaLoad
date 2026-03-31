import { useState } from 'react';
import './styles.css';
import { useApp } from './context/AppContext';
import RoleSelector from './components/shared/RoleSelector';
import AppShell from './components/shared/AppShell';
import DemoWalkthrough from './components/shared/DemoWalkthrough';
// Owner screens
import OwnerDashboard from './components/owner/OwnerDashboard';
import PostLoadForm from './components/owner/PostLoadForm';
import TripDetail from './components/owner/TripDetail';
import Earnings from './components/owner/Earnings';
import MatchedRequests from './components/owner/MatchedRequests';
import PlaceBid from './components/owner/PlaceBid';
// Shipper screens
import FindTruck from './components/shipper/FindTruck';
import BrowseLoads from './components/shipper/BrowseLoads';
import LoadDetail from './components/shipper/LoadDetail';
import MyBookings from './components/shipper/MyBookings';
import ConfirmDelivery from './components/shipper/ConfirmDelivery';
import PostRequest from './components/shipper/PostRequest';
import MyRequests from './components/shipper/MyRequests';
import ViewBids from './components/shipper/ViewBids';

const SCREENS = {
  // Owner
  ownerDash: OwnerDashboard,
  postLoad: PostLoadForm,
  tripDetail: TripDetail,
  earnings: Earnings,
  matchedRequests: MatchedRequests,
  placeBid: PlaceBid,
  // Shipper
  shipperDash: FindTruck,
  findTruck: FindTruck,
  browse: BrowseLoads,
  loadDetail: LoadDetail,
  myBookings: MyBookings,
  confirmDelivery: ConfirmDelivery,
  postRequest: PostRequest,
  myRequests: MyRequests,
  viewBids: ViewBids,
};

export default function App() {
  const { state, dispatch } = useApp();
  const [demoMode, setDemoMode] = useState(false);

  if (!state.role && !demoMode) {
    return <RoleSelector onStartDemo={() => setDemoMode(true)} />;
  }

  const Screen = SCREENS[state.view];

  // Demo welcome screen when no role is set yet
  const DemoWelcome = () => (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <svg width="64" height="64" viewBox="0 0 48 48" fill="none" style={{ marginBottom: 20 }}>
        <rect x="4" y="16" width="28" height="16" rx="2" fill="#e8a020" />
        <rect x="32" y="20" width="12" height="12" rx="2" fill="#e8a020" />
        <path d="M38 20l6 6v6h-6V20z" fill="#b07810" />
        <circle cx="14" cy="34" r="4" fill="#1a1a1a" stroke="#e8a020" strokeWidth="2" />
        <circle cx="38" cy="34" r="4" fill="#1a1a1a" stroke="#e8a020" strokeWidth="2" />
      </svg>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 900, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '.02em' }}>
        Zama<span style={{ color: '#e8a020' }}>Load</span>
      </div>
      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 16, color: '#8a8070', marginTop: 8, lineHeight: 1.6 }}>
        A freight marketplace for Zambia.<br/>Every truck working. Every payment secure.
      </div>
    </div>
  );

  return (
    <AppShell>
      {Screen ? <Screen /> : <DemoWelcome />}
      {demoMode && (
        <DemoWalkthrough onExit={() => {
          setDemoMode(false);
          dispatch({ type: 'SWITCH_ROLE' });
        }} />
      )}
    </AppShell>
  );
}
