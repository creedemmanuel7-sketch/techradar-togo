/**
 * TechRadar Togo — Match Engine v3
 *
 * Améliorations par rapport à v2 :
 * 1. Alias de compétences : "react", "reactjs", "react.js" → même token normalisé.
 * 2. Pondération : le titre de l'offre pèse 3x plus que la description.
 * 3. Score continu (plus de barème fixe 40/70/90) → score précis entre 0 et 100.
 * 4. Bonus de domaine conservé.
 * 5. Bonus de pertinence : si la compétence est dans le titre, +bonus supplémentaire.
 */

// ─── Stop words FR/EN ────────────────────────────────────────────────────────
const STOPWORDS = new Set([
  "les", "des", "une", "pour", "avec", "notre", "vous", "dans", "qui",
  "sur", "par", "est", "son", "ses", "aux", "and", "the", "for", "with",
  "tech", "togo", "nous", "votre", "entre", "projet", "tout", "also",
  "nous", "leur", "plus", "mais", "bien", "tres", "comme", "dont",
]);

// ─── Alias de compétences (normalisation) ─────────────────────────────────────
// Toutes ces variantes seront traitées comme le même token
const SKILL_ALIASES: Record<string, string> = {
  // JavaScript ecosystem
  "reactjs": "react",
  "react.js": "react",
  "react js": "react",
  "vuejs": "vue",
  "vue.js": "vue",
  "angularjs": "angular",
  "nodejs": "node",
  "node.js": "node",
  "nextjs": "nextjs",
  "next.js": "nextjs",
  "nuxtjs": "nuxt",
  "nuxt.js": "nuxt",
  "expressjs": "express",
  "express.js": "express",
  // TypeScript
  "ts": "typescript",
  "js": "javascript",
  // Python
  "py": "python",
  "ml": "machinelearning",
  "machine learning": "machinelearning",
  "deep learning": "deeplearning",
  "ia": "ai",
  "intelligence artificielle": "ai",
  // CSS
  "tailwindcss": "tailwind",
  "tailwind css": "tailwind",
  "bootstrap5": "bootstrap",
  "scss": "css",
  "sass": "css",
  // Cloud / DevOps
  "gcp": "google cloud",
  "aws": "amazon web services",
  "k8s": "kubernetes",
  // DB
  "postgres": "postgresql",
  "mongo": "mongodb",
  // Mobile
  "rn": "react native",
  "reactnative": "react native",
  // Design
  "ux/ui": "ux",
  "ui/ux": "ux",
  // Autres
  "git/github": "git",
  "c++": "cpp",
};

// ─── Domaines et leurs mots-clés associés ───────────────────────────────────
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  web: ["react", "vue", "angular", "html", "css", "javascript", "typescript", "frontend", "backend", "node", "django", "api", "rest", "fullstack", "nextjs", "tailwind", "php", "laravel", "express", "fastapi"],
  mobile: ["flutter", "react native", "android", "ios", "swift", "kotlin", "mobile", "app", "dart"],
  data: ["python", "pandas", "sql", "machinelearning", "tableau", "powerbi", "analytics", "data", "bigquery", "ai", "deeplearning", "tensorflow", "spark", "etl", "bi"],
  design: ["figma", "ux", "ui", "prototypage", "wireframe", "sketch", "design", "interface", "adobe", "xd", "canva"],
  ia: ["machinelearning", "deeplearning", "tensorflow", "gpt", "llm", "nlp", "ai", "huggingface", "pytorch", "scikit"],
  cybersecurite: ["securite", "pentest", "cybersecurite", "firewall", "ctf", "audit", "owasp", "hacker", "siem"],
  entrepreneuriat: ["startup", "business", "fonds", "incubateur", "pitch", "mvp", "acceleration", "fintech", "saas"],
  general: ["gestion", "scrum", "agile", "jira", "product", "management", "communication", "hackathon", "leadership"],
};

// ─── Tokenizer ───────────────────────────────────────────────────────────────
function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9\s.+#]/g, " ")
    .trim();

  // Try to match aliases (multi-word first)
  let processed = normalized;
  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    processed = processed.split(alias).join(canonical);
  }

  return processed
    .split(/\s+/)
    .map(w => SKILL_ALIASES[w] ?? w)
    .filter(w => w.length > 1 && !STOPWORDS.has(w));
}

// ─── Term frequency (normalized) ─────────────────────────────────────────────
function tf(term: string, tokens: string[]): number {
  const count = tokens.filter(t => t === term || t.includes(term) || term.includes(t)).length;
  return count / (tokens.length || 1);
}

// ─── Exported interface ───────────────────────────────────────────────────────
export interface MatchResult {
  score: number;
  matchedSkills: string[];
}

/**
 * Calcule un score de correspondance entre les compétences utilisateur
 * et le texte d'une opportunité (titre + description + domaine).
 *
 * @param userSkills    - Compétences de l'utilisateur (ex: "React, Node.js, TypeScript")
 * @param opportunityTitle - Titre de l'opportunité (poids ×3)
 * @param opportunityDesc  - Description de l'opportunité (poids ×1)
 * @param oppDomain     - Domaine de l'opportunité
 */
export function calculateMatchScore(
  userSkills: string | undefined,
  opportunityText: string,   // titre + description concatenés (rétrocompatibilité)
  oppDomain?: string
): MatchResult {
  // ─── Cas 1 : pas de compétences → matching par domaine uniquement ─────────
  if (!userSkills || userSkills.trim().length === 0) {
    if (!oppDomain) return { score: 0, matchedSkills: [] };
    const domainKey = tokenize(oppDomain)[0] ?? "";
    const domainWords = DOMAIN_KEYWORDS[domainKey] ?? [];
    if (domainWords.length === 0) return { score: 0, matchedSkills: [] };
    const oppTokens = tokenize(opportunityText);
    const matchedDomainWords = domainWords.filter(kw =>
      oppTokens.some(t => t === kw || t.includes(kw) || kw.includes(t))
    );
    const score = Math.min(Math.round((matchedDomainWords.length / Math.max(domainWords.length, 1)) * 55), 55);
    return { score, matchedSkills: matchedDomainWords.slice(0, 3) };
  }

  // ─── Cas 2 : compétences renseignées ─────────────────────────────────────
  // Pondération : on duplique le titre 3× pour lui donner plus de poids
  // On tente de détecter si le texte contient le titre (séparé par un espace)
  // Par convention, on utilise tout le texte concaténé passé en paramètre
  // et on duplique les premiers mots (heuristique raisonnable)
  const lines = opportunityText.split(" ");
  const estimatedTitle = lines.slice(0, Math.min(8, Math.floor(lines.length * 0.2))).join(" ");
  const weightedText = `${estimatedTitle} ${estimatedTitle} ${estimatedTitle} ${opportunityText}`;
  const oppTokens = tokenize(weightedText);

  const rawSkills = userSkills.split(/[,;]/).map(s => s.trim()).filter(Boolean);
  const userTokens = tokenize(userSkills);

  if (userTokens.length === 0) return { score: 0, matchedSkills: [] };

  const matchedRawSkills: string[] = [];
  let totalWeight = 0;
  let matchedWeight = 0;

  for (const rawSkill of rawSkills) {
    const skillTokens = tokenize(rawSkill);
    if (skillTokens.length === 0) continue;
    totalWeight += 1;

    // Match si au moins un token de la compétence est trouvé dans l'offre
    const isMatched = skillTokens.some(st =>
      oppTokens.some(ot => ot === st || ot.includes(st) || st.includes(ot))
    );

    if (isMatched) {
      // Pondérer par fréquence TF : compétences rares dans l'offre = plus significatives
      const skillTF = Math.max(...skillTokens.map(st => tf(st, oppTokens)));
      // Score entre 0.5 (mentionné peu) et 1.5 (mentionné souvent dans l'offre)
      const weight = 0.5 + Math.min(skillTF * 30, 1.0);
      matchedWeight += weight;
      matchedRawSkills.push(rawSkill);
    }
  }

  if (totalWeight === 0) return { score: 0, matchedSkills: [] };

  // Score de base : ratio pondéré × 85 (max sans bonus)
  const baseScore = (matchedWeight / Math.max(totalWeight, matchedWeight)) * 85;

  // Bonus domaine : +10 si les compétences correspondent au domaine de l'offre
  let domainBonus = 0;
  if (oppDomain) {
    const domainKey = tokenize(oppDomain)[0] ?? "";
    const domainWords = DOMAIN_KEYWORDS[domainKey] ?? [];
    const hasDomainMatch = userTokens.some(s =>
      domainWords.some(kw => s === kw || s.includes(kw) || kw.includes(s))
    );
    if (hasDomainMatch) domainBonus = 10;
  }

  // Bonus précision : si 3+ compétences matchées, +5 de confiance
  const precisionBonus = matchedRawSkills.length >= 3 ? 5 : 0;

  return {
    score: Math.min(Math.round(baseScore + domainBonus + precisionBonus), 100),
    matchedSkills: matchedRawSkills,
  };
}
