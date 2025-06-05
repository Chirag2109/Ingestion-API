class Storage {
  constructor() {
    this.ingestions = new Map();
  }

  createIngestion(ingestionId, data) {
    this.ingestions.set(ingestionId, data);
  }

  getIngestion(ingestionId) {
    return this.ingestions.get(ingestionId);
  }

  updateBatchStatus(ingestionId, batchId, status) {
    const ingestion = this.ingestions.get(ingestionId);
    if (!ingestion) {
      console.warn(`Ingestion ID ${ingestionId} not found.`);
      return false;
    }

    const batch = ingestion.batches.find(b => b.batch_id === batchId);
    if (!batch) {
      console.warn(`Batch ID ${batchId} not found in ingestion ${ingestionId}.`);
      return false;
    }

    batch.status = status;

    // Optional: re-set the ingestion to ensure update is reflected (for future immutability)
    this.ingestions.set(ingestionId, ingestion);

    return true;
  }

  getAllIngestions() {
    return Array.from(this.ingestions.values());
  }

  clear() {
    this.ingestions.clear();
  }
}

module.exports = Storage;
