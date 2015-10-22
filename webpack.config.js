'use strict';

var webpack = require("webpack");

module.exports = {
    entry: "./src/booking.js",
    devtool: "source-map",
    output: {
        path: "./dist",
        filename: "timekit-booking.js",
        libraryTarget: "umd",
        library: "timekitBooking"
    },
    externals: {
        "jquery": "jQuery"
    }
};
