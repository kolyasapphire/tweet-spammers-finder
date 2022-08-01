import { Text, Button, VStack } from '@chakra-ui/react'

import { useContent } from 'fetchers'
import { useLocalStorage } from 'hooks'

import Channel from 'components/Channel'

const Index = () => {
  const [key] = useLocalStorage('key', '')
  const [cookie] = useLocalStorage('cookie', '')
  const [body] = useLocalStorage('body', '')
  const [hash] = useLocalStorage('hash', '')
  const [pageId] = useLocalStorage('pageId', '')
  const secrets = { key, cookie, body, hash, pageId }

  const Content = useContent(secrets)

  if (Content.isLoading) return <Text>Loading...</Text>
  if (Content.isError) return <Text>Error</Text>
  if (!Content.data)
    return <Button onClick={() => Content.mutate()}>Load</Button>

  const LINK_BASE = 'https://www.youtube.com'

  const channels = {}

  for (const rawItem of Content.data) {
    // weird continuation item
    if (!rawItem?.playlistVideoRenderer) {
      continue
    }

    const item = rawItem.playlistVideoRenderer
    const title = item.title.runs[0].text
    const videoId = item.videoId
    const setVideoId = item.setVideoId
    const link = LINK_BASE + '/watch?v=' + videoId
    const thumbnails = item.thumbnail.thumbnails
    const length = item.lengthText.simpleText

    const channel = item.shortBylineText.runs[0]
    const channelName = channel.text
    const channelId = channel.navigationEndpoint.browseEndpoint.browseId
    const channelLink =
      LINK_BASE + channel.navigationEndpoint.browseEndpoint.canonicalBaseUrl

    if (!channels.hasOwnProperty(channelName)) {
      channels[channelName] = {
        id: channelId,
        name: channelName,
        link: channelLink,
        videos: [],
      }
    }

    channels[channelName].videos.push({
      id: videoId,
      setVideoId,
      title,
      link,
      thumbnails,
      length,
    })
  }

  // whitelist
  ;[
    // 'А поговорить?'
  ].forEach((x) => delete channels[x])

  const sorted = Object.values(channels).sort(
    (a, b) => b.videos.length - a.videos.length
  )

  const withSingles = sorted.reduce(
    (acc, x) => {
      if (x.videos.length === 1) {
        acc.singles.push(x.videos[0])
      } else {
        acc.not.push(x)
      }
      return acc
    },
    { singles: [], not: [] }
  )

  const final = [
    ...withSingles.not,
    { id: 'singles', name: 'Singles', videos: withSingles.singles },
  ]

  return (
    <VStack spacing={10}>
      {final.map((x) => (
        <Channel key={x.id} data={x} />
      ))}
    </VStack>
  )
}

export default Index
