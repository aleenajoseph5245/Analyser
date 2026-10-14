const STOP_WORDS = new Set(`a an and are as at be by for from has have in into is it its of on or that the their this to was will with you your our we using use work working experience years role team strong including preferred required plus`.split(" "));

const SKILL_GROUPS: Record<string, string[]> = {
  "Frontend": ["react", "next.js", "nextjs", "typescript", "javascript", "html", "css", "accessibility", "responsive design", "tailwind", "redux", "vue", "angular"],
  "Backend": ["node.js", "nodejs", "python", "java", "go", "golang", "rest api", "graphql", "microservices", "express", "django", "fastapi", "spring", "postgresql", "sql", "mongodb", "redis"],
  "Cloud & DevOps": ["aws", "gcp", "azure", "docker", "kubernetes", "ci/cd", "terraform", "vercel", "linux", "monitoring"],
  "Data & AI": ["machine learning", "data analysis", "pandas", "numpy", "sql", "tableau", "power bi", "llm", "generative ai", "scikit-learn", "analytics"],
  "Product & Design": ["figma", "user research", "product strategy", "roadmapping", "a/b testing", "experimentation", "design systems", "user experience"],
  "Ways of working": ["agile", "scrum", "leadership", "communication", "mentoring", "stakeholder management", "cross-functional", "problem solving", "project management"],
};

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

function extractTerms(text: string): string[] {
  const found = new Set<string>();
  const source = normalize(text);
  for (const terms of Object.values(SKILL_GROUPS)) {
    for (const term of terms) if (source.includes(term)) found.add(term);
  }
  const words = source.match(/[a-z][a-z0-9+#.-]{2,}/g) ?? [];
  const frequencies = new Map<string, number>();
  words.forEach((word) => {
    const clean = word.replace(/[.#-]+$/g, "");
    if (clean.length > 3 && !STOP_WORDS.has(clean)) frequencies.set(clean, (frequencies.get(clean) ?? 0) + 1);
  });
  [...frequencies.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18).forEach(([word]) => found.add(word));
  return [...found];
}

export type MatchResult = { score: number; matched: string[]; missing: string[]; skillMatched: string[]; skillMissing: string[]; groups: { name: string; matched: string[]; missing: string[] }[]; strengths: string[] };

export function analyseMatch(resume: string, job: string): MatchResult {
  const resumeText = normalize(resume);
  const jobTerms = extractTerms(job);
  const matched = jobTerms.filter((term) => resumeText.includes(term));
  const missing = jobTerms.filter((term) => !resumeText.includes(term));
  const groups = Object.entries(SKILL_GROUPS).map(([name, terms]) => {
    const relevant = terms.filter((term) => normalize(job).includes(term));
    return { name, matched: relevant.filter((term) => resumeText.includes(term)), missing: relevant.filter((term) => !resumeText.includes(term)) };
  }).filter((group) => group.matched.length + group.missing.length > 0);
  const skillMatched = [...new Set(groups.flatMap((group) => group.matched))];
  const skillMissing = [...new Set(groups.flatMap((group) => group.missing))];
  const score = jobTerms.length ? Math.round((matched.length / jobTerms.length) * 100) : 0;
  return { score, matched, missing, skillMatched, skillMissing, groups, strengths: skillMatched.slice(0, 4) };
}
