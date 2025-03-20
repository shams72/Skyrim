import sinon from 'sinon';
import { expect } from 'chai';
import mongoose from 'mongoose';
import connectToDatabase from '../src/services/db.js';

describe('connectToDatabase', function () {
    let connectStub;

    beforeEach(() => {
        // Stub the mongoose.connect method
        connectStub = sinon.stub(mongoose, 'connect');
    });

    afterEach(() => {
        // Restore the stubbed method
        connectStub.restore();
    });

    it('should return false when MongoDB connection fails', async function () {
        connectStub.rejects(new Error('Connection failed')); // Simulate a connection error
        const result = await connectToDatabase();
        expect(result).to.be.false; // Expect the function to return false
        expect(connectStub.calledOnce).to.be.true; // Ensure mongoose.connect was called
    }).timeout(500000);
});
