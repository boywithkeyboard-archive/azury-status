export const getLatency = async (
  fetch: Function,
  services: {
    name: string
    url: string
    method?: string
  }[],
  latencies: {
    slug: string
    latency: number[]
  }[]
) => {
  const result = {
    raw: [] as any[],
    averages: [] as any[]
  }

  for (let s of services) {
    let slug = s.name.replace(' ', '-').toLowerCase()
    , entry = latencies.find(x => x.slug === slug)

    if (!entry)
      entry = {
        slug,
        latency: []
      }
    else if (entry.latency.length === 336) // 2x * 24h * 7d = 336 workflow runs per week
      entry.latency.shift()

    try {
      const startTime = Date.now()

      await fetch(s.url, {
        method: s.method ?? 'GET'
      })

      entry.latency.push(Date.now() - startTime)
    } catch (err) {
      entry.latency.push(0)
    }

    result.raw.push({
      slug,
      latency: entry.latency
    })

    result.averages.push({
      slug,
      latency: `${entry.latency.reduce((a, b) => a + b, 0) / entry.latency.length}ms`
    })
  }

  return result
}
