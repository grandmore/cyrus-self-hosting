# PubSub Patterns - Current Implementation

## Overview

SEO Grid currently uses Google Cloud Pub/Sub for processing DataForSEO webhook results. The system publishes messages to a `dataforseoTasks` topic when scan results are received.

## Current Implementation

### Webhook Endpoint (/seotasks)

Located in `main/api/app.js`, this endpoint receives DataForSEO webhook callbacks:

```javascript
app.post('/seotasks', async (req, res) => {
  // Receives individual scan results from DataForSEO
  // Each grid location scanned triggers a separate webhook call
  
  // Extract and validate the message
  const pubSubMessage = req.body.message
  const tags = parsedData.result[0].tag
  
  // Process based on scan type
  if (tags.scan === 'schedule') {
    // Handle scheduled scans
  }
  
  // Publish to PubSub for further processing
  const dataBuffer = Buffer.from(JSON.stringify(data))
  await pubsub.topic('dataforseoTasks').publish(dataBuffer)
})
```

### PubSub Module (pubsub.js)

The PubSub client configuration:

```javascript
const { PubSub } = require('@google-cloud/pubsub');
const topicName = 'dataforseoTasks'
const pubsub = new PubSub()

const importScanData = async (req, res, next) => {
  // Validates the incoming message
  if (!req.body || !req.body.id || !req.body.task) {
    return res.status(400).send('Invalid Pub/Sub message format')
  }
  
  // Publishes to appropriate topic based on task type
  const dataBuffer = Buffer.from(JSON.stringify(req.body))
  const messageId = await pubsub
    .topic(topicName)
    .publish(dataBuffer)
}
```

## Data Flow

1. **DataForSEO Scan Request**
   - API calls DataForSEO with grid locations to scan
   - Tags include scan metadata (customerid, keywordid, etc.)

2. **Webhook Callbacks**
   - DataForSEO sends individual webhooks for each location
   - 100 grid points = 100 separate webhook calls
   - Each arrives at `/seotasks` endpoint

3. **Message Publishing**
   - Endpoint validates and enriches the data
   - Publishes to `dataforseoTasks` PubSub topic
   - No rate limiting applied

4. **Message Processing**
   - Cloud Run instances subscribe to the topic
   - Process messages as they arrive
   - Save results to Firestore

## Known Issues

### 1. Overload Problem
When DataForSEO returns results for large batches:
- All webhooks arrive within seconds
- PubSub publishes all messages immediately
- Cloud Run instances receive simultaneous requests
- Can cause memory/CPU overload and failures

### 2. No Rate Limiting
PubSub doesn't provide built-in rate limiting:
- Messages are delivered as fast as possible
- No control over processing rate
- No backpressure mechanism

### 3. Retry Storms
Failed messages retry automatically:
- Can compound the overload problem
- Exponential backoff not always sufficient
- Can create cascading failures

## Planned Migration to Cloud Tasks

The team plans to migrate from PubSub to Cloud Tasks to address these issues:

**Benefits of Cloud Tasks**:
- Built-in rate limiting (e.g., 10 tasks/second)
- Controlled concurrency (e.g., max 5 concurrent)
- Better retry configuration
- Queue management and monitoring

**Migration Steps** (Not Yet Implemented):
1. Replace PubSub publishing with Cloud Tasks creation
2. Configure rate limits and retry policies
3. Update Cloud Run endpoints to handle Cloud Tasks requests
4. Implement idempotency keys to prevent duplicate processing

## Current Workarounds

Until migration to Cloud Tasks:

1. **Increase Cloud Run Resources**
   - More memory and CPU per instance
   - Higher max instance count
   - But this increases costs

2. **Batch Processing Logic**
   - Group related messages in application code
   - Process in smaller chunks
   - Add delays between processing

3. **Monitor and Alert**
   - Watch for Cloud Run memory/CPU spikes
   - Alert on PubSub message backlog
   - Manual intervention when overload detected

## Environment Variables

```bash
# PubSub configuration
PUBSUB_ENDPOINT_updateseo=<endpoint-url>
DATAFORSEO_USERNAME=<username>
DATAFORSEO_PASSWORD=<password>
WEBHOOK_TEST_ENDPOINT=<test-endpoint>
```

## Testing

The codebase includes PubSub test files:
- `test/pubsub-xtest.js` - Main PubSub tests
- `test/pubsub-subscribe.js` - Subscription tests
- `test/pubsub-subscribe-schedule.js` - Scheduled message tests
- `test/pubsub-send.js` - Message sending tests

Run with:
```bash
yarn testps  # Runs pubsub-send.js test
```