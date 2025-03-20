module.exports = {
    testEnvironment: 'node',
    env: {
        mocha: true,
    },
    roots: ['./tests'],
    collectCoverage: true, // enable coverage collection
    coverageDirectory: 'coverage', // directory for coverage reports
    coverageReporters: ['lcov', 'text', 'cobertura'], // "cobertura" for GitLab integration
};
