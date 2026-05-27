export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Internship' | 'Full-time' | 'Part-time';
  category: string;
  salary: string;
  description: string;
  requiredSkills: string[];
  isCustom?: boolean; // True if added by administrative user
  experienceLevel: 'Entry Level' | 'Intermediate' | 'Senior' | 'Students';
  applyUrl?: string;
}

export type SkillCategory = 'Languages' | 'Frameworks & Libraries' | 'Databases' | 'Tools & Cloud' | 'Other Technical';

export interface SkillDefinition {
  name: string;
  category: SkillCategory;
  synonyms: string[]; // for regex-based and keyword extraction
}

export interface MatchResult {
  jobId: string;
  matchScore: number; // 0 to 100
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}
