const PROTO_PATH = __dirname + '/protos/nav.proto';
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const routeguide = grpc.loadPackageDefinition(packageDefinition).routeguide;

// Create stub for Routing service
const client = new routeguide.Routing(
    'localhost:50051',
    grpc.credentials.createInsecure()
);

// Sample data to send with the GetOptimalPath request
const request = {
    start_endpoint: 'A', // Starting endpoint ID
    end_endpoint: 'E', // Ending endpoint ID
    connections: {
        connections: [
            { from: 'A', to: 'B' },
            { from: 'B', to: 'C' },
            { from: 'C', to: 'D' },
            { from: 'D', to: 'E' },
            { from: 'A', to: 'D' },
        ],
    },
};

client.GetOptimalPath(request, (error, response) => {
    if (error) {
        console.error(`Error: ${error.message}`);
    } else {
        console.log('Optimal Path:', response.path);
    }
});
