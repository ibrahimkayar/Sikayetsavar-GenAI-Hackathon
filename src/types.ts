export type ComplaintCategory = 'kargo' | 'ürün' | 'fiyat' | 'hizmet' | 'diğer';
export type SentimentType = 'negatif' | 'nötr' | 'pozitif';
export type SeverityLevel = 'düşük' | 'orta' | 'yüksek';

export interface ComplaintAnalysis {
  category: ComplaintCategory;
  sentiment: SentimentType;
  severity: SeverityLevel;
  mainIssue: string;
}

export interface OpportunityInversion {
  chainOfThoughtStep1: string; // Şikayetin özündeki gerçek ihtiyaç nedir?
  chainOfThoughtStep2: string; // Marka bu ihtiyacı nasıl bir güce çevirebilir?
  opportunityTheme: string;    // Bunu tek bir kampanya temasıyla ifade et.
}

export interface CampaignGeneration {
  campaignText: string;
  channel: string;
  brandName: string;
}

export interface AdPosterDesign {
  layoutStyle: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    bgType: 'light' | 'dark' | 'gradient';
  };
  visualDescription: string;
  graphicElements: string;
  aiImagePrompt: string;
  imageUrl?: string | null;
}

export interface ProcessResult {
  id: string;
  complaint: string;
  brandName: string;
  channel: string;
  timestamp: string;
  analysis: ComplaintAnalysis;
  requiresHumanIntervention: boolean;
  opportunity: OpportunityInversion | null;
  campaign: CampaignGeneration | null;
  adPoster?: AdPosterDesign | null;
}

export interface CustomBrand {
  id: string;
  name: string;
  voice: string; // samimi, profesyonel, teknolojik vs.
  sector: string;
}
