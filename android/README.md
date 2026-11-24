# ASOMIDDIN AI Android

Native Kotlin + Jetpack Compose starter for Android 8.0+ (API 26+).

## Build
Open the `android/` directory in Android Studio with JDK 17 and Android SDK 35 installed. Allow Gradle sync, then build the debug APK.

## Current scope
This is the first UI scaffold only. Voice provider, authenticated API client, push token registration, calendar integration and telephony provider are not yet connected. The manifest declares microphone and notification permissions, but the starter UI does not request them at startup. Add contextual runtime permission requests only when the user enables recording or notifications. No APK build or HONOR X5c device test has yet been verified.
