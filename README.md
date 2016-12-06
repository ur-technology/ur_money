# ur_money

## Install global dependencies (skip if already installed)
```script
npm install -g ionic@2.0.0-beta.37
npm install -g cordova@6.3.1
npm install -g gulp, typings
```

## Install local dependencies
```script
git clone git@github.com:ur-technology/ur_money.git
cd ur_money
npm install
typings install
```

## Install ionic platforms and cordova plugins
* First, install required dev tools (Xcode for iOS, Android SDK for Android)
* Next, run: `ionic state restore`

## Create environment configuaration file
* Run `cp app/config/env.staging.json app/config/env.json`
* Edit app/config/env.json to change or add configuration values

## Run on device
* Run `ionic run android -c -l` or `ionic run ios -c -l`
* If you have a problem running the app, check out these platform-specific instructions:
* [installation-android.md](doc/installation-android.md)
* [installation-ios.md](doc/installation-ios.md)

## To reload all plugins
``` script
gulp plugins
```

## To run as a web server
```script
ionic serve -c
```

## Deploy to Firebase Hosting
```script
gulp build
firebase deploy -f ur-money-staging
```
