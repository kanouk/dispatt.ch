import { assertEquals } from 'jsr:@std/assert@1'
import { perfumeRadioEpisodeTarget } from './perfume-radio.ts'

Deno.test('canonicalizes numbered perfume episode media routes', () => {
  assertEquals(perfumeRadioEpisodeTarget('perfume', 444, 'youtube'), {
    url: 'https://perfume-radio.jp/episodes/444/youtube',
    variant: 'youtube',
  })
  assertEquals(perfumeRadioEpisodeTarget('perfume', 444, 'yt'), {
    url: 'https://perfume-radio.jp/episodes/444/youtube',
    variant: 'youtube',
  })
  assertEquals(perfumeRadioEpisodeTarget('perfume', 444), {
    url: 'https://perfume-radio.jp/episodes/444',
    variant: 'episode',
  })
})

Deno.test('maps episode social variants to perfume-radio stable URLs', () => {
  assertEquals(perfumeRadioEpisodeTarget('perfume', 443, 'instagram'), {
    url: 'https://perfume-radio.jp/episodes/443/instagram',
    variant: 'instagram',
  })
  assertEquals(perfumeRadioEpisodeTarget('perfume', 443, 'tiktok'), {
    url: 'https://perfume-radio.jp/episodes/443/tiktok',
    variant: 'tiktok',
  })
})

Deno.test('leaves other services and unsupported variants unchanged', () => {
  assertEquals(perfumeRadioEpisodeTarget('another-service', 444, 'youtube'), null)
  assertEquals(perfumeRadioEpisodeTarget('perfume', 444, 'bluesky'), null)
  assertEquals(perfumeRadioEpisodeTarget('perfume', null, 'youtube'), null)
})
