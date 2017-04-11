# UR Money

Mobile and web interface for UR.

## This requires node v6.9.4!

If you are running a different version, install
[nvm](https://github.com/creationix/nvm/blob/master/README.markdown) and switch
to 6.9.4.

## To install

Run `make install`. This includes global dependencies like ionic, cordova and
typings, as well as local npm. Note that this required superuser access.

## Set an appropriate config file, if required

Ur money uses a Typescript-driven config system. The config file lives at
`src/config/config.ts`, and it defaultly connects to the staging environment.
There are seveal other files in that directory which connect to other
environments.

## Run on device

* Run `ionic run android -c -l` or `ionic run ios -c -l`
* If you have a problem running the app, check out these platform-specific instructions:
* [installation-android.md](doc/installation-android.md)
* [installation-ios.md](doc/installation-ios.md)

## To run as a web server

```script
make run
```

## Deploy to Firebase Hosting

Make sure you have firebase-tools installed, and have logged in.

```script
make deploy-staging
```

or

```script
make deploy-production
```

