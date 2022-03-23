/*
    gShell

    Copyright (C) LiveG. All Rights Reserved.

    https://liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as $g from "gshell://lib/adaptui/src/adaptui.js";

import * as l10n from "gshell://config/l10n.js";
import * as users from "gshell://config/users.js";
import * as info from "gshell://global/info.js";
import * as sleep from "gshell://power/sleep.js";
import * as lockScreen from "gshell://auth/lockscreen.js";
import * as auth from "gshell://auth/auth.js";
import * as home from "gshell://userenv/home.js";
import * as switcher from "gshell://userenv/switcher.js";
import * as input from "gshell://input/input.js";

window.$g = $g;

$g.waitForLoad().then(function() {
    return l10n.apply();
}).then(function() {
    return users.getList();
}).then(function(userList) {
    // TODO: Replace automatic user generation with OOBS

    if (userList.length == 0) {
        var credentials;

        return users.create("test").then(function(user) {
            credentials = new auth.UserAuthCredentials(user);

            return auth.UnsecureAuthMethod.generate();
        }).then(function(method) {
            credentials.authMethods.push(method);

            return credentials.save();
        });
    }

    return Promise.resolve();
}).then(function() {
    return lockScreen.loadUsers();
}).then(function() {
    info.init();
    home.init();
    switcher.init();

    $g.sel("#lockScreenMain").screenFade();

    $g.sel("#openMenuButton").on("click", function() {
        $g.sel("#mainMenu").menuOpen();
    });

    $g.sel("#testPageButton").on("click", function() {
        $g.sel("#testPage").screenForward();
    });

    $g.sel("#lockButton").on("click", function() {
        $g.sel("#lockScreenMain").screenFade();
    });

    $g.sel("#shutDownButton").on("click", function() {
        gShell.call("power_shutDown");
    });

    $g.sel("#devRestartButton").on("click", function() {
        gShell.call("dev_restart");
    });

    gShell.call("system_getFlags").then(function(flags) {
        if (flags.isRealHardware) {
            $g.sel("#flagInfo").setText("Running on real hardware!");
        } else {
            $g.sel("#flagInfo").setText("Running in simulator!");
        }
    });

    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function(event) {
        $g.sel("#darkTheme").setValue(event.matches);
    });

    $g.sel("#darkTheme").on("change", function() {
        gShell.call("shell_setColourScheme", {
            scheme: $g.sel("#darkTheme").getValue() ? "dark" : "light"
        });
    });

    users.get("test").then(function(user) {
        var credentials = new auth.UserAuthCredentials(user);

        credentials.load().then(function() {
            $g.sel("#passcodeAuth").setValue(credentials.authMethods[0] instanceof auth.PasscodeAuthMethod);
        });
    });

    $g.sel("#passcodeAuth").on("change", function() {
        users.get("test").then(function(user) {
            var credentials = new auth.UserAuthCredentials(user);

            credentials.load().then(function() {
                return $g.sel("#passcodeAuth").getValue() ? auth.PasscodeAuthMethod.generate("1234") : auth.UnsecureAuthMethod.generate();
            }).then(function(authMethod) {
                credentials.authMethods = [authMethod];

                credentials.save();
            });
        });
    });

    $g.sel("#openSwitcher").on("click", function() {
        switcher.openApp("https://livegtech.github.io/Adapt-UI/demos/all/");
    });

    $g.sel("#closeAll").on("click", function() {
        switcher.closeAll();
    });

    $g.sel(".home_app").on("click", function() {
        $g.sel("#main").screenFade();
    });

    $g.sel("#cameraTestButton").on("click", function() {
        if ("mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({video: true}).then(function(stream) {
                $g.sel("#cameraTest").get().srcObject = stream;

                $g.sel("#cameraTest").get().play();
            });
        }
    });

    $g.sel("#keyTest").on("click", function() {
        gShell.call("dev_keyTest", {id: $g.sel("webview").get().getWebContentsId()});
        $g.sel("webview").focus();
    });

    $g.sel("#keyboardTestShowButton").on("click", function() {
        input.show();
    });

    $g.sel("#keyboardTestHideButton").on("click", function() {
        input.hide();
    });
});