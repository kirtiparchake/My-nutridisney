const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const { MongoClient } = require('mongodb')

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 5000
const DATABASE_NAME = 'nutridisney'

let database

app.use(express.json())

app.get('/', (req, res) => {
  res.send('NutriDisney API is running')
})

app.get('/api/health', (req, res) => {
  if (!database) {
    return res.status(503).json({
      success: false,
      message: 'NutriDisney backend is running, but MongoDB is not connected',
    })
  }

  res.json({
    success: true,
    message: 'NutriDisney backend is running',
    mongodb: {
      connected: true,
      database: DATABASE_NAME,
    },
  })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
  })
})

const startServer = async () => {
  const connectionString = process.env.MONGODB_URI

  if (!connectionString || connectionString === 'PASTE_MY_MONGODB_ATLAS_CONNECTION_STRING_HERE') {
    throw new Error('MONGODB_URI is missing. Add your MongoDB Atlas connection string to backend/.env.')
  }

  if (!connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI has an invalid MongoDB connection string format.')
  }

  const client = new MongoClient(connectionString, {
    serverSelectionTimeoutMS: 10000,
  })
  await client.connect()
  database = client.db(DATABASE_NAME)
  await database.command({ ping: 1 })

  app.listen(PORT, () => {
    console.log(`NutriDisney backend running on port ${PORT}`)
    console.log(`Connected to MongoDB database: ${DATABASE_NAME}`)
  })
}

startServer().catch((error) => {
  const errorText = String(error.message || '').toLowerCase()
  let category = 'unknown connection error'

  if (errorText.includes('authentication') || errorText.includes('bad auth') || errorText.includes('credentials')) {
    category = 'authentication failed; check the Atlas database username and password'
  } else if (errorText.includes('not authorized') || errorText.includes('unauthorized')) {
    category = 'database authorization failed; check the Atlas user permissions'
  } else if (errorText.includes('timed out') || errorText.includes('server selection') || errorText.includes('econnrefused') || errorText.includes('econnreset') || errorText.includes('enetunreach')) {
    category = 'server selection timed out; check Atlas network access and the connection string host'
  } else if (errorText.includes('enotfound') || errorText.includes('getaddrinfo')) {
    category = 'MongoDB host could not be resolved; check the Atlas host in the connection string'
  } else if (errorText.includes('uri') || errorText.includes('parse') || errorText.includes('connection string')) {
    category = 'connection string format is invalid; check URL encoding and Atlas URI syntax'
  }

  console.error(`MongoDB connection failed: ${category}`)
  process.exit(1)
})
