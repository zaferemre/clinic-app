"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workingHourSchema = void 0;
const mongoose_1 = require("mongoose");
exports.workingHourSchema = new mongoose_1.Schema({
    day: {
        type: String,
        enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ],
        required: true,
    },
    open: { type: String, required: true },
    close: { type: String, required: true },
}, { _id: false });
exports.default = exports.workingHourSchema;
