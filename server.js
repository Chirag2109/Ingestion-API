const express = require('express');
const { v4: uuidv4 } = require('uuid');
const PriorityQueue = require('./priority-queue');
const BatchProcessor = require('./batch-processor');
const Storage = require('./storage');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize components
const storage = new Storage();
const priorityQueue = new PriorityQueue();
const batchProcessor = new BatchProcessor(storage, priorityQueue);

// Start the batch processor
batchProcessor.start();

// Ingestion API
app.post('/ingest', (req, res) => {
  try {
    const { ids, priority } = req.body;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids must be a non-empty array' });
    }

    if (!priority || !['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
      return res.status(400).json({ error: 'priority must be HIGH, MEDIUM, or LOW' });
    }

    const MAX_ID = 1_000_000_007;
    for (const id of ids) {
      if (!Number.isInteger(id) || id < 1 || id > MAX_ID) {
        return res.status(400).json({
          error: `All ids must be integers between 1 and ${MAX_ID}`
        });
      }
    }

    const ingestionId = uuidv4();
    const baseTime = Date.now();
    const batches = [];

    for (let i = 0; i < ids.length; i += 3) {
      const batchIds = ids.slice(i, i + 3);
      const batchId = uuidv4();

      const batch = {
        batch_id: batchId,
        ingestion_id: ingestionId,
        ids: batchIds,
        priority,
        created_time: baseTime + i, // Small offset to maintain FIFO for same ingestion
        status: 'yet_to_start'
      };

      priorityQueue.enqueue(batch);
      batches.push(batch);
    }

    // Store ingestion metadata
    storage.createIngestion(ingestionId, {
      ingestion_id: ingestionId,
      priority,
      created_time: baseTime,
      batches: batches.map(b => ({
        batch_id: b.batch_id,
        ids: b.ids,
        status: b.status
      }))
    });

    res.json({ ingestion_id: ingestionId });
  } catch (error) {
    console.error('Error in /ingest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Status API
app.get('/status/:ingestion_id', (req, res) => {
  try {
    const { ingestion_id } = req.params;
    const ingestion = storage.getIngestion(ingestion_id);

    if (!ingestion) {
      return res.status(404).json({ error: 'Ingestion not found' });
    }

    const statuses = ingestion.batches.map(b => b.status);
    let overallStatus;

    if (statuses.every(s => s === 'yet_to_start')) {
      overallStatus = 'yet_to_start';
    } else if (statuses.every(s => s === 'completed')) {
      overallStatus = 'completed';
    } else {
      overallStatus = 'triggered';
    }

    res.json({
      ingestion_id,
      status: overallStatus,
      batches: ingestion.batches
    });
  } catch (error) {
    console.error('Error in /status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
