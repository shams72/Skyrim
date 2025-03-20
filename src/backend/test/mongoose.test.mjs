import mongoose from 'mongoose';
import { MapModel } from '../src/models/mapModel.js';
import connectToDatabase from '../src/services/db.js';
import { expect } from 'chai';
import { fetchDataFromApi } from '../src/services/mapService.js';
import sinon from 'sinon';

describe('Map Model Tests', function () {
    before(async function () {
        await connectToDatabase();
        await MapModel.deleteMany({});
    });

    after(async function () {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    it('should return an error if the API fails', async function () {
        // Mock the API failure scenario (you can use a package like `sinon` to mock the fetch request)
        const originalFetch = global.fetch;
        global.fetch = () => Promise.reject(new Error('API is down'));

        const result = await fetchDataFromApi();

        expect(result).to.be.an('error');
        expect(result.message).to.equal('API is down');

        // Restore the original fetch
        global.fetch = originalFetch;
    }).timeout(500000);

    it('should return an error if saving to the database fails', async function () {
        // Stub API response
        sinon.stub(global, 'fetch').resolves({
            json: async () => ({ mapname: 'Skyrim' }), // Mock successful API response
        });

        const saveStub = sinon
            .stub(MapModel.prototype, 'save')
            .rejects(new Error('Database error'));

        const result = await fetchDataFromApi();

        // Assertions
        expect(result).to.be.an('error');
        expect(result.message).to.equal('Database error');

        // Restore stubs

        global.fetch.restore();
        saveStub.restore();
    }).timeout(500000);

    it('should simulate fetchDataFromAPI using mock', async function () {
        // Mock the API response
        sinon.stub(global, 'fetch').resolves({
            json: async () => ({ mapname: 'Skyrim' }),
        });

        const findOneStub = sinon.stub(MapModel, 'findOne').resolves(null);

        const saveStub = sinon
            .stub(MapModel.prototype, 'save')
            .resolves({ mapname: 'Skyrim' });

        const savedMap = await fetchDataFromApi();

        expect(savedMap).to.not.be.null;
        expect(savedMap.mapname).to.equal('Skyrim');

        // Restore stubs
        global.fetch.restore();
        findOneStub.restore();
        //deleteOneStub.restore();
        saveStub.restore();
    }).timeout(500000);

    it('should refuse to save if map exists', async function () {
        // Mock the API response
        const mockApiResponse = { mapname: 'Skyrim' };
        sinon.stub(global, 'fetch').resolves({
            json: async () => mockApiResponse,
        });

        // Mock the database to return an existing map entry
        const existingMapEntry = { mapname: 'Skyrim' };
        sinon.stub(MapModel, 'findOne').resolves(existingMapEntry);

        // Call the function
        const result = await fetchDataFromApi();

        expect(result).to.be.undefined; // The function should return nothing if the map exists

        global.fetch.restore();
        MapModel.findOne.restore();
    }).timeout(5000);
});
