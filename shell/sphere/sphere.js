/*
    gShell

    Copyright (C) LiveG. All Rights Reserved.

    https://liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as $g from "gshell://lib/adaptui/src/adaptui.js";

import * as input from "gshell://input/input.js";
import * as switcher from "gshell://userenv/switcher.js";
import * as webviewManager from "gshell://userenv/webviewmanager.js";
import * as webviewComms from "gshell://userenv/webviewcomms.js";

export class Browser {
    constructor() {}

    get tabCount() {
        return this.uiMain.find(".sphere_tabs .sphere_tab").getAll().length;
    }

    get selectedTab() {
        return this.uiMain.find(".sphere_tab_selected");
    }

    updateChrome() {
        this.uiChrome.find(".sphere_tabButton").setText(this.tabCount > 99 ? ":)" : this.tabCount); // EASTEREGG: In a similar vein to mobile Chromium...

        if (this.selectedTab.find("webview").is(".sphere_ready") && document.activeElement !== this.uiChrome.find(".sphere_addressInput").get()) {
            this.uiChrome.find(".sphere_addressInput").setValue(this.selectedTab.find("webview").get()?.getURL());
        }
    }

    newTab(url) {
        var thisScope = this;
        var webview = webviewManager.spawn(url);

        webview.on("dom-ready", function() {
            webview.addClass("sphere_ready");

            thisScope.updateChrome();
        });

        webview.on("did-navigate did-navigate-in-page", function() {
            thisScope.updateChrome();
        });

        webview.on("click", function() {
            thisScope.uiChrome.find(".sphere_addressInput").blur();
        });

        this.uiMain.find(".sphere_tabs").add(
            $g.create("div")
                .addClass("sphere_tab")
                .addClass("sphere_tab_selected")
                .add(webview)
        );

        this.updateChrome();
    }

    goBack(tab = this.selectedTab) {
        tab.find("webview").get()?.goBack();
    }

    visitUrl(url, tab = this.selectedTab) {
        tab.find("webview").get()?.loadURL(url);
    }

    render() {
        var thisScope = this;

        // UI chrome, not to be confused with the Google Chrome browser
        this.uiChrome = $g.create("header").add(
            $g.create("button")
                .setAttribute("aria-label", _("sphere_back"))
                .on("click", function() {
                    thisScope.goBack();
                })
                .add(
                    $g.create("img")
                        .setAttribute("aui-icon", "light")
                        .setAttribute("src", "gshell://lib/adaptui/icons/back.svg")
                        .setAttribute("alt", "")
                )
            ,
            $g.create("input")
                .addClass("sphere_addressInput")
                .setAttribute("type", "url")
                .on("click", function() {
                    $g.sel(".sphere_addressInput").get().select();
                })
                .on("keydown", function(event) {
                    if (event.key == "Enter") {
                        thisScope.visitUrl($g.sel(".sphere_addressInput").getValue());
                    }
                })
            ,
            $g.create("button")
                .addClass("sphere_tabButton")
                .setText("0")
            ,
            $g.create("button")
                .setAttribute("aria-label", _("sphere_menu"))
                .add(
                    $g.create("img")
                        .setAttribute("aui-icon", "light")
                        .setAttribute("src", "gshell://lib/adaptui/icons/menu.svg")
                        .setAttribute("alt", "")
                )
        );

        this.uiMain = $g.create("main")
            .addClass("sphere_main")
            .add(
                $g.create("div").addClass("sphere_tabs")
            )
        ;

        this.newTab("https://github.com/LiveGTech/gShell");

        return [this.uiChrome, this.uiMain];
    }
}

export function init() {
    webviewComms.onEvent("click", function(event) {
        if (!event.isTrusted) {
            return;
        }

        if ($g.sel(document.activeElement).is(".sphere_addressInput")) {
            $g.sel("body").focus();

            input.hide(true);
        }
    });
}

export function openBrowser() {
    var browser = new Browser();

    return switcher.openWindow(browser.render());
}