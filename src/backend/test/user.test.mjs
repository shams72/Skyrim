import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import userModel from '../src/models/userModel.js';
import routeModel from '../src/models/routeModel.js';
import mongoose from 'mongoose';
import connectToDatabase from '../src/services/db.js';
import sinon from 'sinon';

describe('POST /api/users/addRoutesToUser', function () {
    before(async function () {
        await connectToDatabase();
    });

    after(async function () {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    it('should return 200 status for succesfull name entry', async function () {
        const response = await request(app)
            .post('/api/users/createUser')
            .send({ name: 'Max' });

        // Assertions
        expect(response.statusCode).to.equal(200);
    }).timeout(500000);

    it('should return 409 status if same name found', async function () {
        const saveStub = sinon
            .stub(userModel.prototype, 'save')
            .resolves({ name: 'Max' });

        const response = await request(app)
            .post('/api/users/createUser')
            .send({ name: 'Max' });

        // Assertions
        expect(response.statusCode).to.equal(409);
        saveStub.restore();
    }).timeout(500000);

    it('should return 500 if an error occurs during save', async function () {
        // Stub the save method to simulate a database error
        const saveStub = sinon
            .stub(userModel.prototype, 'save')
            .rejects(new Error('Database error'));

        // Send a request to the endpoint
        const response = await request(app).post('/api/users/createUser');

        expect(response.statusCode).to.equal(500);

        // Restore the stub to clean up
        saveStub.restore();
    }).timeout(500000);
});

describe('POST /api/users/createUser', function () {
    before(async function () {
        await connectToDatabase();
    });

    after(async function () {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    it('should return 409 status for similar name entry', async function () {
        const userFindStub = sinon.stub(userModel, 'findOne').resolves({});

        const response = await request(app).post('/api/users/createUser').send({
            name: 'max',
        });

        // Assertions
        expect(response.statusCode).to.equal(409);
        userFindStub.restore();
    }).timeout(500000);

    it('should return 200 status for successfull name entry', async function () {
        const userFindStub = sinon.stub(userModel, 'findOne').resolves(null);

        const response = await request(app).post('/api/users/createUser').send({
            name: 'max',
        });

        // Assertions
        expect(response.statusCode).to.equal(200);
        userFindStub.restore();
    }).timeout(500000);

    it('should return 500 status for error', async function () {
        const userFindStub = sinon
            .stub(userModel, 'findOne')
            .rejects(new Error('There was an error'));

        const response = await request(app).post('/api/users/createUser').send({
            name: 'max',
        });

        // Assertions
        expect(response.statusCode).to.equal(500);
        userFindStub.restore();
    }).timeout(500000);
});

describe('POST /api/users/login', function () {
    it('should return 200 status for similar name entry', async function () {
        const userFindStub = sinon.stub(userModel, 'findOne').resolves(null);

        const response = await request(app).post('/api/users/login').send({
            name: 'max',
        });

        // Assertions
        expect(response.statusCode).to.equal(404);
        userFindStub.restore();
    }).timeout(500000);

    it('should return 200 status for successfull name entry', async function () {
        const userFindStub = sinon.stub(userModel, 'findOne').resolves({});

        const response = await request(app).post('/api/users/login').send({
            name: 'max',
        });

        // Assertions
        expect(response.statusCode).to.equal(200);
        userFindStub.restore();
    }).timeout(500000);

    it('should return 500 status for error', async function () {
        const userFindStub = sinon
            .stub(userModel, 'findOne')
            .rejects(new Error('There was an error'));

        const response = await request(app).post('/api/users/login').send({
            name: 'max',
        });

        // Assertions
        expect(response.statusCode).to.equal(500);
        userFindStub.restore();
    }).timeout(500000);
});

describe('PUT /api/users/addRoutesToUser', function () {
    before(async function () {
        await connectToDatabase();
    });

    beforeEach(async function () {
        sinon.restore();
    });
    afterEach(async function () {
        sinon.restore();
    });

    after(async function () {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    it('should return 200 status for route entry', async function () {
        // Create stubs
        const routeSaveStub = sinon
            .stub(routeModel.prototype, 'save')
            .resolves({
                _id: 'mockRouteId',
            });

        const mockUser = {
            name: 'max',
            routeHistory: [],
            save: sinon.stub().resolves(),
        };

        const userFindStub = sinon
            .stub(userModel, 'findOne')
            .resolves(mockUser);

        const response = await request(app)
            .put('/api/users/addRoutesToUser')
            .send({
                name: 'max',
                optimalPath: ['A', 'B', 'C'],
                alternativePath: ['D', 'E', 'F'],
                mapname: 'Skyrim',
            });

        // Assertions
        expect(response.statusCode).to.equal(200);

        // Cleanup
        routeSaveStub.restore();
        userFindStub.restore();
    });

    // Adjust timeout based on the operation duration
    it('should return 500 if an error occurs during find', async function () {
        // Stub the save method to simulate a database error
        const saveStub = sinon
            .stub(userModel, 'find')
            .rejects(new Error('Database error'));

        // Send a request to the endpoint
        const response = await request(app).put('/api/users/addRoutesToUser');

        expect(response.statusCode).to.equal(500);

        // Restore the stub to clean up
        saveStub.restore();
    }).timeout(500000);
});

describe('DELETE /api/users/deleteSpecificRoute', function () {
    before(async function () {
        await connectToDatabase();
    });

    after(async function () {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    beforeEach(() => {
        sinon.restore();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should delete a specific route successfully', async function () {
        sinon.stub(userModel, 'findOne').resolves({
            name: 'John',
            routeHistory: ['routeId1'],
            save: sinon.stub().resolves(),
        });

        const response = await request(app)
            .delete('/api/users/deleteSpecificRoute')
            .send({ name: 'John', routeId: 'routeId1' });

        expect(response.statusCode).to.equal(200);
        expect(response.body.message).to.equal('Route deleted successfully.');
        expect(response.body.data).to.not.include('routeId1');
    }).timeout(500000);

    it('should return 400 on missing routeId field', async function () {
        sinon.stub(userModel, 'findOne').resolves({
            name: 'John',
            routeHistory: ['routeId1'],
            save: sinon.stub().resolves(),
        });

        const response = await request(app)
            .delete('/api/users/deleteSpecificRoute')
            .send({ name: 'John' });

        expect(response.statusCode).to.equal(400);
    }).timeout(500000);

    it('should return 404 if the user is not found', async function () {
        sinon.stub(userModel, 'findOne').resolves(null);

        const response = await request(app)
            .delete('/api/users/deleteSpecificRoute')
            .send({ name: 'UnknownUser', routeId: 'routeId1' });

        expect(response.statusCode).to.equal(404);
    }).timeout(500000);

    it('should return 404 if the route is not found in user history', async function () {
        // Mock user with routeHistory NOT containing 'routeId1'
        const mockUser = {
            name: 'TestUser',
            routeID: ['routeId2'], // No 'routeId1'
        };

        sinon.stub(mockUser.routeID, 'findIndex').returns(-1);

        const response = await request(app)
            .delete('/api/users/deleteSpecificRoute')
            .send({ name: 'TestUser', routeId: 'routeId1' });

        // Assertions
        expect(response.statusCode).to.equal(404);
    }).timeout(500000);

    it('should return 500 if throw an error5', async function () {
        sinon.stub(userModel, 'findOne').resolves(new Error('Error'));

        const response = await request(app)
            .delete('/api/users/deleteSpecificRoute')
            .send({ name: 'UnknownUser', routeId: 'routeId1' });

        expect(response.statusCode).to.equal(500);
    }).timeout(500000);
});

describe('DELETE /api/users/deleteAllRoutes', function () {
    before(async function () {
        await connectToDatabase();
    });

    after(async function () {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should delete all routes successfully', async function () {
        sinon.stub(userModel, 'findOne').resolves({
            name: 'John',
            routeHistory: ['routeId1', 'routeId2'],
            save: sinon.stub().resolves(),
        });

        const response = await request(app)
            .delete('/api/users/deleteAllRoutes')
            .send({ name: 'John' });

        expect(response.statusCode).to.equal(200);
        expect(response.body.message).to.equal(
            'All routes deleted successfully.'
        );
    }).timeout(500000);

    it('should not delete all routes due to mising existence of user', async function () {
        sinon.stub(userModel, 'findOne').resolves(null);

        const response = await request(app)
            .delete('/api/users/deleteAllRoutes')
            .send({ name: 'John' });

        expect(response.statusCode).to.equal(404);
    }).timeout(500000);

    it('should return 500 on an error', async function () {
        sinon.stub(userModel, 'findOne').resolves(new Error('Error'));

        const response = await request(app)
            .delete('/api/users/deleteAllRoutes')
            .send({ name: 'John' });

        expect(response.statusCode).to.equal(500);
    }).timeout(5000000);
});

describe('GET /api/users/searchRoutes', function () {
    before(async function () {
        await connectToDatabase();
    });

    after(async function () {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return matching routes', async function () {
        // Create a mock query object
        const query = {
            populate: sinon.stub().returnsThis(),
            then: function (resolve, reject) {
                // The final doc returned by the query
                resolve({
                    name: 'John',
                    routeHistory: [
                        {
                            optimalPath: ['home', 'market', 'office'],
                            _id: 'routeId1',
                        },
                        { optimalPath: ['station', 'mall'], _id: 'routeId2' },
                    ],
                });
            },
        };

        // Stub findOne to return the query object
        sinon.stub(userModel, 'findOne').returns(query);

        const response = await request(app)
            .get('/api/users/searchRoutes')
            .query({ name: 'John', search: 'market' });

        expect(response.statusCode).to.equal(200);
        expect(response.body.data).to.have.length(1);
        expect(response.body.data[0].optimalPath).to.include('market');
    }).timeout(500000);

    it('should return 500 for an error', async function () {
        sinon.stub(userModel, 'findOne').returns(new Error('Error'));

        const response = await request(app)
            .get('/api/users/searchRoutes')
            .query({ name: 'UnknownUser', search: 'market' });

        expect(response.statusCode).to.equal(500);
    }).timeout(500000);

    it('should return 404 if user is not found', async function () {
        const query = {
            populate: sinon.stub().returnsThis(),
            then: function (resolve, reject) {
                // Resolve with null to simulate no user found
                resolve(null);
            },
        };
        sinon.stub(userModel, 'findOne').returns(query);

        const response = await request(app)
            .get('/api/users/searchRoutes')
            .query({ name: 'UnknownUser', search: 'market' });

        expect(response.statusCode).to.equal(404);
        expect(response.body.message).to.equal('User not found.');
    }).timeout(500000);
});

describe('GET /api/users/sortRoutes', function () {
    before(async function () {
        await connectToDatabase();
    });

    after(async function () {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should sort routes by start location', async function () {
        // Mock the Mongoose query
        const query = {
            populate: sinon.stub().returnsThis(),
            then: function (resolve) {
                resolve({
                    name: 'John',
                    routeHistory: [
                        { optimalPath: ['office', 'market'], _id: 'routeId1' },
                        { optimalPath: ['home', 'mall'], _id: 'routeId2' },
                    ],
                });
            },
        };

        sinon.stub(userModel, 'findOne').returns(query);

        const response = await request(app)
            .get('/api/users/sortRoutes')
            .query({ name: 'John', sortBy: 'start' });

        expect(response.statusCode).to.equal(200);
        // After sorting by start, 'home' (from the second route) should come before 'office'
        expect(response.body.data[0].optimalPath[0]).to.equal('home');
    }).timeout(5000000);

    it('should return 500 on an error', async function () {
        // Mock the Mongoose query

        sinon.stub(userModel, 'findOne').rejects(new Error('Error'));

        const response = await request(app)
            .get('/api/users/sortRoutes')
            .query({ name: 'John', sortBy: 'start' });

        expect(response.statusCode).to.equal(500);
    }).timeout(5000000);
});

describe('POST /api/users/handleNavReply', function () {
    before(async function () {
        await connectToDatabase();
    });

    after(async function () {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return 500 on an error', async function () {
        // Stubbing routeModel.create to reject with an error
        sinon.stub(userModel, 'findOne').rejects(new Error('Error'));

        const response = await request(app)
            .post('/api/users/handleNavReply')
            .send({
                name: 'John',
                start_endpoint: 'home',
                end_endpoint: 'office',
                path: ['home', 'market', 'office'],
            });

        // Assertions
        expect(response.statusCode).to.equal(500);
    }).timeout(5000); // Reasonable timeout of 5 seconds

    it('should return 404 when user does not exist', async function () {
        // Stubbing userModel.findOne to return null (user not found)
        const findOneStub = sinon.stub(userModel, 'findOne').resolves(null);

        const response = await request(app)
            .post('/api/users/handleNavReply')
            .send({
                name: 'John',
                start_endpoint: 'home',
                end_endpoint: 'office',
                path: ['home', 'market', 'office'],
            });

        // Assertions
        expect(response.statusCode).to.equal(404);

        // Restore the stub
        findOneStub.restore();
    }).timeout(5000); // Reasonable timeout of 5 seconds

    it('should save a route and forward results', async function () {
        sinon.stub(userModel, 'findOne').resolves({
            name: 'John',
            routeHistory: [],
            save: sinon.stub().resolves(),
        });

        sinon.stub(routeModel, 'create').resolves({
            optimalPath: ['home', 'market', 'office'],
            _id: 'newRouteId',
            date: new Date(),
        });

        const response = await request(app)
            .post('/api/users/handleNavReply')
            .send({
                name: 'John',
                start_endpoint: 'home',
                end_endpoint: 'office',
                path: ['home', 'market', 'office'],
            });

        expect(response.statusCode).to.equal(200);
        expect(response.body.savedRoute.optimalPath).to.include('market');
    }).timeout(5000000);
});
