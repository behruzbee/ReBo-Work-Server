const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000
const dbPath = path.join(__dirname, 'dist', 'db.json')

// CORS options
const corsOptions = {
  origin: "*",
  methods: 'GET,POST',
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())

const readData = async () => {
  try {
    const data = await fs.promises.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { workers: [] };
  }
};

const writeData = async (data) => {
  try {
    await fs.promises.writeFile(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
  }
};

// Get all workers
app.get('/api/workers', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.workers);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

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
app.post('/api/workers', async (req, res) => {
  const { name, age, position } = req.body;
  if (!name || !age || !position) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const data = await readData();
  const newWorker = { ...req.body, id: Date.now().toString() };
  data.workers.push(newWorker);
  await writeData(data);
  res.status(201).json(newWorker);
});

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
