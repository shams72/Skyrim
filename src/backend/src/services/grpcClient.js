const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const logger = require('../../loggerSetup');

const PROTO_PATH = path.join(__dirname, '../protos/nav.proto');

logger.info('Loading proto file', {
    action: 'loadProto',
    protoPath: PROTO_PATH,
    timestamp: new Date().toISOString(),
});

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

logger.info('Proto file loaded successfully', {
    action: 'protoLoaded',
    protoPath: PROTO_PATH,
    timestamp: new Date().toISOString(),
});

const routeguide = grpc.loadPackageDefinition(packageDefinition).routeguide;

logger.info('Initializing gRPC client', {
    action: 'initGrpcClient',
    serviceAddress: 'navigation-service:50051',
    timestamp: new Date().toISOString(),
});

// start gRPC client for the routing service
const client = new routeguide.Routing(
    'navigation-service:50051', // gRPC server address
    grpc.credentials.createInsecure() // insecure credentials for testing purposes
);

logger.info('gRPC client connected', {
    action: 'grpcClientConnected',
    serviceAddress: 'navigation-service:50051',
    timestamp: new Date().toISOString(),
});

module.exports = client;
