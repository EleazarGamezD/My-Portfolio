import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);
const environmentDir = join(projectRoot, 'src', 'environments');

const requireEnv = (name, fallback = '') => {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const writeEnvironmentFile = (filename, production) => {
  const content = `export const environment = {
  production: ${production},
  appName: '${process.env.APP_NAME ?? 'PORTFOLIO'}',
  apiUrl: '${requireEnv('FRONTEND_API_URL')}',
  backendApiKey: '${requireEnv('BACKEND_API_KEY')}',
  reCaptchaSiteKey: '${requireEnv('RECAPTCHA_SITE_KEY')}',
};
`;

  writeFileSync(join(environmentDir, filename), content, 'utf8');
};

mkdirSync(environmentDir, { recursive: true });
writeEnvironmentFile('environment.ts', false);
writeEnvironmentFile('environment.production.ts', true);

console.log('Angular environment files generated successfully.');
