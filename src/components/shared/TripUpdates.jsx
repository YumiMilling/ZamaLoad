import { useState } from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import { getUser } from '../../data/mockUsers';

const UPDATE_TYPES = [
  { id: 'status',   label: 'Status Update',  icon: '📍', color: C.amber },
  { id: 'delay',    label: 'Delay',           icon: '⏳', color: C.red },
  { id: 'arrival',  label: 'Arriving Soon',   icon: '🏁', color: C.green },
];

const QUICK_MESSAGES = [
  { type: 'status',  msg: 'All good — on schedule' },
  { type: 'status',  msg: 'Passed toll gate, moving well' },
  { type: 'status',  msg: 'Fuel stop — 15 min' },
  { type: 'delay',   msg: 'Heavy traffic — estimated 30 min delay' },
  { type: 'delay',   msg: 'Tyre change — will resume in 30 min' },
  { type: 'delay',   msg: 'Queue at toll gate — 1 hour wait' },
  { type: 'delay',   msg: 'Road block ahead — finding alternate route' },
  { type: 'arrival', msg: 'Almost there — 30 min to destination' },
  { type: 'arrival', msg: 'Arrived at delivery point — waiting for shipper' },
];

export default function TripUpdates({ loadId, canPost }) {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [updateType, setUpdateType] = useState('status');

  const updates = state.tripUpdates
    .filter(u => u.loadId === loadId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const handlePost = (msg, type) => {
    const text = msg || message;
    if (!text.trim()) return;
    dispatch({ type: 'POST_TRIP_UPDATE', loadId, message: text.trim(), updateType: type || updateType });
    setMessage('');
    setShowForm(false);
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="sec-label" style={{ margin: 0 }}>Trip Updates</div>
        {canPost && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: C.amber, border: 'none', padding: '6px 14px', cursor: 'pointer',
              fontFamily: FONT.heading, fontSize: 12, fontWeight: 700, color: C.asphalt,
              textTransform: 'uppercase', letterSpacing: '.06em',
            }}>
            Post Update
          </button>
        )}
      </div>

      {/* Post form (owner only) */}
      {showForm && (
        <div style={{ background: C.white, border: `1px solid ${C.line}`, padding: 16, marginBottom: 12 }}>
          {/* Quick messages */}
          <div style={{ fontFamily: FONT.body, fontSize: 12, color: C.dust, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Quick update
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {QUICK_MESSAGES.map((qm, i) => (
              <button key={i}
                onClick={() => handlePost(qm.msg, qm.type)}
                style={{
                  background: qm.type === 'delay' ? C.redLt : qm.type === 'arrival' ? C.greenLt : '#fef3c7',
                  border: 'none', padding: '6px 10px', cursor: 'pointer',
                  fontFamily: FONT.body, fontSize: 12, color: C.ink, borderRadius: 4,
                }}>
                {qm.msg}
              </button>
            ))}
          </div>

          {/* Custom message */}
          <div style={{ fontFamily: FONT.body, fontSize: 12, color: C.dust, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Or type your own
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" value={message} onChange={e => setMessage(e.target.value)}
              placeholder="e.g. Stuck at Katuba toll..."
              style={{ flex: 1, padding: '10px 12px', fontFamily: FONT.body, fontSize: 14, border: `1px solid ${C.line}`, background: C.paper, color: C.ink, outline: 'none' }}
              onKeyDown={e => e.key === 'Enter' && handlePost()}
            />
            <button onClick={() => handlePost()} className="btn btn--primary" style={{ width: 'auto', padding: '10px 18px' }} disabled={!message.trim()}>
              Send
            </button>
          </div>
          <button onClick={() => setShowForm(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer', marginTop: 8,
            fontFamily: FONT.body, fontSize: 13, color: C.dust,
          }}>
            Cancel
          </button>
        </div>
      )}

      {/* Updates feed */}
      {updates.length === 0 ? (
        <div style={{ fontFamily: FONT.body, fontSize: 14, color: C.dust, padding: '12px 0' }}>
          No updates yet. {canPost ? 'Post an update to keep shippers informed.' : 'The driver will post updates here.'}
        </div>
      ) : (
        <div>
          {updates.map(u => {
            const typeConfig = UPDATE_TYPES.find(t => t.id === u.type) || UPDATE_TYPES[0];
            const author = getUser(u.authorId);
            return (
              <div key={u.id} style={{
                display: 'flex', gap: 12, padding: '10px 0',
                borderBottom: `1px solid ${C.line}`,
              }}>
                <div style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{typeConfig.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT.body, fontSize: 14, color: C.ink, lineHeight: 1.5 }}>
                    {u.message}
                  </div>
                  <div style={{ fontFamily: FONT.body, fontSize: 12, color: C.dust, marginTop: 2 }}>
                    {author?.name || 'Driver'} &middot; {formatTime(u.timestamp)}
                  </div>
                </div>
                <div style={{
                  fontSize: 10, fontFamily: FONT.heading, fontWeight: 700, color: typeConfig.color,
                  textTransform: 'uppercase', letterSpacing: '.06em', flexShrink: 0, marginTop: 4,
                }}>
                  {typeConfig.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
