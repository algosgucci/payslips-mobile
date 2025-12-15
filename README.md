# Payslips Mobile App

A React Native application for managing and viewing payslips with native file handling, sorting, and filtering capabilities.

## Tech Stack & Choices

### Framework
- **React Native CLI** (v0.83.0) - Chosen over Expo for better control over native modules, especially for file system operations and permissions handling.

### Core Technologies
- **TypeScript** - Type safety across the application
- **React Navigation** (`@react-navigation/native`, `@react-navigation/native-stack`) - Stack navigation for screen transitions
- **React Context API** - Lightweight state management for payslip data, sorting, and filtering

### Native Modules
- **react-native-fs** - Cross-platform file system operations (download, directory creation, file existence checks)
- **react-native-permissions** - Android runtime storage permissions
- **react-native-file-viewer** - Native file preview for PDFs and images
- **react-native-safe-area-context** - Safe area handling for iOS and Android
- **react-native-screens** - Native screen management for React Navigation

### Testing
- **Jest** - Unit and integration testing framework
- **React Native Testing Library** - Component testing utilities
- **@testing-library/jest-native** - Additional Jest matchers for React Native

### Code Quality
- **ESLint** - Linting with React Native configuration
- **Prettier** - Code formatting

## Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── PayslipCard.tsx
│   ├── SortButton.tsx
│   └── FilterInput.tsx
├── screens/            # Screen components
│   ├── PayslipListScreen.tsx
│   └── PayslipDetailsScreen.tsx
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── context/            # State management
│   └── PayslipContext.tsx
├── utils/              # Utility functions
│   ├── dateFormatter.ts
│   ├── fileHandler.ts
│   └── permissions.ts
├── data/               # Mock data
│   └── mockPayslips.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── theme/              # Theme configuration
    └── index.ts
```

### Key Architectural Decisions

1. **State Management**: React Context API chosen over Redux/Zustand for simplicity. The app's state needs are minimal (payslip list, sorting, filtering), making Context a lightweight and appropriate choice.

2. **File Handling**: Lazy loading of `react-native-fs` to avoid NativeEventEmitter initialization issues. Files are saved to platform-specific directories:
   - iOS: Documents folder (accessible via Files app)
   - Android: App-specific directory (works without permissions on Android 10+)

3. **Navigation**: Stack navigator for simple two-screen flow (List → Details). Type-safe navigation with TypeScript.

4. **Component Architecture**: 
   - Separation of concerns: screens, components, utilities, and context
   - Reusable components with consistent styling via theme
   - Accessibility support throughout

## Prerequisites

- **Node.js** >= 20
- **npm** or **yarn**
- **iOS Development** (macOS only):
  - Xcode (latest version)
  - CocoaPods: `sudo gem install cocoapods`
- **Android Development**:
  - Android Studio
  - Android SDK (API level 24+)
  - JDK 11 or higher

## Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only):
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Android Setup**:
   - Ensure Android SDK is configured
   - Set `ANDROID_HOME` environment variable (if not set automatically)
   - Gradle dependencies will download automatically on first build

## Running the App

### Start Metro Bundler
```bash
npm start
# or
npx react-native start
```

### iOS
```bash
npm run ios
# or
npx react-native run-ios
```

**Note**: For a specific simulator:
```bash
npx react-native run-ios --simulator="iPhone 15"
```

### Android
```bash
npm run android
# or
npx react-native run-android
```

**Note**: Ensure an Android emulator is running or a physical device is connected:
```bash
adb devices  # Check connected devices
```

## Testing

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

Run specific test file:
```bash
npm test -- src/utils/__tests__/dateFormatter.test.ts
```

### Test Coverage
- **Unit Tests**: Date formatting utilities (10 tests)
- **Integration Tests**: PayslipListScreen component (6 tests)
- **App Tests**: App rendering (1 test)
- **Total**: 17 tests across 3 test suites

## Features

### Core Functionality
- ✅ View payslip list with date ranges
- ✅ Sort payslips (Most Recent First / Oldest First)
- ✅ Filter by year
- ✅ Search payslips by date
- ✅ View payslip details
- ✅ Download payslips to device storage
- ✅ Preview payslips using native file viewer

### Platform-Specific Features
- **iOS**: Files saved to Documents folder, accessible via Files app
- **Android**: Files saved to app storage, with runtime permission handling for older Android versions

### Accessibility
- Screen reader support (accessibility labels and hints)
- Proper accessibility roles
- Keyboard navigation support

## Known Limitations

1. **Mock Data Only**: The app uses mock payslip data. In production, this would connect to a backend API.

2. **Placeholder Files**: Downloaded files are placeholder text files. In production, actual PDF/image assets would be bundled or fetched from a server.

3. **File Preview**: File preview functionality requires appropriate apps installed on the device. Some devices may not have default PDF/image viewers.

4. **Android Permissions**: On Android versions below 10 (API < 29), storage permissions are required. The app handles this, but users must grant permissions.

5. **No Offline Support**: The app doesn't cache payslip data. All data is in-memory from mock data.

## Future Improvements

Given more time, I would:

1. **Backend Integration**: Replace mock data with API calls to a real backend service
2. **Offline Support**: Implement data caching and offline-first architecture
3. **Real File Assets**: Bundle actual PDF/image files or implement file download from server
4. **Enhanced Filtering**: Add more filter options (by month, by file type, etc.)
5. **Pull to Refresh**: Add pull-to-refresh functionality for the payslip list
6. **Error Boundaries**: Add React error boundaries for better error handling
7. **Loading States**: Enhance loading indicators during file operations
8. **File Management**: Add ability to delete downloaded files, view download history
9. **Dark Mode**: Implement system theme detection and dark mode support
10. **E2E Testing**: Set up Detox or Maestro for end-to-end testing on devices

## Troubleshooting

### iOS Issues

**Pod install fails**:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

**Build errors**:
- Clean build folder in Xcode: Product > Clean Build Folder
- Reset Metro bundler: `npm start -- --reset-cache`

### Android Issues

**Gradle sync fails**:
- Check Android SDK path in `android/local.properties`
- Verify `ANDROID_HOME` environment variable

**Build errors**:
```bash
cd android
./gradlew clean
cd ..
```

**Missing build-tools**:
- Install via Android Studio: Tools → SDK Manager → SDK Tools → Android SDK Build-Tools 36.0.0

### General Issues

**Metro bundler issues**:
```bash
npm start -- --reset-cache
```

**Node modules issues**:
```bash
rm -rf node_modules
npm install
```

**NativeEventEmitter errors**:
- Ensure `react-native-fs` is properly linked: `cd ios && pod install`
- The app uses lazy loading to avoid initialization issues

## License

[Add license information if applicable]
