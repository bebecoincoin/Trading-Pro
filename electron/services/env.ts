import * as fs from 'node:fs';
import * as path from 'node:path';
import { app } from 'electron';

/**
 * Petit chargeur .env zero-dep.
 * Cherche d'abord dans le repertoire userData (.env utilisateur),
 * puis dans le repertoire de l'application (.env packagee).
 */
export function loadEnv() {
  const candidates = [
    path.join(app.getPath('userData'), '.env'),
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '..', '..', '.env'),
  ];

  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        for (const line of raw.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eq = trimmed.indexOf('=');
          if (eq < 0) continue;
          const key = trimmed.slice(0, eq).trim();
          let val = trimmed.slice(eq + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (!(key in process.env)) process.env[key] = val;
        }
      }
    } catch {
      // ignore
    }
  }
}

export function env(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}
