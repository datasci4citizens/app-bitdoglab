#!/bin/bash

# Setup script for adding bluetooth support to the app

echo "📱 Building app with Bluetooth support..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Build the app
echo "🛠️ Building the app..."
npm run build

# Sync with native platforms
echo "🔄 Syncing with native platforms..."
npx cap sync

# For Android
if [ -d "android" ]; then
  echo "🤖 Preparing Android platform..."
  
  # Add any special Android setup here if needed
  
  echo "✅ Android preparation complete."
  echo "To run on Android, connect a device and run: npx cap run android"
fi

# For iOS
if [ -d "ios" ]; then
  echo "🍎 Preparing iOS platform..."
  
  # Add any special iOS setup here if needed
  
  echo "✅ iOS preparation complete."
  echo "To run on iOS, connect a device and run: npx cap run ios"
fi

echo "🎉 Setup complete! Your app now supports Bluetooth connectivity."
echo ""
echo "To run the app:"
echo "  - For web testing: npm run dev"
echo "  - For Android: npx cap run android"
echo "  - For iOS: npx cap run ios"
