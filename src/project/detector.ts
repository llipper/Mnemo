import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { ProjectProfile } from '../domain/types.js';
import { git } from './git.js';

const markers: Array<[string, string, string]> = [
  ['package.json', 'Node.js', 'TypeScript/JavaScript'], ['pyproject.toml', 'Python', 'Python'], ['Cargo.toml', 'Rust', 'Rust'],
  ['go.mod', 'Go', 'Go'], ['pubspec.yaml', 'Flutter/Dart', 'Dart'], ['pom.xml', 'Java/Maven', 'Java'], ['build.gradle.kts', 'Kotlin/Gradle', 'Kotlin'],
];

export function detectProject(root: string): ProjectProfile {
  const projectType = new Set<string>();
  const languages = new Set<string>();
  for (const [file, type, language] of markers) if (existsSync(join(root, file))) { projectType.add(type); languages.add(language); }
  if (existsSync(join(root, 'next.config.js')) || existsSync(join(root, 'next.config.mjs')) || existsSync(join(root, 'next.config.ts'))) projectType.add('Next.js');
  let name = basename(root);
  if (existsSync(join(root, 'package.json'))) {
    try { name = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).name ?? name; } catch { /* keep folder name */ }
  }
  const dirs = readdirSync(root, { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith('.') && !['node_modules', 'dist', 'build'].includes(e.name)).map(e => e.name).slice(0, 20);
  const infra = ['Dockerfile', 'docker-compose.yml', 'compose.yml', 'vercel.json', 'wrangler.toml'].filter(file => existsSync(join(root, file)));
  const packageManager = existsSync(join(root, 'pnpm-lock.yaml')) ? 'pnpm' : existsSync(join(root, 'yarn.lock')) ? 'yarn' : existsSync(join(root, 'package-lock.json')) ? 'npm' : null;
  const hasGit = existsSync(join(root, '.git')) || git(root, ['rev-parse', '--is-inside-work-tree']) === 'true';
  return { root, name, projectType: [...projectType], languages: [...languages], packageManager, hasGit, defaultBranch: hasGit ? git(root, ['branch', '--show-current']) : null, head: hasGit ? git(root, ['rev-parse', 'HEAD']) : null, importantDirectories: dirs, infrastructure: infra };
}
