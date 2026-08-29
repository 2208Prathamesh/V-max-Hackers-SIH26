import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to recursively find test files
function findTestFiles(dir, filter = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'helpers') {
        results = results.concat(findTestFiles(fullPath, filter));
      }
    } else if (file.endsWith('.test.js')) {
      if (!filter || fullPath.includes(filter)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const args = process.argv.slice(2);
let suiteFilter = '';

if (args.includes('--unit')) suiteFilter = 'unit';
else if (args.includes('--integration')) suiteFilter = 'integration';
else if (args.includes('--system')) suiteFilter = 'system';
else if (args.includes('--edge')) suiteFilter = 'edge-cases';

const files = findTestFiles(__dirname, suiteFilter);

if (files.length === 0) {
  console.log(`No test files found matching filter: "${suiteFilter || 'all'}"`);
  process.exit(1);
}

console.log('====================================================');
console.log(`🧪 WeatherGPT Custom Test Runner`);
console.log(`🎯 Suite: ${suiteFilter || 'All Suites (Unit, Integration, System, Edge-Cases)'}`);
console.log(`📁 Found ${files.length} test files`);
console.log('====================================================\n');

const testStream = run({
  files,
  concurrency: 1,
});

testStream.compose(new spec()).pipe(process.stdout);
