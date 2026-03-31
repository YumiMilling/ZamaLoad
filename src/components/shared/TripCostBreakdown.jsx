import { C, FONT } from '../../theme';
import { calculateTripCost, FUEL_PRICE_PER_LITRE } from '../../data/routeData';

/**
 * Trip cost breakdown — shows distance, fuel, tolls, driver cost, total, and profit margin.
 * The kind of data that makes a trucker say "this app knows my business."
 */
export default function TripCostBreakdown({ origin, destination, truckType, cargoValue }) {
  const cost = calculateTripCost(origin, destination, truckType);
  if (!cost.distanceKm) return null;

  const profit = cargoValue - cost.totalCost;
  const profitPct = cargoValue > 0 ? Math.round((profit / cargoValue) * 100) : 0;
  const isProfitable = profit > 0;

  const Row = ({ label, value, bold, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.line}` }}>
      <span style={{ fontFamily: FONT.body, fontSize: 14, color: C.dust }}>{label}</span>
      <span style={{ fontFamily: FONT.heading, fontSize: bold ? 18 : 15, fontWeight: bold ? 900 : 700, color: color || C.ink }}>
        {value}
      </span>
    </div>
  );

  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, marginBottom: 16 }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: '#f4f0e8', borderBottom: `1px solid ${C.line}` }}>
        <span style={{ fontFamily: FONT.heading, fontSize: 14, fontWeight: 700, color: C.ink, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          Trip Cost Breakdown
        </span>
      </div>

      <div style={{ padding: '4px 16px 16px' }}>
        {/* Distance */}
        <Row label="Route distance" value={`${cost.distanceKm.toLocaleString()} km`} />

        {/* Fuel */}
        <Row
          label={`Fuel (${cost.litresNeeded}L at K${FUEL_PRICE_PER_LITRE}/L · ${cost.kmPerLitre} km/L)`}
          value={`K${cost.fuelCost.toLocaleString()}`}
        />

        {/* Tolls */}
        {cost.tolls.length > 0 ? (
          <div style={{ borderBottom: `1px solid ${C.line}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 4px' }}>
              <span style={{ fontFamily: FONT.body, fontSize: 14, color: C.dust }}>
                Toll gates ({cost.tolls.length})
              </span>
              <span style={{ fontFamily: FONT.heading, fontSize: 15, fontWeight: 700, color: C.ink }}>
                K{cost.totalTolls.toLocaleString()}
              </span>
            </div>
            <div style={{ paddingBottom: 8 }}>
              {cost.tolls.map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0 2px 16px', fontFamily: FONT.body, fontSize: 13, color: C.dust }}>
                  <span>{t.name}</span>
                  <span>K{t.fee}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Row label="Toll gates" value="None on route" />
        )}

        {/* Driver */}
        <Row
          label={`Driver allowance (${cost.tripDays} day${cost.tripDays > 1 ? 's' : ''} at K250/day)`}
          value={`K${cost.driverCost.toLocaleString()}`}
        />

        {/* Total cost */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 8px', borderBottom: `2px solid ${C.ink}` }}>
          <span style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: C.ink, textTransform: 'uppercase' }}>
            Total trip cost
          </span>
          <span style={{ fontFamily: FONT.heading, fontSize: 20, fontWeight: 900, color: C.amberDk }}>
            K{cost.totalCost.toLocaleString()}
          </span>
        </div>

        {/* Profit margin */}
        {cargoValue > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px' }}>
            <span style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: isProfitable ? C.green : C.red, textTransform: 'uppercase' }}>
              {isProfitable ? 'Profit' : 'Loss'}
            </span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: FONT.heading, fontSize: 22, fontWeight: 900, color: isProfitable ? C.green : C.red }}>
                K{Math.abs(profit).toLocaleString()}
              </span>
              <div style={{ fontFamily: FONT.body, fontSize: 12, color: C.dust }}>
                {profitPct}% of cargo value (K{cargoValue.toLocaleString()})
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
