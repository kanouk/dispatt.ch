export const PERFUME_RADIO_SERVICE_SLUG = 'perfume'
export const PERFUME_RADIO_ORIGIN = 'https://perfume-radio.jp'

export function perfumeRadioEpisodeTarget(
  serviceSlug: string,
  episodeNumber: number | null,
  variant?: string,
): { url: string; variant: string } | null {
  if (
    serviceSlug !== PERFUME_RADIO_SERVICE_SLUG ||
    !Number.isInteger(episodeNumber) ||
    Number(episodeNumber) <= 0
  ) {
    return null
  }

  const base = `${PERFUME_RADIO_ORIGIN}/episodes/${episodeNumber}`
  if (!variant) return { url: base, variant: 'episode' }

  const normalized = variant.toLowerCase() === 'yt' ? 'youtube' : variant.toLowerCase()
  if (!['youtube', 'spotify', 'note'].includes(normalized)) return null
  return { url: `${base}/${normalized}`, variant: normalized }
}
