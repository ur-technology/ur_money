#!/bin/bash

cp app/config/env.staging.json app/config/env.json
ionic build ios
# finish the build in Xcode
