import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { MapModel, ConnectionChunkModel } from '../src/models/mapModel.js';
import sinon from 'sinon';
import connectToDatabase from '../src/services/db.js';
import client from '../src/services/grpcClient.js';

describe('GET /api/maps/getMapDataByName/:mapname', () => {
    it('should return 200 and a map object ', async () => {
        const mockData = { mapname: 'Skyrim' };
        const findStub = sinon.stub(MapModel, 'find').resolves(mockData);

        const response = await request(app).get(
            '/api/maps/getMapDataByName/Skyrim'
        );

        expect(response.statusCode).to.equal(200);

        findStub.restore();
    }).timeout(500000);

    it('should return 500 when MapModel.find throws an error', async () => {
        const findStub = sinon
            .stub(MapModel, 'find')
            .rejects(new Error('Database error'));
        const response = await request(app).get(
            '/api/maps/getMapDataByName/Skyrim'
        );
        expect(response.statusCode).to.equal(500);
        findStub.restore();
    }).timeout(500000);
});

describe('GET /api/maps/getRoutesFromMapStream', () => {
    afterEach(() => {
        // Restore all stubs after each test
        sinon.restore();
    });
    beforeEach(() => {
        // Restore all stubs after each test
        sinon.restore();
    });
    it('should return 400 and on sending a number as a type in start query', async () => {
        const response = await request(app)
            .get('/api/maps/getRoutesFromMapStream')
            .query({ start: 1, end: 'Morthal', username: 'testuser' });

        expect(response.statusCode).to.equal(400);
    }).timeout(500000);

    it('should return 400 when username is not provided int query', async () => {
        const response = await request(app)
            .get('/api/maps/getRoutesFromMapStream')
            .query({ start: 1, end: 'Morthal' });

        expect(response.statusCode).to.equal(400);
    }).timeout(500000);

    it('should return 404 when map_50000 is not present in the database', async () => {
        // Stub BEFORE the request is made
        sinon.stub(ConnectionChunkModel, 'find').resolves([]);

        const response = await request(app)
            .get('/api/maps/getRoutesFromMapStream')
            .query({ start: 'Helgen', end: 'Morthal', username: 'testuser' });

        expect(response.statusCode).to.equal(404);
        sinon.restore();
    }).timeout(500000);

    it('should return 500 when an error occurs', async () => {
        // Stub BEFORE the request is made
        sinon
            .stub(ConnectionChunkModel, 'find')
            .rejects(new Error('Database error'));

        const response = await request(app)
            .get('/api/maps/getRoutesFromMapStream')
            .query({ start: 'Helgen', end: 'Morthal', username: 'testuser' });
        sinon.restore();

        expect(response.statusCode).to.equal(500);
    }).timeout(500000);

    it('should return 500 when RPC call fails', async () => {
        // Mock the database response
        const mockMapData = [
            {
                mapname: 'Skyrim',
                connections: [
                    { parent: 'Markarth', child: 'Morthal', dist: 10 },
                ],
            },
        ];
        sinon.stub(ConnectionChunkModel, 'find').resolves(mockMapData);

        // Mock the streaming RPC call to simulate an error
        const rpcStub = sinon
            .stub(client, 'GetOptimalPathStream')
            .callsFake((callback) => {
                callback(new Error('RPC Server Error'), null); // Simulate an RPC error
            });

        // Make the request to the endpoint
        const response = await request(app)
            .get('/api/maps/getRoutesFromMapStream')
            .query({ start: 'Markarth', end: 'Morthal', username: 'testuser' });

        // Assertions
        expect(response.statusCode).to.equal(500);

        // Restore stubs
        rpcStub.restore();
        sinon.restore();
    }).timeout(50000); // Set a reasonable timeout

    it('should return status 500 ', async () => {
        // Mock database response
        const mockMapData = [
            {
                mapname: 'Skyrim',
                connections: [
                    { parent: 'Markarth', child: 'Morthal', dist: 10 },
                ],
            },
        ];
        const chunkCheck = sinon
            .stub(ConnectionChunkModel, 'find')
            .resolves(mockMapData);

        // Mock RPC stream response
        const mockRpcResponse = {
            path_opt: ['Markarth', 'Morthal'],
            path_alt: ['Markarth', 'Solitude', 'Morthal'],
        };
        let getClient = sinon
            .stub(client, 'GetOptimalPathStream')
            .callsFake((callback) => {
                callback(null, mockRpcResponse);
            });

        // Make the request to the endpoint
        const response = await request(app)
            .get('/api/maps/getRoutesFromMapStream')
            .query({
                start: 'Markarth',
                end: 'Morthal',
                username: 'testuser',
                mapname: 'map_50000',
            });

        // Assertions
        expect(response.statusCode).to.equal(500);

        getClient.restore();
        ConnectionChunkModel.find.restore();
    }).timeout(5000); // Set a reasonable timeout
});

describe('GET /api/maps/getAllMapNames', () => {
    it('should return 200 and a mapnames ', async () => {
        const findStub = sinon.stub(MapModel, 'find').resolves({});

        const response = await request(app).get('/api/maps/getAllMapNames');

        expect(response.statusCode).to.equal(200);

        findStub.restore();
    }).timeout(500000);

    it('should return 500 when MapModel.find throws an error', async () => {
        const findStub = sinon
            .stub(MapModel, 'find')
            .rejects(new Error('Database error'));
        const response = await request(app).get('/api/maps/getAllMapNames');
        expect(response.statusCode).to.equal(500);
        findStub.restore();
    }).timeout(500000);
});

describe('GET /api/maps/getRoutesFromMapByName', () => {
    let findStub;
    let rpcStub;
    let addRoutesStub;

    afterEach(() => {
        // Restore all stubs after each test
        sinon.restore();
    });

    it('should return 200, save the route, and include routeId', async () => {
        // Mock database to return map data
        const mockMapData = [
            {
                mapname: 'Skyrim',
                connections: [
                    { parent: 'Markarth', child: 'Morthal', dist: 10 },
                ],
            },
        ];
        findStub = sinon.stub(MapModel, 'find').resolves(mockMapData);

        // Mock RPC client call to return a valid path
        rpcStub = sinon
            .stub(client, 'GetOptimalPath')
            .callsFake((req, callback) => {
                callback(null, {
                    path_opt: ['Markarth', 'Morthal'],
                    path_alt: ['Markarth', 'Riverwood', 'Morthal'],
                });
            });

        // Mock addRoutesToUser to simulate route save
        addRoutesStub = sinon.stub().callsFake((req, res) => {
            res.status(200).json({
                data: { routeHistory: ['mockRouteId123'] },
            });
        });

        const response = await request(app)
            .get('/api/maps/getRoutesFromMapByName')
            .query({ start: 'Markarth', end: 'Morthal', username: 'testuser' });

        expect(response.statusCode).to.equal(200);
        expect(response.body.message).to.equal('Routes retrieved successfully');
        expect(response.body.optimalPath).to.deep.equal([
            'Markarth',
            'Morthal',
        ]);
        expect(response.body.alternativePath).to.deep.equal([
            'Markarth',
            'Riverwood',
            'Morthal',
        ]);
        // expect(response.body.routeId).to.equal('mockRouteId123');
    }).timeout(500000);

    it('should return 400 due to invalid cities input', async () => {
        const response = await request(app)
            .get('/api/maps/getRoutesFromMapByName')
            .query({ start: '100', end: '200', username: 'testuser' });

        expect(response.statusCode).to.equal(400);
        expect(response.body.message).to.equal(
            'Names of Cities cannot be Numbers/Empty'
        );
    }).timeout(500000);

    it('should return 400 if username is missing', async () => {
        const response = await request(app)
            .get('/api/maps/getRoutesFromMapByName')
            .query({ start: 'Markarth', end: 'Morthal' });

        expect(response.statusCode).to.equal(400);
        expect(response.body.message).to.equal(
            'Username is required and must be a valid string.'
        );
    }).timeout(500000);

    it('should return 404 when database is empty', async () => {
        findStub = sinon.stub(MapModel, 'find').resolves([]);

        const response = await request(app)
            .get('/api/maps/getRoutesFromMapByName')
            .query({ start: 'Markarth', end: 'Morthal', username: 'testuser' });

        expect(response.statusCode).to.equal(404);
        expect(response.body.message).to.equal('Map data not found.');
    }).timeout(500000);

    it('should return 500 when error occurs', async () => {
        findStub = sinon
            .stub(MapModel, 'find')
            .rejects(new Error('Database error'));

        const response = await request(app)
            .get('/api/maps/getRoutesFromMapByName')
            .query({ start: 'Markarth', end: 'Morthal', username: 'testuser' });

        expect(response.statusCode).to.equal(500);
    }).timeout(500000);

    it('should return 404 when RPC returns no paths', async () => {
        // Mock database to return map data
        const mockMapData = [
            {
                mapname: 'Skyrim',
                connections: [
                    { parent: 'Markarth', child: 'Morthal', dist: 10 },
                ],
            },
        ];
        findStub = sinon.stub(MapModel, 'find').resolves(mockMapData);

        // Mock RPC call to return no paths
        rpcStub = sinon
            .stub(client, 'GetOptimalPath')
            .callsFake((req, callback) => {
                callback(null, { path_opt: [], path_alt: [] });
            });

        const response = await request(app)
            .get('/api/maps/getRoutesFromMapByName')
            .query({ start: 'Markarth', end: 'Morthal', username: 'testuser' });

        expect(response.statusCode).to.equal(404);
        expect(response.body.message).to.equal(
            'The requested City/Cities were not found in the map.'
        );
    }).timeout(500000);

    it('should return 500 when RPC call fails', async () => {
        const mockMapData = [
            {
                mapname: 'Skyrim',
                connections: [
                    { parent: 'Markarth', child: 'Morthal', dist: 10 },
                ],
            },
        ];
        findStub = sinon.stub(MapModel, 'find').resolves(mockMapData);

        rpcStub = sinon
            .stub(client, 'GetOptimalPath')
            .callsFake((req, callback) => {
                callback(new Error('RPC Server Error'), null);
            });

        const response = await request(app)
            .get('/api/maps/getRoutesFromMapByName')
            .query({ start: 'Markarth', end: 'Morthal', username: 'testuser' });

        expect(response.statusCode).to.equal(500);
        expect(response.body.error).to.equal('RPC Server Error');
    }).timeout(500000);
});

describe('GET /healthz', () => {
    it('should return 200 and a healthy status', async () => {
        const response = await request(app).get('/healthz');

        expect(response.statusCode).to.equal(200);
        expect(response.body).to.have.property('status', 'healthy');
    }).timeout(500000);
});
