/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '<rootDir>/harmony/.*/.cxx',
    '<rootDir>/harmony/.*/build',
    '<rootDir>/harmony/react_native_openharmony/src/main/cpp/third-party',
  ],
};
