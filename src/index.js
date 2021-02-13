const local = process.env.DISCORD_BOT_SECRET === undefined

if (local) {
  require('dotenv').config()
}

// get .env data
const token = process.env.DISCORD_BOT_SECRET
const prefix = process.env.PREFIX
const site = process.env.SITE
const icon = process.env.ICON
const limit = process.env.LIMIT
const searchIndex = process.env.SEARCH_INDEX
const apiKey = process.env.MEILISEARCH_PUBLIC_KEY

if (!local) {
  const createServer = require('./keep_alive.js')

  createServer()
}

const createClient = require('./client')

createClient({ apiKey, token, prefix, searchIndex, site, icon, limit })
