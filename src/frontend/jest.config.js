module.exports = {
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'jsx'],
    testEnvironment: 'jsdom',
    collectCoverage: true, // enable coverage collection
    coverageDirectory: 'coverage', // directory for coverage reports
    coverageReporters: ['lcov', 'text', 'cobertura'], // "cobertura" for GitLab integration
};
