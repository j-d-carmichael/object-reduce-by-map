module.exports = {
  moduleFileExtensions: [
    'js',
    'jsx',
    'json'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**',
  ],
  coverageDirectory: 'coverage',

  transformIgnorePatterns: [
    '/node_modules/',
    '/build/'
  ],

  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
  ],

  testEnvironment: 'node',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
