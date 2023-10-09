var archGccPrefix = {
    "x64": "x86_64-linux-gnu",
    "arm64": "aarch64-linux-gnu",
    "armv7l": "arm-linux-gnueabihf"
};

module.exports = function(buildContext) {
    console.log(buildContext);

    if (buildContext.platform.name != "linux") {
        return Promise.resolve(true);
    }

    if (buildContext.arch == "armv7l") {
        process.env.npm_config_arch = "arm";
    }

    if (buildContext.arch in archGccPrefix) {
        process.env.CC = `${archGccPrefix[buildContext.arch]}-gcc`;
        process.env.CXX = `${archGccPrefix[buildContext.arch]}-g++`;
    } else {
        process.env.CC = "gcc";
        process.env.CXX = "g++";
    }

    console.log(process.env.CC, process.env.CXX);

    return Promise.resolve(true);
}