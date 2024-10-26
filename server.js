const express = require('express');
const path = require('path');
const workerRoutes = require('./routes'); // Импортируем маршрутизатор

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Используйте маршрутизатор
app.use('/api', workerRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});