import { Job, MatchResult } from '../types';

/**
 * Calculates matching statistics between a resume's skill set and a job posting's requirements.
 */
export function calculateMatch(resumeSkills: string[], job: Job): MatchResult {
  const reqSkills = job.requiredSkills || [];
  
  if (reqSkills.length === 0) {
    return {
      jobId: job.id,
      matchScore: 100,
      matchedSkills: [],
      missingSkills: [],
      recommendations: ['This job has no specific skills specified. Perfect fit!']
    };
  }

  // Normalize skills for comparative checks
  const resumeSet = new Set(resumeSkills.map(s => s.toLowerCase()));
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of reqSkills) {
    if (resumeSet.has(skill.toLowerCase())) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // Linear matching ratio (0 - 100)
  const scoreRaw = (matchedSkills.length / reqSkills.length) * 100;
  const matchScore = Math.round(scoreRaw);

  // Generate specific action-oriented recommendations based on missing skills
  const recommendations: string[] = [];

  if (missingSkills.length === 0) {
    recommendations.push("🎉 Stellar match! You have listed every required skill for this role. Customize your cover letter to highlight these!");
  } else {
    for (const skill of missingSkills) {
      const rec = getRecommendationForSkill(skill);
      recommendations.push(rec);
    }
  }

  return {
    jobId: job.id,
    matchScore,
    matchedSkills,
    missingSkills,
    recommendations
  };
}

/**
 * Returns tailored learning recommendations for common missing skills.
 */
function getRecommendationForSkill(skill: string): string {
  const normalized = skill.toLowerCase();

  switch (normalized) {
    case 'python':
      return '🐍 Learn Python fundamentals. Start with "Python for Beginners" on freeCodeCamp, then practice basic data structures (lists, dicts).';
    case 'java':
      return '☕ Study Java core concepts (OOP, Collections API). Try the standard exercism.org Java track.';
    case 'javascript':
      return '🌐 Brush up on modern JavaScript (ES6+, Async/Await, Fetch API). Complete the free javascript.info tutorial.';
    case 'typescript':
      return '🛡️ Elevate your JS code using TypeScript. Build a small hobby app starting with the official "TS for JS Developers" guide.';
    case 'c++':
      return '⚙️ Master C++ memory management and STL. Perfect your concepts on learncpp.com or practice competitive problems.';
    case 'react':
      return '⚛️ Learn React.js component workflows, hooks (useState, useEffect), and state flow. Build a small single-page app (SPA).';
    case 'next.js':
      return '⚡ Learn Next.js routing, SSR (Server Side Rendering), and server actions. Follow the "Learn Next.js" official interactive course.';
    case 'spring boot':
      return '🍃 Build a quick REST API using Java Spring Boot. Follow the official Spring guides for Dependency Injection and Spring Data JPA.';
    case 'node.js':
    case 'express':
      return '🟢 Code a Node.js Express server. Build server-side routes, middleware, and connect with PostgreSQL or MongoDB.';
    case 'sql':
    case 'postgresql':
    case 'mysql':
      return `🗄️ Master SQL. Practice queries (JOINs, GROUP BY, CTEs) on LeetCode SQL50 or SQLZoo using ${skill} syntax.`;
    case 'mongodb':
      return '🍃 Learn NoSQL document databases with MongoDB. Take the Mongo University free M001 Basics course.';
    case 'aws':
    case 'google cloud (gcp)':
    case 'azure':
      return `☁️ Explore Cloud computing using ${skill}. Learn core storage structures, virtual container servers, and serverless hosting.`;
    case 'docker':
      return '📦 Understand Docker containers, write simple Dockerfiles, and learn to package and run isolated developer servers locally.';
    case 'kubernetes':
      return '☸️ Learn Kubernetes deployment orchestrations, Pod scales, services, and practice in minikube environments.';
    case 'git':
      return '🌿 Master Git version control commands: clone, branch, commit, rebase, and open Pull Requests on GitHub.';
    case 'figma':
      return '🎨 Learn visual hierarchy, design components, and prototyping in Figma. Take Figma\'s Getting Started visual design series.';
    case 'ui/ux design':
      return '📐 Study user-experience fundamentals, spacing hierarchies, typographic rhythms, and responsive layout grids.';
    case 'rest apis':
    case 'apis':
      return '🔌 Learn API interactions, HTTP methods (GET, POST, PUT, DELETE), status codes, and test endpoints with Postman.';
    case 'machine learning':
    case 'tensorflow':
    case 'pytorch':
      return `🧠 Learn Machine Learning concepts (supervised / unsupervised, cost functions, evaluation). Try Andrew Ng's courses on Coursera.`;
    case 'ci/cd':
      return '🔄 Set up automated pipelines: compile, lint, and run tests automatically using GitHub Actions or Jenkins workflows.';
    case 'unit testing':
      return '🧪 Practice test-driven development (TDD) using Jest, Vitest, or Cypress on active functional projects.';
    case 'agile/scrum':
    case 'project management':
      return '📅 Learn Agile/Scrum processes: understanding backlogs, pointing stories, run retrospects, and practice project layout tracing.';
    default:
      return `💡 Learn ${skill} syntax and fundamentals. Read the official documentation and construct a small sandbox project incorporating this tool.`;
  }
}
