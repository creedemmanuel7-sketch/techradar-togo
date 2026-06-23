export function calculateMatchScore(userSkills: string | undefined, opportunityText: string): number {
  if (!userSkills || !opportunityText) return 0;

  // Normalize text: lowercase, remove punctuation, split by space/comma
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2); // Ignore short words

  const skills = normalize(userSkills);
  const text = normalize(opportunityText);

  if (skills.length === 0) return 0;

  let matchCount = 0;
  for (const skill of skills) {
    if (text.includes(skill)) {
      matchCount++;
    }
  }

  // Calculate percentage (max 100%)
  const percentage = Math.round((matchCount / skills.length) * 100);
  return percentage > 100 ? 100 : percentage;
}
