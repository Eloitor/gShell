/*
    gShell

    Copyright (C) LiveG. All Rights Reserved.

    https://liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as $g from "gshell://lib/adaptui/src/adaptui.js";

import * as system from "gshell://system/system.js";
import * as device from "gshell://system/device.js";
import * as debug from "gshell://system/debug.js";
import * as webviewManager from "gshell://userenv/webviewmanager.js";
import * as permissions from "gshell://config/permissions.js";
import * as l10n from "gshell://config/l10n.js";
import * as cursor from "gshell://global/cursor.js";
import * as tooltips from "gshell://global/tooltips.js";
import * as select from "gshell://global/select.js";
import * as a11y from "gshell://a11y/a11y.js";
import * as users from "gshell://config/users.js";
import * as info from "gshell://global/info.js";
import * as powerMenu from "gshell://global/powermenu.js";
import * as sleep from "gshell://system/sleep.js";
import * as network from "gshell://system/network.js";
import * as monitors from "gshell://system/monitors.js";
import * as mobile from "gshell://system/mobile.js";
import * as updates from "gshell://system/updates.js";
import * as interaction from "gshell://system/interaction.js";
import * as input from "gshell://input/input.js";
import * as lockScreen from "gshell://auth/lockscreen.js";
import * as auth from "gshell://auth/auth.js";
import * as personalisation from "gshell://config/personalisation.js";
import * as home from "gshell://userenv/home.js";
import * as switcher from "gshell://userenv/switcher.js";
import * as oobs from "gshell://oobs/oobs.js";
import * as sphere from "gshell://sphere/sphere.js";
import * as linux from "gshell://integrations/linux.js";
import * as xorg from "gshell://integrations/xorg.js";

window.$g = $g;

var oobsActivated = false;

$g.waitForLoad().then(function() {
    return $g.templates.apply();
}).then(function() {
    return system.init();
}).then(function() {
    return device.init();
}).then(function() {
    return monitors.init();
}).then(function() {
    return debug.init();
}).then(function() {
    return webviewManager.init();
}).then(function() {
    return l10n.loadFromConfig();
}).then(function() {
    return a11y.load();
}).then(function() {
    return updates.load();
}).then(function() {
    return interaction.load();
}).then(function() {
    return users.init();
}).then(function() {
    return users.getList();
}).then(function(userList) {
    if (userList.length == 0) {
        oobsActivated = true;

        return Promise.resolve();
    }

    return lockScreen.loadUsers();
}).then(function() {
    permissions.init();
    cursor.init();
    tooltips.init();
    select.init();
    a11y.init();
    info.init();
    powerMenu.init();
    sleep.init();
    network.init();
    mobile.init();
    updates.init();
    input.init();
    personalisation.init();
    home.init();
    switcher.init();
    oobs.init();
    sphere.init();
    linux.init();
    xorg.init();

    if (oobsActivated) {
        $g.sel("#oobs").screenFade();
    } else {
        $g.sel("#lockScreenMain").screenFade();
    }

    import("gshell://common.js");

    // TODO: Implement auth options in Settings from Debug Environment
    // users.get("test").then(function(user) {
    //     var credentials = new auth.UserAuthCredentials(user);

    //     credentials.load().then(function() {
    //         $g.sel("#passcodeAuth").setValue(credentials.authMethods[0] instanceof auth.PasscodeAuthMethod);
    //     });
    // });

    // $g.sel("#passcodeAuth").on("change", function() {
    //     users.get("test").then(function(user) {
    //         var credentials = new auth.UserAuthCredentials(user);

    //         credentials.load().then(function() {
    //             return $g.sel("#passcodeAuth").getValue() ? auth.PasscodeAuthMethod.generate("1234") : auth.UnsecureAuthMethod.generate();
    //         }).then(function(authMethod) {
    //             credentials.authMethods = [authMethod];

    //             credentials.save();
    //         });
    //     });
    // });

    // TODO: Implement Camera app from Debug Environment
    // $g.sel("#cameraTestButton").on("click", function() {
    //     if ("mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices) {
    //         navigator.mediaDevices.getUserMedia({video: true}).then(function(stream) {
    //             $g.sel("#cameraTest").get().srcObject = stream;

    //             $g.sel("#cameraTest").get().play();
    //         });
    //     }
    // });
});