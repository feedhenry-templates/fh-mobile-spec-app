/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

function getPlatform() {
    var platforms = {
        amazon_fireos: /cordova-amazon-fireos/,
        android: /Android/,
        ios: /(iPad)|(iPhone)|(iPod)/,
        blackberry10: /(BB10)/,
        blackberry: /(PlayBook)|(BlackBerry)/,
        windows8: /MSAppHost/,
        windowsphone: /Windows Phone/
    };
    for (var key in platforms) {
        if (platforms[key].exec(navigator.userAgent)) {
            return key;
        }
    }
}

var scripts = document.getElementsByTagName('script');
var currentPath = scripts[scripts.length - 1].src;
var cordovaPath = currentPath.replace("browserify.js", "cordova.js");

if (!window._doNotWriteCordovaScript) {
    if (getPlatform() !== "windows8") {
        document.write('<script type="text/javascript" charset="utf-8" src="' + cordovaPath + '"></script>');
        window.$fh = require('fh-js-sdk');
    } else {
        var s = document.createElement('script');
        s.src = cordovaPath;
        document.head.appendChild(s);
    }
}

window.backHome =  function() {
    if (window.device && device.platform && (device.platform.toLowerCase() == 'android' || device.platform.toLowerCase() == 'amazon-fireos')) {
        navigator.app.backHistory();
    }
    else {
        window.history.go(-1);
    }
};

window.$fh = window.$fh || {};
window.$fh.__dest__ = window.$fh.__dest__ || {};
window.$fh._readyCallbacks = window.$fh._readyCallbacks || [];

