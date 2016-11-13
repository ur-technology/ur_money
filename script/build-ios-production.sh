#!/bin/bash

cp app/config/env.production.json app/config/env.json
ionic build ios
# finish the build in Xcode
