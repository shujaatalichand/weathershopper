import * as fs from 'fs';
import * as path from 'path';

const env = process.env.ENV ?? 'example';

export function loadTestData(filename: string) {
  const filePath = path.resolve(__dirname, `../src/test-data/${env}/${filename}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}