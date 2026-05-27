export type DataCapability = 'AIR' | 'BOTH';

export const REGION_CAPABILITIES: Record<string, { air: boolean, water: boolean }> = {
  'Ampelokipoi-Menemeni': { air: true, water: true },
  'Chalkidona': { air: true, water: false },
  'Delta': { air: true, water: true },
  'Kalamaria': { air: true, water: true },
  'Kordelio-Evosmos': { air: true, water: true },
  'Lagkadas': { air: true, water: false },
  'Neapoli-Sykies': { air: true, water: true },
  'Oraiokastro': { air: true, water: false },
  'Pavlos Melas': { air: true, water: true },
  'Pylaia-Chortiatis': { air: true, water: true },
  'Thermaikos': { air: true, water: false },
  'Thermi': { air: true, water: false },
  'Thessaloniki': { air: true, water: true },
  'Volvi': { air: true, water: false }
};