import { SKILL_DICTIONARY } from './skillsDictionary';

/**
 * Searches a text string (e.g., a resume) and extracts all matched skills from SKILL_DICTIONARY.
 * Matches are case-insensitive and handle specific boundary/symbol conditions (e.g. "C++", "C#", "Go").
 */
export function extractSkillsFromText(text: string): string[] {
  if (!text || typeof text !== 'string') return [];

  const foundSkills = new Set<string>();
  const normalizedText = text.toLowerCase();

  for (const skill of SKILL_DICTIONARY) {
    for (const synonym of skill.synonyms) {
      try {
        // Build accurate regex matching for each skill synonym
        // Some synonyms have built-in boundaries like \\b to avoid grabbing substrings (e.g. matching 'R' inside words)
        let regex: RegExp;
        if (synonym.includes('\\b') || synonym.includes('\\+') || synonym.includes('#')) {
          // If the synonym already specifies specific boundaries or complex chars like C++, C#, use it as-is
          regex = new RegExp(synonym, 'i');
        } else {
          // Default to robust word boundaries so "Java" doesn't match "Javascript" or "Kotlin" doesn't match a typo
          regex = new RegExp(`\\b${escapeRegExp(synonym)}\\b`, 'i');
        }

        if (regex.test(normalizedText)) {
          foundSkills.add(skill.name);
          break; // Stop testing other synonyms for this skill once matched
        }
      } catch (e) {
        // Fallback simple search if regex compiling fails
        if (normalizedText.includes(synonym.toLowerCase())) {
          foundSkills.add(skill.name);
          break;
        }
      }
    }
  }

  return Array.from(foundSkills);
}

/**
 * Escapes characters for safe regex creation
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Groups skills by their standard categories for visual displays
 */
export function groupSkillsByCategory(skills: string[]) {
  const grouped: Record<string, string[]> = {};
  
  for (const skillName of skills) {
    const definition = SKILL_DICTIONARY.find(s => s.name === skillName);
    const category = definition ? definition.category : 'Other Technical';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(skillName);
  }
  
  return grouped;
}
