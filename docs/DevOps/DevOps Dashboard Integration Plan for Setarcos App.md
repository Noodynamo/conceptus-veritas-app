# DevOps Dashboard Integration Plan for Setarcos App

## Overview
This document outlines the integration of a comprehensive Prometheus and Grafana DevOps dashboard into the Setarcos philosophy application. The plan follows the structure of the master technical blueprint and provides detailed implementation guidance for monitoring throughout the software development lifecycle.

## 12.4 Monitoring and Observability

### 12.4.1 Monitoring Philosophy and Strategy

#### 12.4.1.1 Shift-Left Observability Approach
- Integration of monitoring throughout the SDLC from planning and design
- Designing systems to be inherently observable
- Establishing observability as a shared responsibility across teams
- Implementing "Design for Failure" principles with proactive instrumentation

#### 12.4.1.2 Monitoring Integration Points
- Development: Code-level instrumentation with prometheus_client for Dart
- Integration: Pipeline metrics collection via CI/CD tools
- Testing: Test coverage and performance metrics
- Deployment: Deployment frequency and success rate tracking
- Operations: Infrastructure and application performance monitoring
- Feedback: User experience and business impact metrics

### 12.4.2 Prometheus Implementation

#### 12.4.2.1 Installation and Configuration
```bash
# Install Prometheus on Ubuntu
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-2.45.0.linux-amd64.tar.gz
cd prometheus-2.45.0.linux-amd64/

# Create configuration file
cat > prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'setarcos-api'
    static_configs:
      - targets: ['api-server:8000']
    
  - job_name: 'setarcos-app'
    static_configs:
      - targets: ['app-server:3000']
    
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

# Run Prometheus
./prometheus --config.file=prometheus.yml
```

#### 12.4.2.2 Exporters Configuration
- **Node Exporter**: For server-level metrics (CPU, memory, disk, network)
- **PostgreSQL Exporter**: For Supabase/PostgreSQL database metrics
- **Redis Exporter**: For Redis cache and message broker metrics
- **Blackbox Exporter**: For endpoint availability and response time

#### 12.4.2.3 Service Discovery Integration
- Implement service discovery for dynamic environments
- Configure Prometheus to automatically discover and monitor new services
- Integrate with container orchestration platform for automatic target updates

### 12.4.3 Grafana Implementation

#### 12.4.3.1 Installation and Configuration
```bash
# Install Grafana on Ubuntu
sudo apt-get install -y apt-transport-https software-properties-common
sudo wget -q -O /usr/share/keyrings/grafana.key https://apt.grafana.com/gpg.key
echo "deb [signed-by=/usr/share/keyrings/grafana.key] https://apt.grafana.com stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
sudo apt-get update
sudo apt-get install grafana

# Start Grafana service
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

#### 12.4.3.2 Data Source Configuration
- Configure Prometheus as primary data source
- Add Loki for log aggregation (future integration)
- Add Tempo for distributed tracing (future integration)
- Configure PostgreSQL direct connection for business metrics

#### 12.4.3.3 Dashboard Organization
- Create folder structure aligned with app features and components
- Implement consistent naming conventions
- Set up dashboard linking for drill-down capabilities
- Configure dashboard variables for environment and service selection

### 12.4.4 Application Instrumentation

#### 12.4.4.1 Dart Application Instrumentation
```dart
// Add dependencies to pubspec.yaml
dependencies:
  prometheus_client: ^1.0.0
  prometheus_client_shelf: ^1.0.0

// Initialize metrics in main.dart
import 'package:prometheus_client/prometheus_client.dart';
import 'package:prometheus_client_shelf/prometheus_client_shelf.dart';

final registry = PrometheusClient();

// Define metrics
final requestCounter = registry.registerCounter(
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status']
);

final requestDuration = registry.registerHistogram(
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
);

// Expose metrics endpoint
app.get('/metrics', prometheusHandler(registry: registry));

// Use middleware for automatic request tracking
app.use(metricsMiddleware(registry: registry));
```

#### 12.4.4.2 Feature-Specific Instrumentation

##### Ask Feature Metrics
```dart
// Define Ask feature specific metrics
final askQuestionsTotal = registry.registerCounter(
  name: 'ask_questions_total',
  help: 'Total number of questions asked',
  labelNames: ['user_type', 'ai_model']
);

final askResponseTime = registry.registerHistogram(
  name: 'ask_response_time_seconds',
  help: 'Time taken to generate AI response',
  labelNames: ['ai_model'],
  buckets: [0.5, 1, 2, 5, 10, 30, 60]
);

final askUserSatisfaction = registry.registerGauge(
  name: 'ask_user_satisfaction',
  help: 'User satisfaction rating for AI responses',
  labelNames: ['ai_model']
);
```

##### Explore Feature Metrics
```dart
// Define Explore feature specific metrics
final exploreConceptsViewed = registry.registerCounter(
  name: 'explore_concepts_viewed_total',
  help: 'Total number of concepts viewed',
  labelNames: ['concept_category']
);

final exploreSessionDuration = registry.registerHistogram(
  name: 'explore_session_duration_seconds',
  help: 'Duration of explore feature sessions',
  buckets: [30, 60, 120, 300, 600, 1200, 1800]
);
```

##### Quest Feature Metrics
```dart
// Define Quest feature specific metrics
final questsStarted = registry.registerCounter(
  name: 'quests_started_total',
  help: 'Total number of quests started',
  labelNames: ['quest_type', 'difficulty']
);

final questsCompleted = registry.registerCounter(
  name: 'quests_completed_total',
  help: 'Total number of quests completed',
  labelNames: ['quest_type', 'difficulty']
);

final questCompletionRate = registry.registerGauge(
  name: 'quest_completion_rate',
  help: 'Percentage of started quests that are completed',
  labelNames: ['quest_type', 'difficulty']
);
```

#### 12.4.4.3 AI Router Instrumentation
```dart
// Define AI Router specific metrics
final aiRouterRequests = registry.registerCounter(
  name: 'ai_router_requests_total',
  help: 'Total number of requests to AI Router',
  labelNames: ['model', 'feature']
);

final aiRouterLatency = registry.registerHistogram(
  name: 'ai_router_latency_seconds',
  help: 'Latency of AI Router requests',
  labelNames: ['model', 'feature'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
);

final aiRouterErrors = registry.registerCounter(
  name: 'ai_router_errors_total',
  help: 'Total number of AI Router errors',
  labelNames: ['model', 'error_type']
);

final aiRouterTokensUsed = registry.registerCounter(
  name: 'ai_router_tokens_total',
  help: 'Total number of tokens used by AI models',
  labelNames: ['model', 'feature']
);
```

### 12.4.5 Core Metrics Implementation

#### 12.4.5.1 DORA Metrics
- **Deployment Frequency**: Track via CI/CD pipeline events
- **Lead Time for Changes**: Measure time from commit to production
- **Change Failure Rate**: Monitor production incidents post-deployment
- **Mean Time to Recovery**: Track incident resolution times

```dart
// DORA metrics implementation
final deploymentCounter = registry.registerCounter(
  name: 'deployments_total',
  help: 'Total number of deployments',
  labelNames: ['environment', 'status']
);

final leadTimeGauge = registry.registerGauge(
  name: 'lead_time_minutes',
  help: 'Time from commit to production in minutes',
  labelNames: ['feature']
);

final changeFailureCounter = registry.registerCounter(
  name: 'deployment_failures_total',
  help: 'Total number of deployment failures',
  labelNames: ['environment', 'failure_type']
);

final mttrGauge = registry.registerGauge(
  name: 'incident_recovery_time_minutes',
  help: 'Mean time to recovery in minutes',
  labelNames: ['severity', 'component']
);
```

#### 12.4.5.2 Application Performance Metrics
- **Apdex**: User satisfaction with response times
- **Average Response Time**: Mean duration for request processing
- **Error Rates**: Percentage of failed transactions
- **Availability**: System uptime percentage
- **Performance**: General application performance metrics

#### 12.4.5.3 Infrastructure Health Metrics
- **CPU Usage**: Aggregate CPU utilization
- **Memory Usage**: Memory consumption patterns
- **Network Activity**: Network I/O, latency, packet loss
- **Load Average**: System load over time intervals

#### 12.4.5.4 Deployment and CI/CD Metrics
- **Build Success Rate**: Percentage of successful builds
- **Build Duration**: Time required for builds to complete
- **Test Coverage**: Code coverage percentage
- **Test Success Rate**: Percentage of passing tests

### 12.4.6 Dashboard Design

#### 12.4.6.1 Executive Dashboard
- High-level overview for Chief Developer
- DORA metrics visualization
- System health summary
- Recent deployments and incidents
- Key business metrics

#### 12.4.6.2 Feature-Specific Dashboards
- Dedicated dashboards for Ask, Quest, Explore, Journal, Forum features
- Feature-specific performance metrics
- User engagement metrics
- Error rates and common issues

#### 12.4.6.3 Infrastructure Dashboard
- Server resource utilization
- Database performance
- Redis cache metrics
- Network performance

#### 12.4.6.4 CI/CD Pipeline Dashboard
- Build and deployment metrics
- Test coverage and results
- Code quality metrics
- Deployment frequency visualization

### 12.4.7 Security Implementation

#### 12.4.7.1 Authentication and Authorization
- Configure Grafana with SAML authentication
- Implement role-based access control
- Set up team-based dashboard permissions
- Secure API tokens for automated access

#### 12.4.7.2 Network Security
- Configure HTTPS for all dashboard access
- Implement network segmentation
- Set up reverse proxy for additional security
- Configure proper firewall rules

#### 12.4.7.3 Data Protection
- Implement data retention policies
- Configure secure storage for sensitive metrics
- Ensure proper handling of PII in logs and metrics
- Regular security audits of the monitoring infrastructure

### 12.4.8 Alerting and Notification

#### 12.4.8.1 Alert Rules Configuration
- Define SLOs and corresponding alert thresholds
- Configure multi-level alerting (warning, critical)
- Implement alert grouping and routing
- Set up silence periods for maintenance windows

#### 12.4.8.2 Notification Channels
- Email notifications for non-urgent alerts
- SMS/phone alerts for critical issues
- Integration with PagerDuty for on-call rotation
- Slack/Teams integration for team notifications

#### 12.4.8.3 Alert Templates
- Standardized alert message format
- Include relevant links to dashboards and runbooks
- Contextual information for faster troubleshooting
- Clear escalation paths

### 12.4.9 Integration with Existing Systems

#### 12.4.9.1 Supabase/PostgreSQL Integration
- Configure PostgreSQL exporter
- Set up database performance dashboards
- Monitor query performance and connection pools
- Track database size and growth

#### 12.4.9.2 Redis Integration
- Configure Redis exporter
- Monitor cache hit/miss rates
- Track memory usage and evictions
- Visualize queue lengths for Celery tasks

#### 12.4.9.3 Celery Task Monitoring
- Track task execution times
- Monitor queue lengths and processing rates
- Alert on failed tasks and retries
- Visualize task distribution and bottlenecks

#### 12.4.9.4 AI Service Monitoring
- Track API calls to external AI services
- Monitor token usage and costs
- Measure response times and error rates
- Compare performance across different AI models

## 13. Implementation Plan

### 13.1 Phased Implementation

#### 13.1.1 Phase 1: Foundation (Weeks 1-2)
- Install and configure Prometheus and Grafana
- Set up basic server monitoring with Node Exporter
- Implement core infrastructure dashboards
- Configure basic alerting for critical systems

#### 13.1.2 Phase 2: Application Instrumentation (Weeks 3-4)
- Instrument Dart applications with prometheus_client
- Implement feature-specific metrics
- Create application performance dashboards
- Set up error tracking and alerting

#### 13.1.3 Phase 3: DORA Metrics (Weeks 5-6)
- Implement CI/CD pipeline instrumentation
- Configure DORA metrics collection and visualization
- Create executive dashboard for delivery performance
- Set up trend analysis and reporting

#### 13.1.4 Phase 4: Advanced Features (Weeks 7-8)
- Implement log aggregation with Loki
- Add distributed tracing with Tempo
- Create cross-functional correlation dashboards
- Implement advanced alerting and anomaly detection

### 13.2 Resource Requirements

#### 13.2.1 Infrastructure
- Dedicated VM or container for Prometheus (4 CPU, 8GB RAM, 100GB storage)
- Dedicated VM or container for Grafana (2 CPU, 4GB RAM, 20GB storage)
- Additional storage for metrics retention (based on retention policy)
- Network bandwidth for metrics collection

#### 13.2.2 Personnel
- DevOps engineer for initial setup and configuration
- Developer time for application instrumentation
- Operations team training for dashboard usage and alert response
- Ongoing maintenance and optimization

#### 13.2.3 Dependencies
- Access to CI/CD pipelines for integration
- Permissions to install exporters on all monitored systems
- Network access between all components and monitoring systems
- Authentication integration with existing identity providers

### 13.3 Success Metrics

#### 13.3.1 Implementation KPIs
- 100% of critical systems monitored
- All DORA metrics successfully implemented
- Alert response time under 5 minutes for critical issues
- Dashboard load time under 2 seconds

#### 13.3.2 Operational KPIs
- 99.9% monitoring system uptime
- Less than 5% false positive alerts
- Mean time to detection reduced by 50%
- Mean time to resolution reduced by 30%

## Appendix A: Dashboard Templates

### A.1 Executive Dashboard Template
```json
{
  "dashboard": {
    "id": null,
    "title": "Setarcos Executive Dashboard",
    "tags": ["executive", "overview"],
    "timezone": "browser",
    "editable": true,
    "panels": [
      {
        "title": "DORA Metrics Overview",
        "type": "row",
        "collapsed": false
      },
      {
        "title": "Deployment Frequency",
        "type": "stat",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "sum(increase(deployments_total{environment=\"production\"}[30d])) / 30",
            "legendFormat": "Deployments per Day"
          }
        ],
        "options": {
          "colorMode": "value",
          "graphMode": "area",
          "justifyMode": "auto"
        }
      }
      // Additional panels omitted for brevity
    ]
  }
}
```

### A.2 Feature Dashboard Template
```json
{
  "dashboard": {
    "id": null,
    "title": "Setarcos ${feature} Dashboard",
    "tags": ["feature", "${feature}"],
    "timezone": "browser",
    "editable": true,
    "templating": {
      "list": [
        {
          "name": "feature",
          "type": "custom",
          "query": "ask,quest,explore,journal,forum",
          "current": {
            "value": "ask",
            "text": "Ask"
          }
        }
      ]
    },
    "panels": [
      // Panels omitted for brevity
    ]
  }
}
```

## Appendix B: Alert Rule Examples

### B.1 Infrastructure Alert Rules
```yaml
groups:
- name: infrastructure
  rules:
  - alert: HighCPUUsage
    expr: avg by(instance) (rate(node_cpu_seconds_total{mode!="idle"}[5m])) * 100 > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage on {{ $labels.instance }}"
      description: "CPU usage is above 80% for 5 minutes on {{ $labels.instance }}"
  
  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage on {{ $labels.instance }}"
      description: "Memory usage is above 85% for 5 minutes on {{ $labels.instance }}"
```

### B.2 Application Alert Rules
```yaml
groups:
- name: application
  rules:
  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100 > 5
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is above 5% for 2 minutes"
  
  - alert: SlowResponseTime
    expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Slow response times detected"
      description: "95th percentile of response time is above 2 seconds for 5 minutes"
```
