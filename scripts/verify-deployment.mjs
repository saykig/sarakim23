import { execFileSync } from 'node:child_process'

const mode = process.argv[2] ?? 'pre'
const productionUrl = (
  process.argv[3] ??
  process.env.PRODUCTION_URL ??
  'https://sarakim23.vercel.app'
).replace(/\/$/, '')

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

if (!['pre', 'post'].includes(mode)) {
  throw new Error('Usage: node scripts/verify-deployment.mjs <pre|post> [url]')
}

git('fetch', 'origin', 'main', '--quiet')

const branch = git('branch', '--show-current')
const head = git('rev-parse', 'HEAD')
const originMain = git('rev-parse', 'origin/main')
const workingTree = git('status', '--porcelain')

if (branch !== 'main') throw new Error(`Expected branch main, found ${branch}`)
if (workingTree) throw new Error('Working tree is not clean')
if (head !== originMain) {
  throw new Error(`Local HEAD ${head} does not match origin/main ${originMain}`)
}

const result = { mode, branch, head, originMain, workingTree: 'clean' }

if (mode === 'post') {
  const response = await fetch(`${productionUrl}/api/deployment`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  })
  if (!response.ok) {
    throw new Error(`Production deployment endpoint returned ${response.status}`)
  }

  const production = await response.json()
  if (production.environment !== 'production') {
    throw new Error(`Expected production environment, found ${production.environment}`)
  }
  if (production.branch !== branch) {
    throw new Error(
      `Production branch ${production.branch} does not match local ${branch}`
    )
  }
  if (production.commitSha !== head) {
    throw new Error(
      `Production SHA ${production.commitSha} does not match local ${head}`
    )
  }

  result.production = production
  result.productionUrl = productionUrl
}

console.log(JSON.stringify(result, null, 2))
