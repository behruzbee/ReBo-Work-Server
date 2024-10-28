const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000
const dbPath = path.join(__dirname, 'dist', 'db.json')

// CORS options
const corsOptions = {
  origin: [
    'https://re-bo-work.vercel.app',
    'https://re-bo-work-fezpplj3s-behruzs-projects-73920d36.vercel.app'
  ],
  methods: 'GET,POST',
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())

// Helper function to read and write JSON file
const readData = () => {
  try {
    const data = fs.readFileSync(dbPath)
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading data:', error)
    return { workers: [] }
  }
}

const writeData = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing data:', error)
  }
}

// Get all workers
app.get('/api/workers', (req, res) => {
  const data = readData()
  res.json(data.workers)
})

// Get worker by ID
app.get('/api/workers/:id', (req, res) => {
  const { id } = req.params
  const data = readData()
  const worker = data.workers.find((w) => w.id === id)
  worker
    ? res.json(worker)
    : res.status(404).json({ message: 'Worker not found' })
})

// Create new worker
app.post('/api/workers', (req, res) => {
  const newWorker = req.body
  const data = readData()
  newWorker.id = Date.now().toString()
  data.workers.push(newWorker)
  writeData(data)
  res.status(201).json(newWorker)
})

// Update a worker
app.put('/api/workers/:id', (req, res) => {
  const { id } = req.params
  const updatedWorker = req.body
  const data = readData()
  const index = data.workers.findIndex((w) => w.id === id)
  if (index === -1) {
    return res.status(404).json({ message: 'Worker not found' })
  }
  data.workers[index] = { ...data.workers[index], ...updatedWorker }
  writeData(data)
  res.json(data.workers[index])
})

// Delete a worker
app.delete('/api/workers/:id', (req, res) => {
  const { id } = req.params
  const data = readData()
  const newWorkers = data.workers.filter((w) => w.id !== id)
  if (newWorkers.length === data.workers.length) {
    return res.status(404).json({ message: 'Worker not found' })
  }
  data.workers = newWorkers
  writeData(data)
  res.status(204).send()
})

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`)
})
