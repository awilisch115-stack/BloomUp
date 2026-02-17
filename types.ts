
export interface StylePreset {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface ImplementationStep {
  phase: string;
  title: string;
  actions: string[];
}

export interface RedesignResult {
  originalImage: string;
  redesignedImage: string;
  style: StylePreset;
  inventory: ShoppingSuggestion[];
  implementationGuide: ImplementationStep[];
  maintenanceChecklist: string[];
}

export interface ShoppingSuggestion {
  item: string;
  description: string;
  priceRange: string;
}

export enum Page {
  HOME = 'HOME',
  LAB = 'LAB',
  PLANS = 'PLANS',
  PAYMENT = 'PAYMENT'
}

export enum AppStep {
  UPLOAD,
  PROCESSING,
  RESULT
}

export type PlanType = 'FREE' | 'PRO';
