#!/bin/bash

set -e
cp app/config/env.staging.json app/config/env.json
cordova plugin add cordova-plugin-console
ionic build android
# open https://www.diawi.com/
open platforms/android/build/outputs/apk/  # file is named 'android-debug.apk'
