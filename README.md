# ur_money

## Install global dependencies
```script
npm install -g ionic@beta, cordova, gulp
```

## Install local dependencies
```script
git clone git@github.com:urcapital/ur_money.git
cd ur_money
npm install
typings install # would like to put this back
```

## Run server
```script
ionic serve --v2
```

## Deploy to Ionic View
```script
ionic upload
```

## Deploy to Firebase Hosting
```script
gulp build
firebase deploy -f ur-money-staging
```

## Setup and run iOS
```script
npm run setup-ios
npm run ios
# Then: open project using Xcode from /platforms/ios/*****.xcproj
```
##Quirks

##ios
*whatsapp*
![image](iosWhatsappQuirks.png?raw=true "Whatapp quirks for Invite")


## Setup and run Android
```script
npm run setup-android
npm run android
```
