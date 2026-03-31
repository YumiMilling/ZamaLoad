/**
 * Cargo categories and compatibility matrix.
 * Used for consolidated loads — certain cargo types cannot share a truck.
 */

export const CARGO_CATEGORIES = [
  { id: 'construction', label: 'Construction', examples: 'Cement, bricks, sand, gravel, rebar' },
  { id: 'hardware',     label: 'Hardware & Steel', examples: 'Steel, pipes, fittings, tools' },
  { id: 'food_dry',     label: 'Food (Dry)', examples: 'Maize, rice, flour, sugar, beans' },
  { id: 'food_fresh',   label: 'Food (Fresh)', examples: 'Vegetables, fruit, meat (needs refrigeration)' },
  { id: 'household',    label: 'Household Goods', examples: 'Furniture, appliances, clothing' },
  { id: 'chemicals',    label: 'Chemicals', examples: 'Fertiliser, pesticides, cleaning products' },
  { id: 'fuel',         label: 'Fuel & Petroleum', examples: 'Diesel, petrol, lubricants' },
  { id: 'general',      label: 'General / Mixed', examples: 'Mixed goods, parcels, equipment' },
];

/**
 * Compatibility matrix — which categories can share a truck.
 * true = compatible, false = cannot share.
 *
 * Rules:
 * - Construction + Hardware: OK (both dusty/heavy, no food contamination risk)
 * - Construction + Food: NO (cement dust contaminates food)
 * - Chemicals + Food: NO (contamination risk)
 * - Chemicals + Household: NO (safety)
 * - Fuel + everything except chemicals: NO (fire risk, separate transport required)
 * - Food Fresh + anything dusty/chemical: NO
 * - General is compatible with most non-hazardous
 */
const COMPAT = {
  construction: { construction: true,  hardware: true,  food_dry: false, food_fresh: false, household: true,  chemicals: true,  fuel: false, general: true },
  hardware:     { construction: true,  hardware: true,  food_dry: false, food_fresh: false, household: true,  chemicals: false, fuel: false, general: true },
  food_dry:     { construction: false, hardware: false, food_dry: true,  food_fresh: true,  household: true,  chemicals: false, fuel: false, general: true },
  food_fresh:   { construction: false, hardware: false, food_dry: true,  food_fresh: true,  household: false, chemicals: false, fuel: false, general: false },
  household:    { construction: true,  hardware: true,  food_dry: true,  food_fresh: false, household: true,  chemicals: false, fuel: false, general: true },
  chemicals:    { construction: true,  hardware: false, food_dry: false, food_fresh: false, household: false, chemicals: true,  fuel: true,  general: false },
  fuel:         { construction: false, hardware: false, food_dry: false, food_fresh: false, household: false, chemicals: true,  fuel: true,  general: false },
  general:      { construction: true,  hardware: true,  food_dry: true,  food_fresh: false, household: true,  chemicals: false, fuel: false, general: true },
};

/**
 * Check if two cargo categories can share a truck.
 */
export function isCompatible(cat1, cat2) {
  if (!cat1 || !cat2) return true; // if either is unknown, allow it
  return COMPAT[cat1]?.[cat2] ?? false;
}

/**
 * Check if a new cargo category is compatible with ALL existing cargo on a load.
 */
export function isCompatibleWithLoad(newCategory, existingCategories) {
  if (!existingCategories || !existingCategories.length) return true;
  return existingCategories.every(cat => isCompatible(newCategory, cat));
}

/**
 * Get all categories compatible with a given category.
 */
export function getCompatibleCategories(category) {
  if (!category) return CARGO_CATEGORIES;
  return CARGO_CATEGORIES.filter(c => isCompatible(category, c.id));
}
