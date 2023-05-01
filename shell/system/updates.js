/*
    gShell

    Copyright (C) LiveG. All Rights Reserved.

    https://liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as openpgp from "gshell://lib/openpgp.min.mjs";

import * as about from "gshell://about.js";
import * as device from "gshell://system/device.js";
import * as config from "gshell://config/config.js";
import * as privilegedInterface from "gshell://userenv/privilegedinterface.js";

const UPDATE_CHECK_FREQUENCY_MIN = 22 * 60 * 60 * 1_000; // 22 hours
const UPDATE_CHECK_FREQUENCY_RANDOM = 2 * 60 * 60 * 1_000; // 2 hours

const UPDATE_RETRIEVAL_OPTIONS = {
    headers: {
        "Cache-Control": "no-cache"
    }
};

export var updateCircuit = null;
export var shouldAutoCheckForUpdates = false;
export var index = null;
export var indexSignedKeyHex = null;
export var bestUpdate = null;
export var loadingIndex = false;

// TODO: Refer to https://stackoverflow.com/questions/22008193/how-to-list-download-the-recursive-dependencies-of-a-debian-package for offline package installation

export function findBestUpdate(updates = index.updates) {
    var bestUpdate = null;

    updates.forEach(function(update) {
        if (update.vernum <= about.VERNUM) {
            return;
        }

        if (update.circuit != updateCircuit) {
            return;
        }

        if (update.minSupportedVernum > about.VERNUM) {
            return;
        }

        if (!update.supportedPlatforms.includes(device.data?.platform)) {
            return;
        }

        if (bestUpdate == null) {
            bestUpdate = update;

            return;
        }

        if (update.vernum <= bestUpdate.vernum) {
            return;
        }

        bestUpdate = update;
    });

    return bestUpdate;
}

export function getUpdates() {
    console.log("System update information request made");

    var publicKey;
    var indexData;
    var indexMessage;

    loadingIndex = true;

    privilegedInterface.setData("updates_loadingIndex", loadingIndex);

    return fetch("gshell://trust/liveg/public.pgp").then(function(response) {
        return response.text();
    }).then(function(data) {
        return openpgp.readKey({armoredKey: data});
    }).then(function(key) {
        publicKey = key;

        return fetch("https://liveg.tech/os/updates/index.json", UPDATE_RETRIEVAL_OPTIONS);
    }).then(function(response) {
        return response.text();
    }).then(function(data) {
        indexData = data;

        return openpgp.createMessage({text: indexData});
    }).then(function(message) {
        indexMessage = message;

        return fetch("https://liveg.tech/os/updates/index.json.sig", UPDATE_RETRIEVAL_OPTIONS);
    }).then(function(response) {
        return response.text();
    }).then(function(data) {
        return openpgp.readSignature({
            armoredSignature: data
        });
    }).then(function(signature) {
        return openpgp.verify({
            message: indexMessage,
            signature,
            verificationKeys: publicKey
        });
    }).then(function(verification) {
        var signatureResult = verification.signatures[0];

        if (!signatureResult.verified) {
            return Promise.reject("Verification of update index file against signature has failed");
        }

        indexSignedKeyHex = signatureResult.keyID.toHex();

        try {
            index = JSON.parse(indexData);
        } catch (e) {
            return Promise.reject(e);
        }

        bestUpdate = findBestUpdate();
        loadingIndex = false;

        privilegedInterface.setData("updates_index", index);
        privilegedInterface.setData("updates_indexSignedKeyHex", indexSignedKeyHex);
        privilegedInterface.setData("updates_bestUpdate", bestUpdate);
        privilegedInterface.setData("updates_loadingIndex", loadingIndex);

        return Promise.resolve(index);
    });
}

export function startUpdateCheckTimer() {
    setTimeout(function() {
        if (shouldAutoCheckForUpdates) {
            getUpdates();
        }

        startUpdateCheckTimer();
    }, UPDATE_CHECK_FREQUENCY_MIN + (Math.random() * UPDATE_CHECK_FREQUENCY_RANDOM));
}

export function load() {
    return config.read("updates.gsc").then(function(data) {
        updateCircuit = data.updateCircuit || "alpha"; // TODO: Change when we make our first Beta or Main releases
        shouldAutoCheckForUpdates = !!data.shouldAutoCheckForUpdates;

        privilegedInterface.setData("updates_shouldAutoCheckForUpdates", shouldAutoCheckForUpdates);

        return Promise.resolve();
    });
}

export function setShouldAutoCheckForUpdates(value) {
    shouldAutoCheckForUpdates = value;

    privilegedInterface.setData("updates_shouldAutoCheckForUpdates", value);

    getUpdates();

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