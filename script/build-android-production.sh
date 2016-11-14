#!/bin/bash

set -e
cp app/config/env.production.json app/config/env.json
cordova plugin rm cordova-plugin-console
npm install
typings install
ionic build --release android

read -s -p "Type passphrase for keystore: " PASSPHRASE
echo ""
echo $PASSPHRASE
# keytool -genkey -v -keystore ur-money-google-play-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
UNSIGNED_APK_FILE="platforms/android/build/outputs/apk/android-release-unsigned.apk"
jarsigner -storepass "$PASSPHRASE" -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ur-money-google-play-release-key.keystore $UNSIGNED_APK_FILE alias_name
SIGNED_APK_FILE="platforms/android/build/outputs/apk/UR Money.apk"
rm -f "$SIGNED_APK_FILE"
zipalign -v 4 "$UNSIGNED_APK_FILE" "$SIGNED_APK_FILE"

# open https://www.diawi.com/
open platforms/android/build/outputs/apk/  # file is named 'UR Money.apk'
