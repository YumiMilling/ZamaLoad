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

  return (
    <AppShell>
      {Screen ? <Screen /> : <div style={{ padding: 40, textAlign: 'center', color: '#8a8070' }}>Screen not found</div>}
      {demoMode && (
        <DemoWalkthrough onExit={() => {
          setDemoMode(false);
          dispatch({ type: 'SWITCH_ROLE' });
        }} />
      )}
    </AppShell>
  );
}
