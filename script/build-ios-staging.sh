#!/bin/bash

cp app/config/env.staging.json app/config/env.json
npm install
typings install
ionic build ios
# finish the build in Xcode
