#!/bin/bash

set -e

PLATFORM=$1
if [[ "$PLATFORM" != "android" && "$PLATFORM" != "ios" && "$PLATFORM" != "web" ]]; then
  PLATFORM="android"
fi
echo "PLATFORM=$PLATFORM"

UR_ENV=$2
if [[ "$UR_ENV" != "production" && "$UR_ENV" != "john" && "$UR_ENV" != "xavier" && "$UR_ENV" != "staging" ]]; then
  UR_ENV="staging"
fi
echo "UR_ENV=$UR_ENV"

cp app/config/env.$UR_ENV.json app/config/env.json

sed -i '' -e "s/UNKNOWN_TARGET_PLATFORM/${PLATFORM}/g" app/config/env.json

VERSION_NUMBER=`sed -n 's/.*version="\([^"]*\).*/\1/p' config.xml`
sed -i '' -e "s/UNKNOWN_VERSION_NUMBER/${VERSION_NUMBER}/g" app/config/env.json

if [[ "$PLATFORM" == "android" ]]; then
  if [[ "$UR_ENV" == "production" ]]; then
    if [[ `cordova plugin ls | grep cordova-plugin-console` = *[!\ ]* ]]; then
      echo "\$param contains characters other than space";
      cordova plugin rm cordova-plugin-console
    fi
  else
    cordova plugin add cordova-plugin-console
  fi
fi

npm install
typings install

if [[ "$PLATFORM" == "android" ]]; then
  if [[ "$UR_ENV" == "production" ]]; then
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
  else
    ionic build android
  fi

  # open https://www.diawi.com/
  open platforms/android/build/outputs/apk/  # file is named 'UR Money.apk'

elif [[ "$PLATFORM" == "ios" ]]; then
  ionic build ios
  echo "Please complete the build in XCode..."
else # web
  gulp build
  firebase deploy -P ur-money-${UR_ENV}
fi
