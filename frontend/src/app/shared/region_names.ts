import { AppLanguage } from '../services/language.service';

export const GREEK_REGION_NAMES: Record<string, string> = {
  'Ampelokipoi-Menemeni': 'Αμπελόκηποι-Μενεμένη',
  'Chalkidona': 'Χαλκηδόνα',
  'Delta': 'Δέλτα',
  'Kalamaria': 'Καλαμαριά',
  'Kordelio-Evosmos': 'Κορδελιό-Εύοσμος',
  'Lagkadas': 'Λαγκαδάς',
  'Neapoli-Sykies': 'Νεάπολη-Συκιές',
  'Oraiokastro': 'Ωραιόκαστρο',
  'Pavlos Melas': 'Παύλος Μελάς',
  'Pylaia-Chortiatis': 'Πυλαία-Χορτιάτης',
  'Thermaikos': 'Θερμαϊκός',
  'Thermi': 'Θέρμη',
  'Thessaloniki': 'Θεσσαλονίκη',
  'Volvi': 'Βόλβη',
};

export function getRegionDisplayName(region: string, language: AppLanguage): string {
  if (language !== 'el') return region;

  return GREEK_REGION_NAMES[region] ?? region;
}
