#!/bin/bash

cp app/config/env.staging.json app/config/env.json

sed -i '' -e "s/UNKNOWN_TARGET_PLATFORM/ios/g" app/config/env.json

VERSION_NUMBER=`sed -n 's/.*version="\([^"]*\).*/\1/p' config.xml`
sed -i '' -e "s/UNKNOWN_VERSION_NUMBER/$VERSION_NUMBER/g" app/config/env.json

npm install
typings install
ionic build ios
# finish the build in Xcode
