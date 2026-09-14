const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const dns = require('dns')
const { promisify } = require('util')
const { randomBytes, randomInt, scrypt, timingSafeEqual } = require('crypto')
const { MongoClient, ObjectId } = require('mongodb')

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 5000
const DATABASE_NAME = 'nutridisney'
const hashPassword = promisify(scrypt)

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

app.post('/api/auth/register', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body.password === 'string' ? req.body.password : ''

  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' })
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'A valid email is required' })
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
  }

  try {
    const existingParent = await database.collection('parents').findOne({ email })
    if (existingParent) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      })
    }

    const salt = randomBytes(16).toString('hex')
    const passwordHash = (await hashPassword(password, salt, 64)).toString('hex')
    const result = await database.collection('parents').insertOne({
      name,
      email,
      passwordHash,
      salt,
      createdAt: new Date(),
    })

    return res.status(201).json({
      success: true,
      message: 'Parent registered successfully',
      parent: {
        id: result.insertedId.toString(),
        name,
        email,
      },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      })
    }

    console.error('Parent registration failed:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Unable to register parent',
    })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body.password === 'string' ? req.body.password : ''

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' })
  }

  try {
    const parent = await database.collection('parents').findOne({ email })
    if (!parent) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const passwordHash = await hashPassword(password, parent.salt, 64)
    const storedHash = Buffer.from(parent.passwordHash, 'hex')
    const passwordMatches = storedHash.length === passwordHash.length && timingSafeEqual(passwordHash, storedHash)

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      parent: {
        id: parent._id.toString(),
        name: parent.name,
        email: parent.email,
      },
    })
  } catch (error) {
    console.error('Parent login failed:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Unable to log in parent',
    })
  }
})

app.post('/api/children', async (req, res) => {
  const parentId = typeof req.body.parentId === 'string' ? req.body.parentId.trim() : ''
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
  const age = Number(req.body.age)

  if (!parentId || !name || !Number.isInteger(age) || age < 3 || age > 18) {
    return res.status(400).json({ success: false, message: 'parentId, name, and a valid age from 3 to 18 are required' })
  }

  if (!ObjectId.isValid(parentId)) {
    return res.status(404).json({ success: false, message: 'Parent not found' })
  }

  try {
    const parent = await database.collection('parents').findOne({ _id: new ObjectId(parentId) })
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' })
    }

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const pin = String(randomInt(100000, 1000000))
      try {
        const result = await database.collection('children').insertOne({
          parentId,
          name,
          age,
          pin,
          createdAt: new Date(),
        })

        return res.status(201).json({
          success: true,
          message: 'Child added successfully',
          child: { id: result.insertedId.toString(), name, age, pin },
        })
      } catch (error) {
        if (error.code !== 11000) throw error
      }
    }

    return res.status(500).json({ success: false, message: 'Unable to generate a unique child PIN' })
  } catch (error) {
    console.error('Child creation failed:', error.message)
    return res.status(500).json({ success: false, message: 'Unable to add child' })
  }
})

app.get('/api/children', async (req, res) => {
  const parentId = typeof req.query.parentId === 'string' ? req.query.parentId.trim() : ''

  if (!parentId || !ObjectId.isValid(parentId)) {
    return res.status(400).json({ success: false, message: 'A valid parentId is required' })
  }

  try {
    const childRecords = await database.collection('children').find({ parentId }).sort({ createdAt: -1 }).toArray()
    return res.json({
      success: true,
      children: childRecords.map((child) => ({
        id: child._id.toString(),
        name: child.name,
        age: child.age,
        pin: child.pin,
      })),
    })
  } catch (error) {
    console.error('Children lookup failed:', error.message)
    return res.status(500).json({ success: false, message: 'Unable to load children' })
  }
})

app.post('/api/children/login', async (req, res) => {
  const pin = typeof req.body.pin === 'string' ? req.body.pin.trim() : ''

  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({ success: false, message: 'A valid 6-digit PIN is required' })
  }

  try {
    const child = await database.collection('children').findOne({ pin })
    if (!child) {
      return res.status(401).json({ success: false, message: 'Invalid PIN' })
    }

    return res.json({
      success: true,
      message: 'Child login successful',
      child: {
        id: child._id.toString(),
        name: child.name,
        age: child.age,
        pin: child.pin,
      },
    })
  } catch (error) {
    console.error('Child login failed:', error.message)
    return res.status(500).json({ success: false, message: 'Unable to log in child' })
  }
})

app.post('/api/progress/quiz', async (req, res) => {
  const childId = typeof req.body.childId === 'string' ? req.body.childId.trim() : ''
  const gameId = typeof req.body.gameId === 'string' ? req.body.gameId.trim() : ''
  const { score, totalQuestions, pointsEarned } = req.body

  if (!childId || !ObjectId.isValid(childId)) {
    return res.status(400).json({ message: 'A valid childId is required' })
  }

  if (!gameId || typeof score !== 'number' || !Number.isFinite(score) || score < 0 || typeof totalQuestions !== 'number' || !Number.isFinite(totalQuestions) || totalQuestions <= 0 || score > totalQuestions || typeof pointsEarned !== 'number' || !Number.isFinite(pointsEarned) || pointsEarned < 0) {
    return res.status(400).json({ message: 'Invalid quiz result data' })
  }

  try {
    const child = await database.collection('children').findOne({ _id: new ObjectId(childId) })
    if (!child) {
      return res.status(404).json({ message: 'Child not found' })
    }

    const progressId = new ObjectId()
    await database.collection('quizProgress').updateOne(
      { _id: progressId },
      {
        $setOnInsert: {
          childId,
          gameId,
          score,
          totalQuestions,
          pointsEarned,
        },
        $currentDate: { completedAt: true },
      },
      { upsert: true },
    )

    const progress = await database.collection('quizProgress').findOne({ _id: progressId })
    return res.status(201).json({
      message: 'Quiz result saved',
      progress: {
        id: progress._id.toString(),
        childId: progress.childId,
        gameId: progress.gameId,
        score: progress.score,
        totalQuestions: progress.totalQuestions,
        pointsEarned: progress.pointsEarned,
        completedAt: progress.completedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Quiz progress save failed:', error.message)
    return res.status(500).json({ message: 'Unable to save quiz result' })
  }
})

app.get('/api/progress/child/:childId', async (req, res) => {
  const { childId } = req.params

  if (!ObjectId.isValid(childId)) {
    return res.status(400).json({ message: 'A valid childId is required' })
  }

  try {
    const progressRecords = await database.collection('quizProgress').find({ childId }).sort({ completedAt: -1 }).toArray()
    const total = await database.collection('quizProgress').aggregate([
      { $match: { childId } },
      { $group: { _id: null, totalPoints: { $sum: '$pointsEarned' } } },
    ]).next()

    return res.json({
      progress: progressRecords.map((progress) => ({
        gameId: progress.gameId,
        score: progress.score,
        totalQuestions: progress.totalQuestions,
        pointsEarned: progress.pointsEarned,
        completedAt: progress.completedAt.toISOString(),
      })),
      totalPoints: total?.totalPoints || 0,
    })
  } catch (error) {
    console.error('Quiz progress lookup failed:', error.message)
    return res.status(500).json({ message: 'Unable to load quiz progress' })
  }
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

  dns.setServers(['1.1.1.1', '8.8.8.8'])
  const client = new MongoClient(connectionString, {
    serverSelectionTimeoutMS: 10000,
  })
  await client.connect()
  database = client.db(DATABASE_NAME)
  await database.command({ ping: 1 })
  await database.collection('parents').createIndex({ email: 1 }, { unique: true })
  await database.collection('children').createIndex({ pin: 1 }, { unique: true })
  await database.collection('quizProgress').createIndex({ childId: 1, completedAt: -1 })

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
