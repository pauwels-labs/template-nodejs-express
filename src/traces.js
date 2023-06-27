// Load config
const config = require("./config");

//const { NodeSDK } = require('@opentelemetry/sdk-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const autoInstrumentations = getNodeAutoInstrumentations({
  "@opentelemetry/instrumentation-fs": {
    enabled: false
  }
});
const { OTLPTraceExporter: OTLPTraceExporterGRPC } = require("@opentelemetry/exporter-trace-otlp-grpc");
const { OTLPTraceExporter: OTLPTraceExporterProto } = require("@opentelemetry/exporter-trace-otlp-proto");
const { OTLPTraceExporter: OTLPTraceExporterHTTP } = require("@opentelemetry/exporter-trace-otlp-http");
const { ConsoleSpanExporter, BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");

const serviceEnv = config.get("meta.env");
const serviceNamespace = config.get("meta.namespace");
const servicePodName = config.get("meta.pod.name");
const serviceName = config.get("meta.name");
const serviceVersion = config.get("meta.version");
const otlpURL = config.get("otlp.url");
const otlpProtocol = config.get("otlp.protocol");

if ((otlpProtocol && otlpProtocol == "console") || (otlpURL && typeof otlpURL == "string")) {
  // Register auto-instrumentations
  registerInstrumentations({
    instrumentations: [autoInstrumentations]
  });

  // Build the resource object and provide service metadata
  const resource = Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: serviceEnv,
      [SemanticResourceAttributes.K8S_NAMESPACE_NAME]: serviceNamespace,
      [SemanticResourceAttributes.K8S_POD_NAME]: servicePodName,
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
    })
  );

  // Create the trace node.js trace provider
  const provider = new NodeTracerProvider({
    resource: resource,
  });

  // Determine which OTel exporter to use
  var exporter = {};
  var protocolUsed = "grpc";
  if (otlpProtocol && otlpProtocol == "proto") {
    protocolUsed = "proto";
    exporter = new OTLPTraceExporterProto({
      url: otlpURL
    });    
  } else if (otlpProtocol && otlpProtocol == "http") {
    protocolUsed = "http";
    exporter = new OTLPTraceExporterHTTP({
      url: otlpURL,
    });
  } else if (otlpProtocol && otlpProtocol == "console") {
    protocolUsed = "console";
    exporter = new ConsoleSpanExporter();    
  } else {
    exporter = new OTLPTraceExporterGRPC({
      url: otlpURL,
    });
  }

  // Create the processor to batch and sending multiple traces at once
  const processor = new BatchSpanProcessor(exporter);

  // Bind the trace provider to the trace processor and register it
  provider.addSpanProcessor(processor);
  provider.register();

  // Notify that trace exporting has started
  const logger = require("./logger");
  if (protocolUsed == "console") {
    logger.info(`OpenTelemetry traces are being exported to the '${protocolUsed}' receiver`);
  } else {
    logger.info(`OpenTelemetry traces are being exported to the '${protocolUsed}' receiver at '${otlpURL}'`); 
  }
} else {
  // Notify that there will be no tracing and how to enable it
  const logger = require("./logger");
  logger.info("OpenTelemetry traces are disabled, to enable set the 'otlp.url' config value to an OpenTelemetry endpoint, or set the 'otlp.protocol' config to 'console' to output to console")
}
