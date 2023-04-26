/*
    gShell

    Copyright (C) LiveG. All Rights Reserved.

    https://liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as $g from "gshell://lib/adaptui/src/adaptui.js";
import * as astronaut from "gshell://lib/adaptui/astronaut/astronaut.js";

import * as shortcuts from "./shortcuts.js";

export var UpdatesPage = astronaut.component("UpdatesPage", function(props, children) {
    const updateStates = {
        LOADING_INDEX: 0,
        UPDATE_AVAILABLE: 1,
        UP_TO_DATE: 2
    };

    var page = Page() ();

    var lastState = null;

    function updateData() {
        var data = _sphere.getPrivilegedData();
        var currentState = null;

        if (data?.updates_loadingIndex) {
            currentState = updateStates.LOADING_INDEX;
        } else if (data?.updates_index) {
            if (data?.updates_bestUpdate) {
                currentState = updateStates.UPDATE_AVAILABLE;
            } else {
                currentState = updateStates.UP_TO_DATE;
            }
        } else {
            _sphere.callPrivilegedCommand("updates_getUpdates");

            currentState = updateStates.LOADING_INDEX;
        }

        if (currentState == lastState) {
            return;
        }

        lastState = currentState;

        page.clear();

        // TODO: Translate into French

        switch (currentState) {
            case updateStates.LOADING_INDEX:
                page.add(
                    SkeletonLoader("Loading update information...") (
                        Heading() (),
                        Card (
                            Heading(2) (),
                            Paragraph() (),
                            Paragraph() (),
                            Paragraph() ()
                        )
                    )
                );

                break;

            case updateStates.UPDATE_AVAILABLE:
                var update = data?.updates_bestUpdate;

                page.add(
                    Section (
                        Heading() (_("updates_latest")),
                        Card({mode: "keepUnlinked"}) (
                            Heading({
                                level: 2,
                                styles: {
                                    fontSize: "1.5rem"
                                }
                            }) (
                                BrandWordmark(_("updates_info_name").trim(), "gshell://media/logo.svg") (_("updates_info_name")),
                                TextFragment({
                                    styles: {
                                        fontWeight: "normal"
                                    }
                                }) (_("updates_info_version", {version: update.version}))
                            ),
                            Container() ().setHTML(new showdown.Converter({
                                headerLevelStart: 3,
                                openLinksInNewWindow: true
                            }).makeHtml(new showdown.Converter().makeHtml(update.description[$g.l10n.getSystemLocaleCode()] || update.description[update.fallbackLocale] || ""))),
                            ButtonRow (
                                Button() (_("updates_updateNow")) // TODO: Implement action
                            )
                        )
                    )
                );

                break;

            case updateStates.UP_TO_DATE:
                page.add(
                    Section (
                        Message (
                            Icon("checkmark", "dark embedded") (),
                            Heading() (_("updates_upToDate_title")),
                            Paragraph() (_("updates_upToDate_description")),
                            ButtonRow (
                                Button() (_("updates_upToDate_checkAgain")) // TODO: Implement action
                            )
                        )
                    )
                );
        }
    }

    _sphere.onPrivilegedDataUpdate(updateData);
    updateData();

    return page;
});