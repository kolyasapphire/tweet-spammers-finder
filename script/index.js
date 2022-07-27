import fs from 'fs/promises'
import child_process from 'node:child_process'

const data = JSON.parse(await fs.readFile('temp.json'))

const LINK_BASE = 'https://www.youtube.com'

const channels = {}

for (const rawItem of data) {
  // weird continuation item
  if (!rawItem?.playlistVideoRenderer) {
    continue
  }

  const item = rawItem.playlistVideoRenderer
  const title = item.title.runs[0].text
  const link = LINK_BASE + '/watch?v=' + item.videoId

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
    title,
    link,
  })
}

;['А поговорить?'].forEach((x) => delete channels[x])

const sorted = Object.values(channels).sort(
  (a, b) => a.videos.length - b.videos.length
)

sorted.forEach((x, ix, obj) => {
  console.log(x.videos.length, x.name)

  if (ix >= obj.length - 1) {
    x.videos.forEach((x) => {
      console.log(x.title)
      console.log(x.link)

      child_process.exec(`open ${x.link}`)
    })
  }
})
