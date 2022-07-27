import 'dotenv/config'
import fetch from 'node-fetch'

import fs from 'fs/promises'

const { KEY, COOKIE, BODY, SAPISIDHASH } = process.env

const endpoint = `https://www.youtube.com/youtubei/v1/browse?key=${KEY}&prettyPrint=false`

const body = JSON.parse(BODY)

const moreHeaders = {
  'X-Goog-PageId': '114979144828937543593',
  'X-Youtube-Client-Version': '2.20220721.05.00',
  'X-Youtube-Client-Name': '1',
  'X-Origin': 'https://www.youtube.com',
  'X-Goog-AuthUser': '0',
  'X-Goog-Visitor-Id': 'CgtJMTZJb083UmQzSSjrt_aWBg%3D%3D',
  'X-Youtube-Bootstrap-Logged-In': 'true',
}

let data = []
let continuation = null

do {
  if (continuation) {
    body.continuation = continuation
  }

  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: `SAPISIDHASH ${SAPISIDHASH}`,
      Cookie: COOKIE,
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15',
      ...moreHeaders,
    },
  }

  const req = await fetch(endpoint, options)
  const res = await req.json()

  const newData = !continuation
    ? res.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
        .sectionListRenderer.contents[0].itemSectionRenderer.contents[0]
        .playlistVideoListRenderer.contents
    : res.onResponseReceivedActions[0].appendContinuationItemsAction
        .continuationItems

  data = [...data, ...newData]

  if (
    newData[100]?.continuationItemRenderer.continuationEndpoint
      .continuationCommand.token
  ) {
    continuation =
      newData[100].continuationItemRenderer.continuationEndpoint
        .continuationCommand.token
  } else {
    break
  }
} while (true)

await fs.writeFile('temp.json', JSON.stringify(data))
