module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
  moduleNameMapper: {
    '^react-native-fs$': '<rootDir>/__mocks__/react-native-fs.js',
    '^react-native-permissions$': '<rootDir>/__mocks__/react-native-permissions.js',
    '^react-native-file-viewer$': '<rootDir>/__mocks__/react-native-file-viewer.js',
  },
};
