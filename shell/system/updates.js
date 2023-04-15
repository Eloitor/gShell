/*
    gShell

    Copyright (C) LiveG. All Rights Reserved.

    https://liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as config from "gshell://config/config.js";
import * as privilegedInterface from "gshell://userenv/privilegedinterface.js";

const UPDATE_CHECK_FREQUENCY_MIN = 22 * 60 * 60 * 1_000; // 22 hours
const UPDATE_CHECK_FREQUENCY_RANDOM = 2 * 60 * 60 * 1_000; // 2 hours

export var updateCircuit = null;
export var shouldAutoCheckForUpdates = false;

export function getUpdates() {
    // TODO: Implement update info retrieval here

    console.log("System update information request made");
}

export function startUpdateCheckTimer() {
    setTimeout(function() {
        if (!shouldAutoCheckForUpdates) {
            return;
        }

        getUpdates();
        startUpdateCheckTimer();
    }, UPDATE_CHECK_FREQUENCY_MIN + (Math.random() * UPDATE_CHECK_FREQUENCY_RANDOM));
}

export function load() {
    return config.read("updates.gsc").then(function(data) {
        updateCircuit = data.updateCircuit || "alpha"; // TODO: Change when we make our first Beta or Main releases
        shouldAutoCheckForUpdates = !!data.shouldAutoCheckForUpdates;

        privilegedInterface.setData("updates_shouldAutoCheckForUpdates", shouldAutoCheckForUpdates);
    });
}

export function setShouldAutoCheckForUpdates(value) {
    shouldAutoCheckForUpdates = value;

    privilegedInterface.setData("updates_shouldAutoCheckForUpdates", value);

    return config.edit("updates.gsc", function(data) {
        data["shouldAutoCheckForUpdates"] = value;

        return Promise.resolve(data);
    });
}

export function init() {
    startUpdateCheckTimer();

    if (shouldAutoCheckForUpdates) {
        getUpdates();
    }
}