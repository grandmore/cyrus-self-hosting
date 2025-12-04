---
type: system-overview
created: 2025-08-17
status: comprehensive-documentation
---

# Analytics Splitstream: Unified Analytics Proxy System

## Required Reading & Context

**This document works in conjunction with:**
- **MUST READ:** `Desire_Loop.md` - The psychological strategy that Splitstream enables
- **Related:** `Product_Strategy_and_Workflow.md` - Products that generate the tracked events
- **Related:** `Product_Ecosystem_Strategy.md` - How the products work together

**Relationship:** Splitstream is the data foundation that makes the Desire Loop strategy possible. Without Splitstream collecting behavioral data, the Desire Loop cannot function. They are two halves of the same system.

## Executive Overview

**Analytics Splitstream is the fundamental infrastructure that makes the entire Desire Loop system possible.** Without Splitstream, we are blind—unable to see customer behavior, track intervention effectiveness, or apply psychological pressure. This is not just an analytics system; it's the sensory nervous system that powers our entire business model.

Splitstream is a sophisticated, production-ready analytics proxy server that captures every behavioral signal across our product ecosystem. It serves as the unified collection point that transforms raw user interactions into actionable intelligence, enabling the Desire Loop's psychological persuasion engine to convert resistant business owners into revenue-generating customers.

## 🎯 Core Purpose & Philosophy

**Splitstream is the foundation upon which everything else is built.** The Desire Loop strategy requires precise behavioral data to function—without Splitstream's intelligence gathering, we cannot:
- Know when to apply psychological pressure
- Measure if interventions are working
- Identify which customers need which type of pressure
- Verify if actions were actually taken
- Discover new behavioral patterns that predict success

Splitstream embodies three critical functions:

1. **Unified Data Collection**: A single endpoint that all trackers send data to, creating a complete behavioral picture
2. **Intelligent Event Routing**: Classifies events as "hot" (immediate intervention triggers) or "cold" (pattern discovery)
3. **Time-Travel Analytics**: Maintains complete event history for discovering metrics and patterns we didn't initially know to track

**The Bottom Line**: Without Splitstream's data flowing into our systems, the Desire Loop is just theory. With it, we have a surgical instrument for behavioral influence that converts resistance into revenue.

## 🏗️ System Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT TRACKERS                          │
├───────────────┬──────────────┬──────────────┬──────────────┤
│  Membership   │   SEO Grid   │   Ecomacy    │   Website    │
│   Tracker     │   Tracker    │   Tracker    │   Tracker    │
└───────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘
        │              │              │              │
        └──────────────┴──────────────┴──────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │   ANALYTICS SPLITSTREAM        │
              │  (Cloud Run Service)           │
              │                                │
              │  • PostHog API Compatibility   │
              │  • Event Classification        │
              │  • Compression Handling        │
              │  • Identity Resolution         │
              └────────────┬──────────────────┘
                          │
           ┌──────────────┴──────────────┐
           ▼                             ▼
    ┌──────────────┐            ┌──────────────────┐
    │   PostHog    │            │   Cold Storage   │
    │ (Hot Events) │            │    Pipeline      │
    └──────────────┘            └────────┬─────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │    BigQuery     │
                                │  (Time Machine) │
                                └────────┬────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │ Cloud Storage   │
                                │   (Archives)    │
                                └─────────────────┘
```

### Technical Infrastructure

**Production Endpoint**: `https://analytics-splitstream-259151934459.europe-west1.run.app`

**Technology Stack**:
- **Runtime**: Node.js on Google Cloud Run
- **Hot Storage**: PostHog for immediate analytics
- **Cold Storage**: BigQuery for SQL-searchable history
- **Archive Storage**: Cloud Storage with Parquet format
- **Message Queue**: Google Pub/Sub for reliable event delivery

## 📡 The Four Tracking Systems

### 1. Membership Tracker

**Purpose**: Tracks user engagement within the CapturingLocal community platform

**Key Events Captured**:
- User authentication (login/logout)
- Content consumption patterns
- Community interactions
- Training module completion
- Peer comparison views
- Success story engagement

**Behavioral Intelligence**:
- Measures indoctrination progress through the Freedom Roadmap
- Tracks social proof receptiveness
- Identifies intervention-ready members
- Monitors worldview adoption metrics

**Platform ID**: `M3b7R2` (Membership Platform)

### 2. SEO Grid Tracker

**Purpose**: Monitors competitive intelligence gathering and reaction patterns

**Key Events Captured**:
- Ranking check frequency
- Competitor research depth
- Report generation and sharing
- AI recommendation interactions
- Grid visualization engagement time
- Loss quantification views

**Behavioral Intelligence**:
- Identifies competitive sensitivity thresholds
- Measures urgency response patterns
- Tracks action-to-insight conversion
- Monitors psychological pressure points

**Platform ID**: `A7k3M9` (SEO Grid Platform)

### 3. Ecomacy Tracker

**Purpose**: Captures operational performance and implementation verification

**Key Events Captured**:
- Call handling metrics
- Lead response times
- CRM usage patterns
- Review request compliance
- Follow-up completion rates
- Campaign management actions

**Behavioral Intelligence**:
- Verifies SEOGrid intention follow-through
- Measures operational discipline
- Identifies implementation gaps
- Tracks improvement trajectories

**Platform ID**: `D4n8P1` (Ecomacy Platform)

### 4. Website Tracker

**Purpose**: Direct customer website analytics and conversion tracking

**Key Events Captured**:
- Visitor behavior flows
- Form submissions
- Phone click tracking
- Page engagement metrics
- Traffic source attribution
- Conversion path analysis

**Behavioral Intelligence**:
- Validates marketing effectiveness claims
- Provides ammunition for intervention messaging
- Identifies customer journey friction points
- Measures real business impact

**Platform ID**: `R2w5X8` (Customer Websites)

## 🔥 Hot vs Cold Event Architecture

### Hot Events (Immediate Analytics)

Events requiring real-time processing and immediate visibility:

```javascript
{
  "job_booked",           // Revenue event
  "lead_generated",       // Pipeline event
  "subscription_started", // Recurring revenue
  "ranking_dropped",      // Urgent trigger
  "competitor_passed",    // Competitive threat
  "missed_call_alert"     // Operational failure
}
```

**Processing**: Direct routing to PostHog for dashboards and alerts

### Cold Events (Retroactive Analysis)

All events (including hot) stored for historical analysis:

```sql
-- Example: Discover that users who view competitors 
-- 5+ times in first week have 3x higher conversion
SELECT 
  user_id,
  COUNT(*) as competitor_views,
  MAX(subscription_started) as converted
FROM analytics_events.raw_events
WHERE event_name = 'competitor_viewed'
  AND event_time < TIMESTAMP_ADD(first_seen, INTERVAL 7 DAY)
GROUP BY user_id
HAVING competitor_views >= 5
```

**Value**: Enables discovery of patterns we didn't know to look for initially

## 🎭 Identity Resolution & Group Association

### Anonymous to Known User Flow

```javascript
// 1. Anonymous user lands on SEO Grid
posthog.capture('page_viewed', {
  distinct_id: 'anon-uuid-12345',
  platform: 'A7k3M9'
});

// 2. User signs up
posthog.identify('user-email@example.com', {
  previous_id: 'anon-uuid-12345'
});

// 3. User associated with their business
posthog.group('client', 'F6q9L2', {
  name: 'CherryTrees',
  industry: 'Gardening'
});
```

### Multi-Level Attribution

Events are tagged with multiple identifiers:
- **Platform**: Which product generated the event
- **Client**: Which business/customer owns the data
- **User**: Individual user within the organization
- **Session**: Specific interaction sequence

## 🔐 Security & Obfuscation

### ID Obfuscation Strategy

All platform and client identifiers use 6-character alphanumeric codes:
- Prevents competitor reverse-engineering
- Maintains clean analytics data
- Enables safe client-side tracking
- Preserves debugging capability

### Data Governance

- **PII Handling**: No personal data in event properties
- **Encryption**: TLS in transit, encryption at rest
- **Access Control**: IAM roles for service accounts
- **Audit Trail**: Complete event history in BigQuery
- **GDPR Ready**: User deletion propagates through pipeline

## 📊 Operational Metrics

### Current Performance (Production)

- **Throughput**: 10,000+ events/minute capability
- **Latency**: <100ms p95 response time
- **Reliability**: 99.9% uptime with auto-scaling
- **Cost**: ~$12-15/month for 3M events
- **Storage**: Unlimited with automatic archival

### Scaling Characteristics

- **Horizontal**: Auto-scales from 0 to N instances
- **Vertical**: Can increase from 128Mi to 8Gi RAM
- **Geographic**: Multi-region deployment ready
- **Throughput**: Linear scaling with instance count

## 🚀 Deployment & Configuration

### Environment Structure

```
servers/splitstream/
├── .env.dev          # Development configuration
├── .env.live         # Production configuration
├── config/
│   ├── hot-events.json        # Dynamic hot event list
│   └── platform-mappings.json  # Platform ID mappings
└── src/
    └── server.js     # Main server implementation
```

### Configuration Management

**Hot Events** (`config/hot-events.json`):
```json
{
  "events": [
    "job_booked",
    "lead_generated",
    "subscription_started"
  ]
}
```

**Platform Mappings** (`config/platform-mappings.json`):
```json
{
  "platforms": {
    "A7k3M9": "seo-grid",
    "D4n8P1": "ecomacy",
    "R2w5X8": "websites",
    "M3b7R2": "membership"
  }
}
```

## 🧠 Behavioral Intelligence Integration

### The Desire Loop Connection

Splitstream feeds the Desire Loop System's intervention engine by:

1. **Pattern Recognition**: Identifying behavioral triggers across platforms
2. **Threshold Detection**: Determining when users need psychological pressure
3. **Verification Loop**: Confirming whether interventions led to action
4. **Optimization Feedback**: Learning which pressures work for which segments

### Intelligence Aggregation

```sql
-- Example: Cross-platform behavioral correlation
WITH user_journey AS (
  SELECT 
    user_id,
    ARRAY_AGG(
      STRUCT(platform, event_name, event_time) 
      ORDER BY event_time
    ) as journey
  FROM analytics_events.raw_events
  WHERE event_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
  GROUP BY user_id
)
SELECT 
  platform_sequence,
  AVG(conversion_rate) as avg_conversion,
  COUNT(*) as user_count
FROM user_journey
CROSS JOIN UNNEST(journey) 
GROUP BY platform_sequence
```

## 🔮 Future Capabilities

### Planned Enhancements

1. **Real-time Intervention API**: Trigger interventions based on event patterns
2. **Predictive Analytics**: ML models for churn and conversion prediction
3. **Advanced Segmentation**: Dynamic cohort creation from behavioral patterns
4. **Cross-Platform Journey Mapping**: Visual flow analysis across all touchpoints
5. **Automated A/B Testing**: Event-driven experiment triggers

### Integration Roadmap

- **Webhook System**: Real-time event forwarding to external systems
- **Data Warehouse Sync**: Reverse ETL to operational systems
- **Custom Dashboards**: Business-specific metric visualization
- **Alert Framework**: Threshold-based notification system

## 🎯 Success Metrics

### Technical KPIs
- Event capture rate: >99.9%
- Processing latency: <100ms
- Data availability: <5 second delay
- Storage efficiency: <$0.01 per 1000 events

### Business KPIs
- Platform adoption tracking accuracy
- Intervention trigger precision
- Behavioral prediction accuracy
- Revenue attribution clarity

## Conclusion

Analytics Splitstream represents the technical foundation of our behavioral intelligence system. By unifying data collection across our entire product ecosystem while maintaining both real-time and historical analytics capabilities, it enables the Desire Loop System to apply precisely calibrated psychological pressure that converts resistant business owners into active customers.

The system's true power lies not in the individual trackers or storage mechanisms, but in the unified intelligence layer it creates—transforming scattered user interactions into actionable behavioral insights that drive revenue-generating actions.