import './styles.css';
import { useApp } from './context/AppContext';
import RoleSelector from './components/shared/RoleSelector';
import AppShell from './components/shared/AppShell';
import OwnerDashboard from './components/owner/OwnerDashboard';
import PostLoadForm from './components/owner/PostLoadForm';
import TripDetail from './components/owner/TripDetail';
import Earnings from './components/owner/Earnings';
import BrowseLoads from './components/shipper/BrowseLoads';
import LoadDetail from './components/shipper/LoadDetail';
import MyBookings from './components/shipper/MyBookings';
import ConfirmDelivery from './components/shipper/ConfirmDelivery';

const SCREENS = {
  ownerDash: OwnerDashboard,
  postLoad: PostLoadForm,
  tripDetail: TripDetail,
  earnings: Earnings,
  browse: BrowseLoads,
  loadDetail: LoadDetail,
  myBookings: MyBookings,
  confirmDelivery: ConfirmDelivery,
};

export default function App() {
  const { state } = useApp();

  if (!state.role) return <RoleSelector />;

  const Screen = SCREENS[state.view];

  return (
    <AppShell>
      {Screen ? <Screen /> : <div style={{ padding: 40, textAlign: 'center', color: '#8a8070' }}>Screen not found</div>}
    </AppShell>
  );
}
