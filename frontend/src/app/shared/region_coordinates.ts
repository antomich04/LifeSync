export interface Coordinates{
    lat: number,
    lon: number
};

export const THESSALONIKI_REGIONS: Record<string, Coordinates> = {
    'Ampelokipoi-Menemeni': { lat: 40.6550, lon: 22.9210 },
    'Chalkidona': { lat: 40.7300, lon: 22.6040 },
    'Delta': { lat: 40.6690, lon: 22.8020 },
    'Kalamaria': { lat: 40.5820, lon: 22.9460 },
    'Kordelio-Evosmos': { lat: 40.6660, lon: 22.9030 },
    'Lagkadas': { lat: 40.7620, lon: 23.0640 },
    'Neapoli-Sykies': { lat: 40.6550, lon: 22.9530 },
    'Oraiokastro': { lat: 40.7270, lon: 22.9170 },
    'Pavlos Melas': { lat: 40.6640, lon: 22.9340 },
    'Pylaia-Chortiatis': { lat: 40.6130, lon: 22.9900 },
    'Thermaikos': { lat: 40.5010, lon: 22.9280 },
    'Thermi': { lat: 40.5450, lon: 23.0200 },
    'Thessaloniki': { lat: 40.6290, lon: 22.9470 },
    'Volvi': { lat: 40.6590, lon: 23.6350 }
};

export const REGION_NAMES = Object.keys(THESSALONIKI_REGIONS);