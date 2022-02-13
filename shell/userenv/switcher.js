/*
    gShell

    Copyright (C) LiveG. All Rights Reserved.

    https://liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as $g from "gshell://lib/adaptui/src/adaptui.js";

const SELECT_MOTION_TOLERANCE = 20;

var initialTouchX = 0;
var initialScrollX = 0;
var lastScrollX = 0;
var targetScrollX = 0;
var targetInstantaneous = false;
var touchIsDown = false;
var scrolling = false;

function getClosestScreen() {
    var switcherWidth = $g.sel(".switcher").get().clientWidth;
    var switcherScrollLeft = $g.sel(".switcher").get().scrollLeft;

    return $g.sel(".switcher .switcher_screen").getAll().map(function(screenElement) {
        if (Math.abs(screenElement.offsetLeft - switcherScrollLeft) < (switcherWidth * (1 - 0.12)) / 2) { // 0.12 being margin percentage for switcher screens
            return $g.sel(screenElement);
        }

        return null;
    }).filter((element) => element != null)[0] || null;
}

export function init() {
    $g.sel(".switcher_home").on("click", function() {
        goHome();
    });

    $g.sel(".switcher").on("click", function(event) {
        if (scrolling || Math.abs(event.pageX - initialTouchX) > SELECT_MOTION_TOLERANCE) {
            return;
        }

        if (
            event.target.matches(".switcher_screen") &&
            event.target.closest(".switcher").matches(".allowSelect")
        ) {
            selectScreen($g.sel(event.target));
        }
    });

    $g.sel(".switcher").on("pointerdown", function(event) {
        if (scrolling) {
            return;
        }

        initialTouchX = event.pageX;
        initialScrollX = $g.sel(".switcher").get().scrollLeft;
        touchIsDown = true;
        scrolling = true;
    });

    $g.sel(".switcher").on("pointermove", function(event) {
        if (!touchIsDown) {
            return;
        }

        var switcherElement = $g.sel(".switcher").get();

        lastScrollX = switcherElement.scrollLeft;
        switcherElement.scrollLeft = initialScrollX - (event.pageX - initialTouchX);
    });

    $g.sel(".switcher").on("pointerup", function(event) {
        var switcherElement = $g.sel(".switcher").get();

        function snapScrolling() {
            var closestScreen = getClosestScreen();
    
            if (closestScreen != null) {
                targetScrollX = closestScreen.get().offsetLeft;
            }

            scrolling = false;
        }

        var rate = switcherElement.scrollLeft - lastScrollX;
        var multiplier = 1;

        touchIsDown = false;

        if (Math.abs(event.pageX - initialTouchX) <= SELECT_MOTION_TOLERANCE) {
            snapScrolling();

            return;
        }

        requestAnimationFrame(function continueScrolling() {
            switcherElement.scrollLeft += rate * multiplier;

            multiplier *= 0.9;

            if (multiplier > 0.1) {
                requestAnimationFrame(continueScrolling);

                return;
            }

            snapScrolling();
        });
    });

    window.addEventListener("resize", function() {
        if ($g.sel(".switcher_screen.selected").getAll().length == 0) {
            return;
        }

        targetScrollX = $g.sel(".switcher_screen.selected").get().offsetLeft;
        targetInstantaneous = true;
    });

    setInterval(function() {
        if (!scrolling) {
            var element = $g.sel(".switcher").get();
            var change = (targetScrollX - element.scrollLeft) * 0.2;

            if (targetInstantaneous || Math.abs(change) < 2) {
                element.scrollLeft = targetScrollX;
                targetInstantaneous = false;
            } else {
                element.scrollLeft += change;
            }
        }
    }, 10);
}

// TODO: Accept URL to open a specific app
export function openApp() {
    showList();

    var screenElement = $g.create("div").addClass("switcher_screen").add(
        $g.create("div").addClass("switcher_app").add(
            $g.create("main").add(
                $g.create("webview").setAttribute("src", "https://livegtech.github.io/Adapt-UI/demos/all/")
            )
        )
    );

    $g.sel("#switcherView .switcher").add(screenElement);

    return $g.sel("#switcherView").screenFade();
}

export function showList() {
    $g.sel(".switcher").addClass("allowSelect");
    $g.sel(".switcher_screen").removeClass("selected");
}

export function selectScreen(screenElement) {
    $g.sel(".switcher").removeClass("allowSelect");
    $g.sel(".switcher_screen").removeClass("selected");

    screenElement.addClass("selected");

    targetScrollX = screenElement.get().offsetLeft;

    return Promise.resolve();
}

export function closeAll() {
    $g.sel(".switcher").clear();
}

export function goHome() {
    return $g.sel("#main").screenFade();
}