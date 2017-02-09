# UR Money

Mobile and web interface for UR.

## Install global dependencies (skip if already installed)
```script
npm install -g ionic@2.2.1
npm install -g cordova@6.5.0
npm install -g typings
```

## Install local dependencies
```script
git clone git@github.com:ur-technology/ur_money.git .
npm install
```

## Install typings
```script
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

## To run as a web server
```script
ionic serve -c
```

## Deploy to Firebase Hosting
```script
firebase deploy -f ur-money-staging
```
