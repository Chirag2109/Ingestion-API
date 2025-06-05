class PriorityQueue {
  constructor() {
    this.queue = []
  }

  enqueue(batch) {
    this.queue.push(batch)
    this.sort()
  }

  dequeue() {
    return this.queue.shift()
  }

  isEmpty() {
    return this.queue.length === 0
  }

  size() {
    return this.queue.length
  }

  sort() {
    // Sort by priority (HIGH=3, MEDIUM=2, LOW=1) descending, then by created_time ascending
    this.queue.sort((a, b) => {
      const priorityMap = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      const priorityDiff = priorityMap[b.priority] - priorityMap[a.priority]

      if (priorityDiff !== 0) {
        return priorityDiff
      }

      // If same priority, sort by created_time (FIFO)
      return a.created_time - b.created_time
    })
  }

  peek() {
    return this.queue[0]
  }

  // Get all batches (for debugging)
  getAll() {
    return [...this.queue]
  }
}

module.exports = PriorityQueue
