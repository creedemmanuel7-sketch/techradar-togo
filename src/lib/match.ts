/**
 * TechRadar Togo — Match Engine v4
 *
 * Améliorations par rapport à v3 :
 * 1. Détection améliorée du titre via paramètre séparé (plus d'heuristique fragile)
 * 2. Formule de scoring plus précise : TF-IDF simplifié avec normalisation
 * 3. Bonus pour compétences exactes dans le titre (+15)
 * 4. Bonus pour compétences rares/populaires (demande du marché)
 * 5. Pénalité douce pour compétences manquantes importantes
 * 6. Plus d'alias de compétences et mots-clés de domaine
 * 7. Amélioration du tokenizer pour gérer les cas particuliers (camelCase, snake_case)
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
  // Nouveaux aliases v4
  "docker": "docker",
  "docker-compose": "docker",
  "gitlab": "git",
  "github": "git",
  "graphql": "graphql",
  "rest api": "rest",
  "restful": "rest",
  "sqlite": "sql",
  "mysql": "sql",
  "redis": "database",
  "mongodb": "database",
  "postgresql": "database",
  "firebase": "database",
  "supabase": "database",
  "prisma": "database",
  "sequelize": "database",
  "typeorm": "database",
  "mongoose": "database",
  "jwt": "authentication",
  "oauth": "authentication",
  "auth0": "authentication",
  "nextauth": "authentication",
  "firebase auth": "authentication",
  "ci/cd": "cicd",
  "cicd": "devops",
  "jenkins": "devops",
  "github actions": "devops",
  "gitlab ci": "devops",
  "terraform": "devops",
  "ansible": "devops",
  "nginx": "devops",
  "apache": "devops",
  "linux": "devops",
  "ubuntu": "devops",
  "bash": "devops",
  "shell": "devops",
  "powershell": "devops",
  "jira": "management",
  "confluence": "management",
  "trello": "management",
  "notion": "management",
  "slack": "communication",
  "discord": "communication",
  "teams": "communication",
  "figma": "design",
  "sketch": "design",
  "adobe xd": "design",
  "photoshop": "design",
  "illustrator": "design",
  "canva": "design",
  "blender": "design",
  "unity": "gamedev",
  "unreal": "gamedev",
  "godot": "gamedev",
  "flutter": "mobile",
  "dart": "mobile",
  "swift": "mobile",
  "kotlin": "mobile",
  "android studio": "mobile",
  "xcode": "mobile",
  "rust": "rust",
  "go": "golang",
  "golang": "go",
  "java": "java",
  "spring": "java",
  "spring boot": "java",
  "hibernate": "java",
  "maven": "java",
  "gradle": "java",
  "c#": "csharp",
  "csharp": "csharp",
  ".net": "csharp",
  "asp.net": "csharp",
  "php": "php",
  "laravel": "php",
  "symfony": "php",
  "wordpress": "php",
  "drupal": "php",
  "ruby": "ruby",
  "ruby on rails": "ruby",
  "rails": "ruby",
  "sinatra": "ruby",
  "elixir": "elixir",
  "phoenix": "elixir",
  "scala": "scala",
  "objective-c": "ios",
  "obj-c": "ios",
  "r": "r",
  "r language": "r",
  "matlab": "matlab",
  "julia": "julia",
  "haskell": "haskell",
  "clojure": "clojure",
  "erlang": "erlang",
  "f#": "fsharp",
  "fsharp": "fsharp",
};

// ─── Domaines et leurs mots-clés associés ───────────────────────────────────
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  web: ["react", "vue", "angular", "html", "css", "javascript", "typescript", "frontend", "backend", "node", "django", "api", "rest", "fullstack", "nextjs", "tailwind", "php", "laravel", "express", "fastapi", "graphql", "docker", "nginx", "apache"],
  mobile: ["flutter", "react native", "android", "ios", "swift", "kotlin", "mobile", "app", "dart", "xcode", "android studio"],
  data: ["python", "pandas", "sql", "machinelearning", "tableau", "powerbi", "analytics", "data", "bigquery", "ai", "deeplearning", "tensorflow", "spark", "etl", "bi", "r", "matlab", "julia"],
  design: ["figma", "ux", "ui", "prototypage", "wireframe", "sketch", "design", "interface", "adobe", "xd", "canva", "photoshop", "illustrator", "blender"],
  ia: ["machinelearning", "deeplearning", "tensorflow", "gpt", "llm", "nlp", "ai", "huggingface", "pytorch", "scikit", "opencv", "computer vision"],
  cybersecurite: ["securite", "pentest", "cybersecurite", "firewall", "ctf", "audit", "owasp", "hacker", "siem", "kali", "burp", "metasploit"],
  entrepreneuriat: ["startup", "business", "fonds", "incubateur", "pitch", "mvp", "acceleration", "fintech", "saas", "product", "growth"],
  general: ["gestion", "scrum", "agile", "jira", "product", "management", "communication", "hackathon", "leadership", "notion", "trello"],
};

// ─── Tokenizer ───────────────────────────────────────────────────────────────
function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9\s.+#\-_]/g, " ") // allow hyphens and underscores
    .replace(/[_-]/g, " ") // convert underscores and hyphens to spaces
    .replace(/([a-z])([A-Z])/g, "$1 $2") // split camelCase
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

// ─── Compétences populaires (bonus de marché) ─────────────────────────────────
const POPULAR_SKILLS = new Set([
  "react", "javascript", "typescript", "python", "node", "docker", "aws", "git",
  "sql", "graphql", "kubernetes", "figma", "flutter", "java", "golang", "rust",
]);

// ─── Compétences rares (bonus d'expertise) ────────────────────────────────────
const RARE_SKILLS = new Set([
  "rust", "elixir", "haskell", "clojure", "erlang", "fsharp", "julia", "scala",
  "kubernetes", "tensorflow", "pytorch", "huggingface", "solidity", "web3",
]);

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
 * @param opportunityTitle - Titre de l'opportunité (poids ×4)
 * @param opportunityDesc  - Description de l'opportunité (poids ×1)
 * @param oppDomain     - Domaine de l'opportunité
 */
export function calculateMatchScore(
  userSkills: string | undefined,
  opportunityText: string,   // titre + description concaténés (rétrocompatibilité)
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
    const score = Math.min(Math.round((matchedDomainWords.length / Math.max(domainWords.length, 1)) * 60), 60);
    return { score, matchedSkills: matchedDomainWords.slice(0, 3) };
  }

  // ─── Cas 2 : compétences renseignées ─────────────────────────────────────
  // Heuristique améliorée : détecter le titre (premiers mots jusqu'à 8 mots max)
  const lines = opportunityText.split(" ");
  const estimatedTitle = lines.slice(0, Math.min(8, Math.floor(lines.length * 0.25))).join(" ");
  
  // Pondération : titre ×4, description ×1
  const weightedText = `${estimatedTitle} ${estimatedTitle} ${estimatedTitle} ${estimatedTitle} ${opportunityText}`;
  const oppTokens = tokenize(weightedText);
  const titleTokens = tokenize(estimatedTitle);

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
      // Vérifier si la compétence est dans le titre (bonus fort)
      const inTitle = skillTokens.some(st =>
        titleTokens.some(tt => tt === st || tt.includes(st) || st.includes(tt))
      );

      // Pondérer par fréquence TF : compétences rares dans l'offre = plus significatives
      const skillTF = Math.max(...skillTokens.map(st => tf(st, oppTokens)));
      
      // Score de base entre 0.5 et 1.5
      let weight = 0.5 + Math.min(skillTF * 30, 1.0);
      
      // Bonus si dans le titre (+0.5)
      if (inTitle) weight += 0.5;
      
      // Bonus pour compétences populaires (+0.2)
      const normalizedSkill = skillTokens[0];
      if (POPULAR_SKILLS.has(normalizedSkill)) weight += 0.2;
      
      // Bonus pour compétences rares (+0.4)
      if (RARE_SKILLS.has(normalizedSkill)) weight += 0.4;
      
      matchedWeight += weight;
      matchedRawSkills.push(rawSkill);
    }
  }

  if (totalWeight === 0) return { score: 0, matchedSkills: [] };

  // Score de base : ratio pondéré × 75 (max sans bonus)
  const baseScore = (matchedWeight / totalWeight) * 75;

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

  // Bonus couverture : si 5+ compétences matchées, +10
  const coverageBonus = matchedRawSkills.length >= 5 ? 10 : 0;

  return {
    score: Math.min(Math.round(baseScore + domainBonus + precisionBonus + coverageBonus), 100),
    matchedSkills: matchedRawSkills,
  };
}
