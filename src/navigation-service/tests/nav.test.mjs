import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { expect } from 'chai';
import sinon from 'sinon';
import { startServer, server } from '../server.js';
import logger from '../loggerSetup.js';

const PROTO_PATH = path.join(
    path
        .dirname(new URL(import.meta.url).pathname)
        .replace(/^\/C:/, 'C:')
        .replace(/%20/g, ' '),
    '../protos',
    'nav.proto'
);
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const routeguide = grpc.loadPackageDefinition(packageDefinition).routeguide;

const conns = {
    connections: [
        { from: 'Riften', to: 'Shor’s Stone', dist: 3 },
        { from: 'Riften', to: 'Ivarstead', dist: 9 },
        { from: 'Shor’s Stone', to: 'Riften', dist: 3 },
        { from: 'Shor’s Stone', to: 'Ivarstead', dist: 8 },
        { from: 'Shor’s Stone', to: 'Windhelm', dist: 7 },
        { from: 'Windhelm', to: 'Shor’s Stone', dist: 7 },
        { from: 'Windhelm', to: 'Ivarstead', dist: 8 },
        { from: 'Windhelm', to: 'Whiterun', dist: 10 },
        { from: 'Windhelm', to: 'Winterhold', dist: 9 },
        { from: 'Winterhold', to: 'Windhelm', dist: 9 },
        { from: 'Winterhold', to: 'Dawnstar', dist: 14 },
        { from: 'Dawnstar', to: 'Winterhold', dist: 14 },
        { from: 'Dawnstar', to: 'Morthal', dist: 7 },
        { from: 'Morthal', to: 'Dawnstar', dist: 7 },
        { from: 'Morthal', to: 'Solitude', dist: 6 },
        { from: 'Morthal', to: 'Rorikstead', dist: 7 },
        { from: 'Morthal', to: 'Dragon Bridge', dist: 5 },
        { from: 'Solitude', to: 'Morthal', dist: 6 },
        { from: 'Solitude', to: 'Dragon Bridge', dist: 2 },
        { from: 'Dragon Bridge', to: 'Morthal', dist: 5 },
        { from: 'Dragon Bridge', to: 'Solitude', dist: 2 },
        { from: 'Dragon Bridge', to: 'Karthwasten', dist: 8 },
        { from: 'Karthwasten', to: 'Dragon Bridge', dist: 8 },
        { from: 'Karthwasten', to: 'Rorikstead', dist: 4 },
        { from: 'Karthwasten', to: 'Markarth', dist: 4 },
        { from: 'Markarth', to: 'Karthwasten', dist: 4 },
        { from: 'Markarth', to: 'Rorikstead', dist: 8 },
        { from: 'Markarth', to: 'Falkreath', dist: 14 },
        { from: 'Falkreath', to: 'Markarth', dist: 14 },
        { from: 'Falkreath', to: 'Helgen', dist: 3 },
        { from: 'Falkreath', to: 'Riverwood', dist: 5 },
        { from: 'Falkreath', to: 'Rorikstead', dist: 10 },
        { from: 'Rorikstead', to: 'Falkreath', dist: 10 },
        { from: 'Rorikstead', to: 'Markarth', dist: 8 },
        { from: 'Rorikstead', to: 'Karthwasten', dist: 4 },
        { from: 'Rorikstead', to: 'Morthal', dist: 7 },
        { from: 'Rorikstead', to: 'Whiterun', dist: 10 },
        { from: 'Whiterun', to: 'Rorikstead', dist: 10 },
        { from: 'Whiterun', to: 'Windhelm', dist: 10 },
        { from: 'Whiterun', to: 'Riverwood', dist: 3 },
        { from: 'Whiterun', to: 'Ivarstead', dist: 8 },
        { from: 'Ivarstead', to: 'Whiterun', dist: 8 },
        { from: 'Ivarstead', to: 'Riften', dist: 9 },
        { from: 'Ivarstead', to: 'Shor’s Stone', dist: 8 },
        { from: 'Ivarstead', to: 'Windhelm', dist: 8 },
        { from: 'Ivarstead', to: 'Helgen', dist: 5 },
        { from: 'Helgen', to: 'Ivarstead', dist: 5 },
        { from: 'Helgen', to: 'Falkreath', dist: 3 },
        { from: 'Helgen', to: 'Riverwood', dist: 3 },
        { from: 'Riverwood', to: 'Helgen', dist: 3 },
        { from: 'Riverwood', to: 'Falkreath', dist: 5 },
        { from: 'Riverwood', to: 'Whiterun', dist: 3 },
    ],
};

const conns2 = {
    connections: [
        { from: 'City_0', to: 'City_1', dist: 1 },
        { from: 'City_1', to: 'City_2', dist: 1 },
        { from: 'City_2', to: 'City_3', dist: 1 },
        { from: 'City_3', to: 'City_4', dist: 1 },
        { from: 'City_0', to: 'City_3', dist: 1 },
        { from: 'City_4', to: 'City_4', dist: 0 },
    ],
};

describe('Routing Service', function () {
    let client;
    let sandbox;

    // Before test: start the test server and create a client
    before(async function () {
        await startServer(50052);
        client = new routeguide.Routing(
            'localhost:50052',
            grpc.credentials.createInsecure()
        );
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(logger, 'error');
    });

    afterEach(() => {
        sandbox.restore();
    });

    // After test: close the client and shutdown the server
    after(function () {
        client.close();
        server.tryShutdown(() => {});
    });

    after(() => {
        setTimeout(() => {
            process.exit(0);
        }, 500);
    });

    it('should return the optimal and alt paths between two endpoints', function (done) {
        const request = {
            start_endpoint: 'Riften',
            end_endpoint: 'Rorikstead',
            connections: conns,
        };

        client.GetOptimalPath(request, (error, response) => {
            if (error) {
                done(error); // If there's an error, fail the test
            } else {
                // Assert the response contains the expected path
                expect(response).to.have.property('path_opt');
                expect(response).to.have.property('path_alt');
                expect(response.path_opt).to.be.an('array');
                expect(response.path_alt).to.be.an('array');
                expect(response.path_alt).to.deep.equal([
                    'Riften',
                    'Ivarstead',
                    'Whiterun',
                    'Rorikstead',
                ]);
                expect(response.path_opt).to.deep.equal([
                    'Riften',
                    'Ivarstead',
                    'Helgen',
                    'Falkreath',
                    'Rorikstead',
                ]);

                done(); // Complete the test successfully
            }
        });
    });

    it('should return an error if no path exists', function (done) {
        const request = {
            start_endpoint: 'Riften',
            end_endpoint: 'Z', // No connection to 'Z' in provided connections
            connections: conns,
        };

        client.GetOptimalPath(request, (error, response) => {
            try {
                expect(error).to.exist;
                expect(error.code).to.equal(grpc.status.NOT_FOUND);
                expect(error.message).to.include('No path found');
                expect(response).to.be.undefined;
                done();
            } catch (assertionError) {
                done(assertionError);
            }
        });
    });

    it('should return an error if no alt path exists', function (done) {
        const request = {
            start_endpoint: 'City_0',
            end_endpoint: 'City_4',
            connections: conns2,
        };

        client.GetOptimalPath(request, (error, response) => {
            try {
                expect(error).to.exist;
                expect(error.code).to.equal(grpc.status.NOT_FOUND);
                expect(error.message).to.include('No alt path found');
                expect(response).to.be.undefined;
                done();
            } catch (assertionError) {
                done(assertionError);
            }
        });
    });

    it('should return an error if parameters are missing', function (done) {
        const request = {
            start_endpoint: 'Riften',
            end_endpoint: 'Whiterun',
        };

        client.GetOptimalPath(request, (error, response) => {
            try {
                expect(error).to.exist;
                expect(error.code).to.equal(grpc.status.INVALID_ARGUMENT);
                expect(error.message).to.include('Missing required fields');
                expect(response).to.be.undefined;
                done();
            } catch (assertionError) {
                done(assertionError);
            }
        });
    });

    it('(stream) should return the optimal and alt paths between two endpoints', function (done) {
        const call = client.GetOptimalPathStream((error, response) => {
            if (error) {
                done(error);
            } else {
                expect(response).to.have.property('path_opt');
                expect(response).to.have.property('path_alt');
                expect(response.path_opt).to.be.an('array');
                expect(response.path_alt).to.be.an('array');
                expect(response.path_opt).to.deep.equal([
                    'City_0',
                    'City_3',
                    'City_4',
                ]);
                expect(response.path_alt).to.deep.equal([
                    'City_0',
                    'City_1',
                    'City_4',
                ]);
                done();
            }
        });

        // Send streaming chunks
        call.write({
            start_endpoint: 'City_0',
            end_endpoint: 'City_4',
            chunk: {
                mapname: 'map_5',
                chunkid: 1,
                connections: [
                    { from: 'City_0', to: 'City_1', dist: 1 },
                    { from: 'City_1', to: 'City_2', dist: 1 },
                    { from: 'City_1', to: 'City_4', dist: 5 },
                    { from: 'City_2', to: 'City_3', dist: 1 },
                ],
            },
        });

        call.write({
            start_endpoint: 'City_0',
            end_endpoint: 'City_4',
            chunk: {
                mapname: 'map_5',
                chunkid: 2,
                connections: [
                    { from: 'City_3', to: 'City_4', dist: 1 },
                    { from: 'City_0', to: 'City_3', dist: 1 },
                    { from: 'City_4', to: 'City_4', dist: 0 },
                ],
            },
        });

        call.end();
    });

    it('(stream) should return an error if no alt path exists', function (done) {
        const call = client.GetOptimalPathStream((error, response) => {
            try {
                expect(error).to.exist;
                expect(error.code).to.equal(grpc.status.NOT_FOUND);
                expect(error.message).to.include('No alt path found');
                expect(response).to.be.undefined;
                done();
            } catch (assertionError) {
                done(assertionError);
            }
        });

        // Send streaming chunks
        call.write({
            start_endpoint: 'City_0',
            end_endpoint: 'City_4',
            chunk: {
                mapname: 'map_5',
                chunkid: 1,
                connections: [
                    { from: 'City_0', to: 'City_1', dist: 1 },
                    { from: 'City_1', to: 'City_2', dist: 1 },
                    { from: 'City_2', to: 'City_3', dist: 1 },
                ],
            },
        });

        call.write({
            start_endpoint: 'City_0',
            end_endpoint: 'City_4',
            chunk: {
                mapname: 'map_5',
                chunkid: 2,
                connections: [
                    { from: 'City_3', to: 'City_4', dist: 1 },
                    { from: 'City_0', to: 'City_3', dist: 1 },
                    { from: 'City_4', to: 'City_4', dist: 0 },
                ],
            },
        });

        call.end();
    });

    it('(stream) should return an error if no path exists', function (done) {
        const call = client.GetOptimalPathStream((error, response) => {
            try {
                expect(error).to.exist;
                expect(error.code).to.equal(grpc.status.NOT_FOUND);
                expect(error.message).to.include('No path found');
                expect(response).to.be.undefined;
                done();
            } catch (assertionError) {
                done(assertionError);
            }
        });

        // Send streaming chunks with no valid path
        call.write({
            start_endpoint: 'City_0',
            end_endpoint: 'City_X', // Non-existent endpoint
            chunk: {
                mapname: 'map_5',
                chunkid: 1,
                connections: [
                    { from: 'City_0', to: 'City_1', dist: 1 },
                    { from: 'City_1', to: 'City_2', dist: 1 },
                ],
            },
        });

        call.end();
    });

    it('(stream) should return an error if required fields are missing', function (done) {
        const call = client.GetOptimalPathStream((error, response) => {
            try {
                expect(error).to.exist;
                expect(error.code).to.equal(grpc.status.INVALID_ARGUMENT);
                expect(error.message).to.include('Missing required fields');
                expect(response).to.be.undefined;
                done();
            } catch (assertionError) {
                done(assertionError);
            }
        });

        // Send chunks without required fields
        call.write({
            chunk: {
                mapname: 'map_5',
                chunkid: 1,
                connections: [{ from: 'City_0', to: 'City_1', dist: 1 }],
            },
        });

        call.end();
    });
});
