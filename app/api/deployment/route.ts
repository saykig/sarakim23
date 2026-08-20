export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json(
    {
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
      environment: process.env.VERCEL_ENV ?? 'local',
      deploymentUrl: process.env.VERCEL_URL ?? null,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  )
}
