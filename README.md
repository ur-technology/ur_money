# ur_money

## Install global dependencies (skip if already installed)
* Check if you have the supported version of ionic framework
* Run `ionic info`
* It should show `Ionic Framework Version: 2.0.0-rc.5`
* If you see a number below `2.0.0-rc.5` then first uninstall that old version using `npm uninstall -g ionic`

* Continue with the installation

```script
npm install -g ionic
npm install -g cordova@6.3.1
```

## Install code and npm packages
```script
git clone git@github.com:ur-technology/ur_money.git
cd ur_money
npm install
```

## Create environment configuaration file
* Run `cp src/config/config.staging.ts src/config/config.ts`
* Edit `src/config/config.ts` to change or add configuration values

## Install ionic platforms and cordova plugins
* First, install required dev tools (Xcode for iOS, Android SDK for Android)
* Next, run: `ionic state restore`

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
gulp build
firebase deploy -f ur-money-staging
```
