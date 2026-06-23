/**
 * TechRadar Togo — Match Engine (v2)
 *
 * Algorithme TF-IDF simplifié :
 * - Chaque compétence utilisateur est pondérée selon sa fréquence dans le texte (TF)
 *   et pénalisée si elle est trop commune (IDF naïf via stopwords).
 * - Les domaines (Web, Mobile, Data…) servent de signal de correspondance secondaire.
 * - Retourne un score entre 0 et 100.
 *
 * Si l'utilisateur n'a pas de compétences renseignées, on utilise un matching
 * par domaine uniquement pour toujours afficher quelque chose.
 */

// Mots trop génériques qui ne doivent pas peser autant
const STOPWORDS = new Set([
  "les", "des", "une", "pour", "avec", "notre", "vous", "dans", "qui",
  "sur", "par", "est", "son", "ses", "aux", "and", "the", "for", "with",
  "tech", "togo", "nous", "votre", "entre", "projet", "tout",
]);

// Domaines de la plateforme
const DOMAINS = ["web", "mobile", "data", "design", "ia", "cybersécurité", "entrepreneuriat", "général"];

// Mots associés à chaque domaine (pour matching implicite)
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  web: ["react", "vue", "angular", "html", "css", "javascript", "typescript", "frontend", "backend", "node", "django", "api", "rest", "fullstack"],
  mobile: ["flutter", "react native", "android", "ios", "swift", "kotlin", "mobile", "app"],
  data: ["python", "pandas", "sql", "machine learning", "tableau", "powerbi", "analytics", "data", "bigquery", "ia"],
  design: ["figma", "ux", "ui", "prototypage", "wireframe", "sketch", "design", "interface"],
  ia: ["machine learning", "deep learning", "tensorflow", "gpt", "llm", "nlp", "ia", "modèle", "intelligence", "artificielle", "data"],
  cybersecurite: ["sécurité", "pentest", "cybersécurité", "firewall", "ctf", "audit", "hacker", "owasp"],
  entrepreneuriat: ["startup", "business", "levée", "fonds", "incubateur", "pitch", "mvp", "accélération"],
  general: ["gestion", "scrum", "agile", "jira", "product", "management", "communication", "hackathon"],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function termFrequency(term: string, docTokens: string[]): number {
  const count = docTokens.filter((t) => t === term).length;
  return count / (docTokens.length || 1);
}

/**
 * Calcule un score de correspondance entre les compétences utilisateur
 * et le texte d'une opportunité.
 *
 * @param userSkills - Compétences de l'utilisateur (ex: "React, Node.js, TypeScript")
 * @param opportunityText - Texte de l'opportunité (titre + description + domaine)
 * @param oppDomain - Domaine de l'opportunité (ex: "Web", "Mobile")
 * @returns Score entre 0 et 100
 */
export function calculateMatchScore(
  userSkills: string | undefined,
  opportunityText: string,
  oppDomain?: string
): number {
  const oppTokens = tokenize(opportunityText);

  // ─── Cas 1 : pas de compétences → matching par domaine uniquement ─────────
  if (!userSkills || userSkills.trim().length === 0) {
    if (!oppDomain) return 0;
    const domainKey = tokenize(oppDomain)[0] ?? "";
    const domainWords = DOMAIN_KEYWORDS[domainKey] ?? [];
    if (domainWords.length === 0) return 0;
    const matchedDomainWords = domainWords.filter((kw) =>
      oppTokens.some((t) => t.includes(kw) || kw.includes(t))
    );
    return Math.min(Math.round((matchedDomainWords.length / domainWords.length) * 60), 60);
  }

  // ─── Cas 2 : compétences renseignées → TF-IDF simplifié ──────────────────
  const skillTokens = tokenize(userSkills);
  if (skillTokens.length === 0) return 0;

  let weightedScore = 0;
  let maxWeight = 0;

  for (const skill of skillTokens) {
    // Poids IDF naïf : les skills courts et communs valent moins
    const idf = skill.length < 3 ? 0.3 : skill.length < 5 ? 0.7 : 1.0;
    const tf = termFrequency(skill, oppTokens);
    // Bonus partiel si le skill est contenu dans un token de l'offre
    const partialMatch = oppTokens.some((t) => t.includes(skill) || skill.includes(t)) ? 0.4 : 0;
    const exactMatch = tf > 0 ? 1.0 : partialMatch;

    weightedScore += exactMatch * idf;
    maxWeight += idf;
  }

  const baseScore = maxWeight > 0 ? (weightedScore / maxWeight) * 100 : 0;

  // Bonus domaine : +10 si le domaine correspond (max 100)
  let domainBonus = 0;
  if (oppDomain) {
    const domainKey = tokenize(oppDomain)[0] ?? "";
    const domainWords = DOMAIN_KEYWORDS[domainKey] ?? [];
    const hasMatch = skillTokens.some((s) =>
      domainWords.some((kw) => s.includes(kw) || kw.includes(s))
    );
    if (hasMatch) domainBonus = 10;
  }

  return Math.min(Math.round(baseScore + domainBonus), 100);
}
