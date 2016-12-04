#!/bin/bash

set -e
cp app/config/env.staging.json app/config/env.json

sed -i '' -e "s/UNKNOWN_TARGET_PLATFORM/android/g" app/config/env.json

VERSION_NUMBER=`sed -n 's/.*version="\([^"]*\).*/\1/p' config.xml`
sed -i '' -e "s/UNKNOWN_VERSION_NUMBER/$VERSION_NUMBER/g" app/config/env.json

cordova plugin add cordova-plugin-console
npm install
typings install


ionic build android
# open https://www.diawi.com/
open platforms/android/build/outputs/apk/  # file is named 'android-debug.apk'
