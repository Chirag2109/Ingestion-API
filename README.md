# Job Queue Backend API

A priority-based job queue system with rate limiting. This backend provides two REST API endpoints for job submission and status checking.

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Test the APIs:**
   - Open [http://localhost:3000](http://localhost:3000) for the test interface
   - Or use curl/Postman to test the endpoints directly

### Production Deployment

1. **Build the application:**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start production server:**
   \`\`\`bash
   npm start
   \`\`\`

## 📡 API Endpoints

### 1. POST /api/ingest

Submit IDs for processing with priority-based queuing.

**Request:**
\`\`\`bash
curl -X POST http://localhost:3000/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '{
    "ids": [1, 2, 3, 4, 5],
    "priority": "HIGH"
  }'
\`\`\`

**Response:**
\`\`\`json
{
  "ingestion_id": "550e8400-e29b-41d4-a716-446655440000"
}
\`\`\`

**Validation Rules:**
- `ids`: Array of integers between 1 and 10^9+7
- `priority`: Must be "HIGH", "MEDIUM", or "LOW"
- Array cannot be empty

### 2. GET /api/status/[ingestionId]

Check the processing status of a submitted job.

**Request:**
\`\`\`bash
curl http://localhost:3000/api/status/550e8400-e29b-41d4-a716-446655440000
\`\`\`

**Response:**
\`\`\`json
{
  "ingestion_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "triggered",
  "batches": [
    {
      "batch_id": "batch-uuid-1",
      "ids": [1, 2, 3],
      "status": "completed"
    },
    {
      "batch_id": "batch-uuid-2",
      "ids": [4, 5],
      "status": "triggered"
    }
  ]
}
\`\`\`

## 🔧 System Behavior

### Processing Rules
- **Batch Size**: IDs are automatically split into batches of maximum 3 IDs
- **Rate Limiting**: Only 1 batch processed every 5 seconds
- **Priority Order**: HIGH → MEDIUM → LOW
- **Same Priority**: Processed by submission time (FIFO)

### Status States
- **yet_to_start**: Batch is queued but not yet processing
- **triggered**: Batch is currently being processed  
- **completed**: Batch processing has finished

### Overall Status Calculation
- **yet_to_start**: All batches are yet_to_start
- **triggered**: At least one batch is triggered
- **completed**: All batches are completed

## 🧪 Testing

### Run Test Suite
\`\`\`bash
npm test
\`\`\`

### Manual Testing Examples

**Test Case 1: Basic Functionality**
\`\`\`bash
# Submit job
curl -X POST http://localhost:3000/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '{"ids": [1, 2, 3, 4, 5], "priority": "MEDIUM"}'

# Check status (use the returned ingestion_id)
curl http://localhost:3000/api/status/YOUR_INGESTION_ID
\`\`\`

**Test Case 2: Priority Processing**
\`\`\`bash
# Submit MEDIUM priority job
curl -X POST http://localhost:3000/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '{"ids": [1, 2, 3, 4, 5], "priority": "MEDIUM"}'

# Submit HIGH priority job (should be processed first)
curl -X POST http://localhost:3000/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '{"ids": [6, 7, 8, 9], "priority": "HIGH"}'
\`\`\`

**Test Case 3: Error Handling**
\`\`\`bash
# Invalid priority
curl -X POST http://localhost:3000/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '{"ids": [1, 2, 3], "priority": "INVALID"}'

# Empty IDs array
curl -X POST http://localhost:3000/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '{"ids": [], "priority": "HIGH"}'

# Non-existent ingestion ID
curl http://localhost:3000/api/status/non-existent-id
\`\`\`

## 🏗️ Architecture

### Core Components
- **JobQueue Class**: Singleton managing priority queue and processing
- **Rate Limiter**: Ensures 1 batch per 5-second processing window
- **Batch Processor**: Handles asynchronous job processing
- **Status Tracker**: Maintains job and batch status information

### Data Flow
1. **Ingestion**: IDs submitted → Validated → Split into batches → Added to priority queue
2. **Processing**: Queue sorted by priority → Batches processed with rate limiting
3. **Status**: Real-time status tracking for jobs and individual batches

## 🚀 Deployment Options

### Vercel (Recommended)
\`\`\`bash
npm install -g vercel
vercel deploy
\`\`\`

## 📊 Monitoring

The system includes built-in logging for:
- Job submissions and batch creation
- Processing start/completion events
- Queue state changes
- Error conditions

Check the console output for real-time processing information.

## 🔍 Troubleshooting

### Common Issues

**Jobs not processing:**
- Check console logs for rate limiting messages
- Verify jobs are being added to queue correctly

**Status not updating:**
- Ensure ingestion_id is correct
- Check if job exists in the system

**API errors:**
- Validate request format matches documentation
- Check ID ranges (1 to 10^9+7)
- Verify priority values (HIGH/MEDIUM/LOW)

### Debug Information

Access debug information at runtime:
\`\`\`javascript
// In browser console or server logs
JobQueue.getInstance().getQueueState()
\`\`\`

## 📝 Requirements Compliance

✅ **Ingestion API**: POST /api/ingest with ID validation and priority handling  
✅ **Status API**: GET /api/status/[id] with detailed batch information  
✅ **Rate Limiting**: 1 batch (max 3 IDs) per 5 seconds  
✅ **Priority Processing**: HIGH > MEDIUM > LOW with timestamp ordering  
✅ **Batch Processing**: Automatic splitting of large ID arrays  
✅ **Status Tracking**: Real-time job and batch status updates  
✅ **Error Handling**: Comprehensive validation and error responses  
✅ **Asynchronous Processing**: Background job processing with proper queuing  

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request
