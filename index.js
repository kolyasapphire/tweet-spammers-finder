import fetch from 'node-fetch'

const USER_ID = 123
const AUTH_TOKEN = 'xxx'
const PAGES = 180 - 10 // 180 limit

// As we go backwards, we use earliest tweet id in next requests
const getEarliestTweet = (input) =>
  input.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0]
const getLatestTweet = (input) =>
  input.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

// Playground
// https://oauth-playground.glitch.me/?id=usersIdTimeline&params=%28%27tweet*created_at%2C-%2Cid%27%7Eexpansion6-%27%7Eid%21%2728003745%27%7Emax_result6100%27%7Euser*id%2Cname%2Cusername%27%29*.field6-author_id6s%21%27%016-*_
// Note: 180 requests in 15 minutes
const endpoint = `https://api.twitter.com/2/users/${USER_ID}/timelines/reverse_chronological`

const options = {
  headers: {
    Authorization: `Bearer ${AUTH_TOKEN}`,
  },
}

const args = new URLSearchParams({
  'tweet.fields': 'created_at,author_id,id',
  expansions: 'author_id',
  max_results: 100,
  'user.fields': 'id,name,username',
  exclude: 'replies,retweets',
})

let fetchedTimes = 0
let data = []
let earliestTweet = null
let users = []

// Just for stats
let latestTweet = null

const request = async (to) => {
  if (to) {
    args.until_id = to
  }
  const req = await fetch(`${endpoint}?${args.toString()}`, options)

  if (!req.ok) {
    console.log(req.status, req.statusText)
    console.log(await req.text())

    if (req.status === 429) {
      console.log(`fetched ${fetchedTimes} times before failing`)

      console.log(
        `resetting @ ${new Date(req.headers.get('x-rate-limit-reset') * 1000)}`
      )

      throw new Error('Limits hit')
    }

    throw new Error('Failed to fetch')
  }

  const res = await req.json()

  const rateLimit = {
    remaining: req.headers.get('x-rate-limit-remaining'),
    limit: req.headers.get('x-rate-limit-limit'),
    reset: req.headers.get('x-rate-limit-reset'),
  }

  console.log(
    `${rateLimit.remaining}/${
      rateLimit.limit
    } reqs remaining resetting @ ${new Date(rateLimit.reset * 1000)}`
  )

  return res
}

do {
  const response = await request(earliestTweet?.id)
  earliestTweet = getEarliestTweet(response.data)

  data = [...data, ...response.data]
  users = [...users, ...response.includes.users]

  if (fetchedTimes === 0) {
    latestTweet = getLatestTweet(response.data)
  }

  fetchedTimes = fetchedTimes += 1
} while (fetchedTimes <= PAGES)

console.log('loaded', data.length, 'tweets')

const occurences = data.reduce((acc, { author_id }) => {
  if (!acc.hasOwnProperty(author_id)) {
    acc[author_id] = 0
  }

  acc[author_id] += 1

  return acc
}, {})

console.log(Object.keys(occurences).length, 'unique tweeters')

const sortable = Object.entries(occurences)

sortable.sort((a, b) => a[1] - b[1])

const orgedUsers = users.reduce((acc, { id, name, username }) => {
  if (!acc.hasOwnProperty(id)) {
    acc[id] = { name, username }
  }
  return acc
}, {})

sortable.forEach((x) =>
  console.log(x[1], orgedUsers[x[0]].name, orgedUsers[x[0]].username)
)

console.log(
  new Date(earliestTweet.created_at),
  '->',
  new Date(latestTweet.created_at)
)
