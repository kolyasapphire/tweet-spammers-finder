import 'dotenv/config'
const { USER_ID, AUTH_TOKEN, TWEET_NUMBER_THRESHOLD } = process.env

const MAX_PAGES = 30

// Playground
// https://oauth-playground.glitch.me/?id=usersIdTimeline
// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/introduction
// This endpoint has a per-user rate limit of 180 requests per 15-minute window and returns 800 of the most recent Tweets.
const endpoint = `https://api.twitter.com/2/users/${USER_ID}/timelines/reverse_chronological`

const options = {
  headers: {
    Authorization: `Bearer ${AUTH_TOKEN}`,
  },
}

const args = new URLSearchParams({
  'tweet.fields': 'created_at,author_id,id',
  expansions: 'author_id',
  max_results: '100',
  'user.fields': 'id,name,username',
  // if we exclude replies we won't count tweets in threads
  exclude: 'retweets',
})

type Tweet = {
  id: string
  author_id: string
  created_at: string
}

type User = {
  id: string
  name: string
  username: string
}

let tweets: Tweet[] = []
let users: User[] = []
let earliestTweet: Tweet = null
// Just for stats
let fetchedTimes = 0
let latestTweet: Tweet = null

const request = async (to: string) => {
  if (to) {
    args.set('until_id', to)
  }

  const req = await fetch(`${endpoint}?${args.toString()}`, options)

  if (!req.ok) {
    console.log(req.status, req.statusText)

    if (req.status === 401) {
      console.error(
        'Token is invalid, go get a new one:',
        'https://oauth-playground.glitch.me/?id=usersIdTimeline'
      )
      process.exit()
    }

    if (req.status === 429) {
      console.error('Limits hit')
      console.log(`Fetched ${fetchedTimes} times before failing`)
      console.log(
        `Resetting @ ${new Date(
          parseInt(req.headers.get('x-rate-limit-reset')) * 1000
        ).toTimeString()}`
      )
      process.exit()
    }

    console.error('Failed to fetch')
    process.exit()
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
    } reqs remaining, resetting @ ${new Date(
      parseInt(rateLimit.reset) * 1000
    ).toTimeString()}`
  )

  return res
}

do {
  const response = await request(earliestTweet?.id)

  if (response.meta.result_count === 0) {
    console.log('Nothing more to fetch')
    break
  }

  const tweetsData = response.data as Tweet[]
  const usersData = response.includes.users as User[]

  earliestTweet = tweetsData.find(
    (x: { id: string }) => x.id === response.meta.oldest_id
  )

  tweets = [...tweets, ...tweetsData]
  users = [...users, ...usersData]

  if (fetchedTimes === 0) {
    latestTweet = tweetsData.find(
      (x: { id: string }) => x.id === response.meta.newest_id
    )
  }

  fetchedTimes = fetchedTimes += 1
} while (fetchedTimes < MAX_PAGES)

console.log('Loaded', tweets.length, 'tweets')

const occurences = tweets.reduce((acc, { author_id }) => {
  if (!acc.hasOwnProperty(author_id)) {
    acc[author_id] = 0
  }

  acc[author_id] += 1

  return acc
}, {} as { [key: string]: number })

console.log(Object.keys(occurences).length, 'unique tweeters')

const sortable = Object.entries(occurences)

sortable.sort((a, b) => a[1] - b[1])

const orgedUsers = users.reduce((acc, { id, name, username }) => {
  if (!acc.hasOwnProperty(id)) {
    acc[id] = { name, username }
  }
  return acc
}, {} as { [key: string]: { name: string; username: string } })

sortable.forEach((x) => {
  // Ignoring users with too little tweets
  if (x[1] >= parseInt(TWEET_NUMBER_THRESHOLD)) {
    console.log(x[1], orgedUsers[x[0]].name, orgedUsers[x[0]].username)
  }
})

console.log(
  '~',
  Math.round(
    (new Date(latestTweet.created_at).valueOf() -
      new Date(earliestTweet.created_at).valueOf()) /
      36e5 // hours
  ),
  'hours of tweets:',
  new Date(earliestTweet.created_at),
  '->',
  new Date(latestTweet.created_at)
)
