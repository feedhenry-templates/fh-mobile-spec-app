# Mobile Spec
---------
Author: Erik Jan de Wit   
Level: Intermediate   
Technologies: Javascript, Cordova, RHMAP   
Summary: based on the [Cordova Mobile Spec](https://github.com/apache/cordova-mobile-spec). The code is from the 3.3.x branch.   
Community Project: [Feed Henry](http://feedhenry.org)   
Target Product: RHMAP   
Product Versions: RHMAP 3.8.0+   
Source: https://github.com/feedhenry-templates/sync-cordova-app   
Prerequisites: fh-js-sdk : 2.14.+, Cordova 5.0+   

## What is it?

This application shows how you can use cloud call with the RHMAP platform, it should be used in combination with the [HelloWorld cloud app](https://github.com/feedhenry-templates/helloworld-cloud). Refer to [fhconfig.json](www/fhconfig.json) for configuration.

If you do not have access to a RHMAP instance, you can sign up for a free instance at [https://openshift.feedhenry.com/](https://openshift.feedhenry.com/).

## How do I run it?  

### RHMAP Studio

Build the app using fh-digger and install it on the device. Either run the autotests to test the full suite of tests or manually run tests to test a particular function.

###  Prerequisites  
 * fh-js-sdk : 2.14.+
 * cordova: 5.0+

## Build instructions
 * npm install
 * Edit [fhconfig.json](www/fhconfig.json) to include the relevant information from RHMAP.  
 * Build and run locally
```
cordova serve  
```
Go to [http://localhost:8000/](http://localhost:8000/)

### npm dependencies
The `fh-js-sdk` and other development dependencies are defined in [package.json](package.json) and included in a [browserified script](www/main.js).

* This generated [main.js](www/main.js) file is checked-in to allow RHMAP studio preview to statically serve dependencies.

* The [init.js](www/js/init.js) file is browserified and acts as a bridge between template script and npm dependencies. 

* All the other JavaScript files in the template app will not be browserified, in order for you to be able to experiment live edit in RHMAP Studio preview.

### Updating fh-js-sdk version
To update the JS SDK:
- change the version in [package.json](package.json)
- run `npm install` a grunt task is automatically ran to regenerate main.js
- check-in git repo the npackage.json + main.js