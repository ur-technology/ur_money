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

if [[ "$3" == "deploy" ]]; then
  DEPLOY="true"
else
  DEPLOY="false"
fi
echo "DEPLOY=$DEPLOY"

cp src/config/config.$UR_ENV.ts src/config/config.ts

sed -i '' -e "s/UNKNOWN_TARGET_PLATFORM/${PLATFORM}/g" src/config/config.ts

VERSION_NUMBER=`grep widget config.xml | sed -n 's/.*version="\([^"]*\).*/\1/p'`
sed -i '' -e "s/UNKNOWN_VERSION_NUMBER/${VERSION_NUMBER}/g" src/config/config.ts

if [[ "$PLATFORM" == "android" ]]; then
  if [[ "$UR_ENV" == "production" ]]; then
    if [[ `cordova plugin ls | grep cordova-plugin-console` = *[!\ ]* ]]; then
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

elif [[ "$PLATFORM" == "web" ]]; then

  if [[ "$DEPLOY" == "true" ]]; then
    echo "building and deploying to firebase"
    # ionic build
    sed -e $'s/<\/head>/  <base href="\/">\\\n<\/head>/' www/index.html > www/index.web.html
    firebase deploy -P ur-money-${UR_ENV}
  fi

fi
