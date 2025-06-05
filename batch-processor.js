class BatchProcessor {
  constructor(storage, priorityQueue) {
    this.storage = storage;
    this.priorityQueue = priorityQueue;
    this.lastProcessTime = 0;
    this.RATE_LIMIT_MS = 5000;
  }

  start() {
    console.log("Batch processor started");
    this.processLoop();
  }

  async processLoop() {
    while (true) {
      try {
        if (!this.priorityQueue.isEmpty()) {
          const now = Date.now();
          const timeSinceLast = now - this.lastProcessTime;

          if (timeSinceLast >= this.RATE_LIMIT_MS) {
            const batch = this.priorityQueue.dequeue();
            await this.processBatch(batch);
            this.lastProcessTime = Date.now();
          }
        }
        await this.sleep(100);
      } catch (err) {
        console.error("Error in process loop:", err);
        await this.sleep(1000);
      }
    }
  }

  async processBatch(batch) {
    try {
      console.log(`[${new Date().toISOString()}] Processing batch ${batch.batch_id} with IDs: ${batch.ids.join(", ")}`);
      batch.status = "triggered";
      this.storage.updateBatchStatus(batch.ingestion_id, batch.batch_id, "triggered");

      const results = [];
      for (const id of batch.ids) {
        const result = await this.mockExternalApiCall(id);
        results.push(result);
      }

      batch.status = "completed";
      this.storage.updateBatchStatus(batch.ingestion_id, batch.batch_id, "completed");

      console.log(`[${new Date().toISOString()}] Completed batch ${batch.batch_id}`);
    } catch (err) {
      console.error(`Error processing batch ${batch.batch_id}:`, err);
    }
  }

  async mockExternalApiCall(id) {
    const delay = Math.random() * 400 + 100;
    await this.sleep(delay);
    return { id, data: "processed", timestamp: new Date().toISOString() };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = BatchProcessor;
