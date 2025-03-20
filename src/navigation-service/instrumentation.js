/*instrumentation.js*/
const opentelemetry = require('@opentelemetry/sdk-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const {
    OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-proto');
const { Resource } = require('@opentelemetry/resources');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http'); // Add more instrumentations as needed
const {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');

// Enable diagnostic logging for debugging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// Define the OpenTelemetry resource
const resource = Resource.default().merge(
    new Resource({
        [ATTR_SERVICE_NAME]: 'routing-service',
        [ATTR_SERVICE_VERSION]: '0.1.0',
    })
);

// Initialize the OpenTelemetry SDK with auto-instrumentations
const sdk = new opentelemetry.NodeSDK({
    resource: resource,
    traceExporter: new OTLPTraceExporter({
        url: 'http://sre-backend.osnet.h-da.cloud:4318/v1/traces',
        headers: {},
    }),
});

// Start the SDK
try {
    sdk.start();
    console.log('Tracing initialized');
} catch (error) {
    console.error('Error initializing tracing', error);
}
