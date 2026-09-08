export type Language = 'en' | 'sv';
export type Theme = 'light' | 'dark';

export type LocalizedText = {
  en: string;
  sv?: string;
};

export type Copy = string | LocalizedText | null | undefined;

export type UiCopy = Record<string, string>;

export type SkillTier = 'core' | 'also';

export type Skill = {
  id: string;
  label: LocalizedText;
  icon: string | null;
  category: string;
  tier: SkillTier;
  rank: number;
  months: number;
  years: number;
  ratio: number;
  duration: LocalizedText;
};

export type SkillCatalogEntry = {
  label: LocalizedText;
  icon: string | null;
  category: string;
  tier: SkillTier;
  rank: number;
};

export type Role = {
  id: string;
  title: LocalizedText;
  start: string;
  end: string | null;
  skills: string[];
  summary: LocalizedText;
  highlights?: LocalizedText[];
  current?: boolean;
  durationMonths?: number;
  duration?: LocalizedText;
};

export type Company = {
  id: string;
  company: LocalizedText;
  logo?: string | null;
  url?: string | null;
  location: LocalizedText;
  featured?: boolean;
  kind?: 'career-break' | string;
  roles: Role[];
  skills: string[];
  start?: string;
  end?: string | null;
  current?: boolean;
  durationMonths?: number;
  duration?: LocalizedText;
};

export type Place = {
  id: string;
  city: LocalizedText;
  country: LocalizedText;
  start: string | null;
  end: string | null;
  current: boolean;
  durationMonths: number | null;
  duration: LocalizedText | null;
};

export type Profile = {
  generatedAt: string;
  person: {
    name: string;
    location: LocalizedText;
    photo: string;
    photoSquare?: string;
    email: string;
    emailSubject: string;
    phone: string;
    github: string;
    linkedin: string;
    headline: LocalizedText;
    summary: LocalizedText;
    ai?: LocalizedText;
    availability: LocalizedText;
  };
  coverLetter: {
    body: LocalizedText;
    date: LocalizedText;
  };
  downloads: {
    resume: {
      en: string;
      sv: string;
      enExtras: string;
      svExtras: string;
    };
    coverLetter: {
      en: string;
      sv: string;
    };
  };
  workRights: {
    citizenship: LocalizedText;
    rights: Array<{ id: string; label: LocalizedText }>;
  };
  languages: Array<{ id: string; name: LocalizedText; level: LocalizedText }>;
  locations: Place[];
  experience: Company[];
  education: {
    id: string;
    award: LocalizedText;
    awardShort?: LocalizedText;
    institutionAtAward: LocalizedText;
    institutionCurrent: LocalizedText;
    campus: LocalizedText;
    start: string;
    end: string | null;
    logo?: string | null;
    structure: LocalizedText;
    result: LocalizedText;
  };
  skills: Skill[];
  skillCatalog: Record<string, SkillCatalogEntry>;
  projects: Array<{
    id: string;
    name: string;
    url?: string | null;
    live?: string | null;
    skills: string[];
    stars?: number;
    description: LocalizedText;
  }>;
  educationProjects: Array<{
    id: string;
    name: string;
    grade: string;
    language: string;
    url?: string | null;
    skills: string[];
    description: LocalizedText;
  }>;
  showcase: Array<{
    id: string;
    name: LocalizedText;
    status: string;
    url?: string | null;
    skills?: string[];
    description: LocalizedText;
  }>;
  ui: {
    en: UiCopy;
    sv: UiCopy;
  };
};

export type ProfileContextValue = {
  profile: Profile;
  language: Language;
  setLanguage: (next: Language) => void;
  theme: Theme;
  setTheme: (next: Theme) => void;
  ui: UiCopy;
  skillFilter: string;
  setSkillFilter: (skillId: string) => void;
  includeExtras: boolean;
  setIncludeExtras: (next: boolean) => void;
};
