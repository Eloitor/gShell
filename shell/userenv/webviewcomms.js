/*
    gShell

    Copyright (C) LiveG. All Rights Reserved.

    https://liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as a11y from "gshell://a11y/a11y.js";
import * as input from "gshell://input/input.js";

var webviewEvents = [];

export class WebviewEvent {
    constructor(data) {
        Object.assign(this, data);
    }
}

export function onEvent(eventName, callback) {
    webviewEvents.push({eventName, callback});
}

export function attach(webview) {
    webview.on("ipc-message", function(event) {
        switch (event.channel) {
            case "eventPropagation":
                webviewEvents
                    .filter((webviewEvent) => webviewEvent.eventName == event.args[0])
                    .forEach(function(webviewEvent) {
                        webviewEvent.callback(new WebviewEvent({...event.args[1], targetWebview: webview.get()}));
                    })
                ;

                break;

            case "input_show":
                input.show();
                break;

            case "input_hide":
                input.hide();
                break;
        }
    });
}

export function update(webview = $g.sel("body webview")) {
    webview.getAll().forEach(function(element) {
        element.send("update", {
            a11y_options: a11y.options,
            input_showing: input.showing
        });
    });
}