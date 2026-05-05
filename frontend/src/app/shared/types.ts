export type AgentState = 'idle' | 'loading' | 'done';

export interface Pollutant {
  key: string;
  value: number;
  unit: string;
  badgeClass: string;
  dotClass: string;
}

export interface Capability {
  label: string;
  description: string;
  icon: string;
}

export interface SampleProduct {
  name: string;
  reason: string;
  price: string;
  icon: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
}

export interface AgentTheme {
  gradient: string;
  glow: string;
  glowPosition: string;
  iconBg: string;
  iconText: string;
  badgeBg: string;
  badgeText: string;
  button: string;
}

export interface AgentConfig {
  id: 'iris' | 'hermes';
  name: string;
  role: string;
  description: string;
  mainIconPaths: string[];
  capabilitiesTitle: string;
  capabilities: Capability[];
  sampleTitle: string;
  theme: AgentTheme;
  buttonText: string;
  buttonLoadingText: string;
  buttonIconPath: string;
}