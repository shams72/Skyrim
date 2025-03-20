# Traces

## Overview
This project integrates OpenTelemetry (OpTel) tracing into the Node.js application using the default tracer library provided by OpTel. It currently tracks the route calculation request path inside the Backend and Navigation Service.

### Key Features:
- Spans collected using OpTel's `ActiveSpan`, which allows for hierarchy building and nesting between the spans.
- Spans contain *attributes* regarding to that specific span e.g. start/endpoints for a route calculation, *events* that refer to specific points inside an operation e.g. when a path is found for a request, and *status codes* in case an operation fails.

---

## Instrumentation

Instrumentation setup (*instrumentation.js*) is to be found in the root folder of our backend/navigation service, and is identical across these two services. Each library used inside this file requires separate installation using `npm`, for example `npm install @opentelemetry\api`. The traces will be exported to our provided OTLP endpoints (**Important**: currently causing issues with trace collection).
