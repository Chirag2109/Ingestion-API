function splitIntoSubBatches(ids, maxPerBatch = 3) {
  const subBatches = [];
  for (let i = 0; i < ids.length; i += maxPerBatch) {
    subBatches.push(ids.slice(i, i + maxPerBatch));
  }
  return subBatches;
}

module.exports = splitIntoSubBatches;