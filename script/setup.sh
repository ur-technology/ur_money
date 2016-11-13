#!/bin/bash

npm install
typings install
cp app/config/env.staging.json app/config/env.json
cordova platform add https://github.com/apache/cordova-android.git#master
cordova platform add ios
ionic state restore
