# ASOMIDDIN AI Android

Native Kotlin + Jetpack Compose starter for Android 8.0+ (API 26+).

## Build
Open the `android/` directory in Android Studio with JDK 17 and Android SDK 35 installed. Allow Gradle sync, then build the debug APK.

## Current scope
This is the first UI scaffold only. Voice provider, authenticated API client, push token registration, calendar integration and telephony provider are not yet connected. The app requests microphone and notification permissions at startup in this scaffold; before release, move each permission request behind the feature the user enables.
