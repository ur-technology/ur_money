# ur_money

## Install global dependencies (skip if already installed)
```script
npm install -g ionic@beta, cordova, gulp
```

## Install local dependencies (download/get the code from git)
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

# Restore IONIC state 
* This will add the platforms and plugins by using the entries in package.json
* Please make sure you have enviroment dependencies(xcode for iOS, Android SDK for Android) already installed otherwise this will not work

```script
ionic state restore
```
## If above works well no issue then you can check the files mentioned below according to your platform
* installation-Readme-ios.md 
* installation-Readme-android.md

## If there is issue or you have only ios or android platform dependencies then you can do following:

 * iOS Platform setup intial.
* **Note:** Only if you dont have ios platform in current project.

  * To add ios platfotm 
``` script
ionic platform add ios
```
  * To load all plugins
  ``` script
  gulp plugins
  ```
  ## If all goes ok then check "installation-Readme-ios.md" for futher instruction else open issue


 * Android Platform setup intial 
* **Note** Only if you dont have Android platform in current project

  * To add android platfotm 
``` script
ionic platform add android
```
  * To load all plugins
  ``` script
  gulp plugins
  ```
  ## If all goes ok then check "installation-Readme-android.md" for futher instruction else open issue

## Setup and run iOS 

Please check installation-Readme-ios.md
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
