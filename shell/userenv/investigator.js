/*
    gShell

    Copyright (C) LiveG. All Rights Reserved.

    https://liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

var responseCallbacks = [];
var eventListeners = [];

export function handleResponse(responseData) {
    var callbacks = responseCallbacks[responseData.id];

    if (!callbacks) {
        console.warn("Investigator response ID does not match an open callback set");

        return;
    }

    (responseData.type != "error" ? callbacks.resolve : callbacks.reject)(responseData.response);

    responseCallbacks[responseData.id] = null;
}

export function handleEvent(webview, event) {
    eventListeners.forEach(function(listener) {
        if (listener.webview.get() != webview.get()) {
            return;
        }

        if (listener.eventType != event.type) {
            return;
        }

        listener.callback(event);
    });
}

export function onEvent(webview, eventType, callback) {
    eventListeners.push({webview, eventType, callback});

    return call(webview, "listenToEvent", {eventType});
}

export function call(webview, command, data = {}) {
    return new Promise(function(resolve, reject) {
        responseCallbacks.push({resolve, reject});

        gShell.call("webview_send", {
            webContentsId: webview.get().getWebContentsId(),
            message: "investigator_command",
            data: {
                id: responseCallbacks.length - 1,
                command,
                data
            },
            sendToSubframes: false
        });
    });
}