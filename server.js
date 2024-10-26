const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000
const dbPath = path.join(__dirname, 'dist', 'db.json')

app.use(express.json())

// Helper function to read and write JSON file
const readData = () => {
  const data = fs.readFileSync(dbPath)
  return JSON.parse(data)
}

const writeData = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

// CRUD endpoints for "workers"

// Get all workers
app.get('/api//workers', (req, res) => {
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
  newWorker.id = Date.now().toString() // Assign a unique ID
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

// Static files and server start
app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`)
})