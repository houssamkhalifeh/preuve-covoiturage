const { Schema } = require('mongoose');
const mongo = require('@pdc/shared-providers').mongo;
const { regex, validators } = mongo.schemas;
const { round, toUtc } = mongo;
const aom = require('./aom');

const PositionSchema = new Schema({
  datetime: {
    type: Date,
    required: true,
    get: round,
    set: toUtc,
  },
  lon: {
    type: Number,
    min: -180,
    max: 180,
    match: regex.lon,
    validate: validators.lon,
  },
  lat: {
    type: Number,
    min: -90,
    max: 90,
    match: regex.lat,
    validate: validators.lat,
  },
  insee: {
    type: String,
    trim: true,
    uppercase: true,
    match: regex.insee,
  },
  literal: { type: String, trim: true },
  aom,
  town: { type: String, trim: true },
  country: { type: String, trim: true },
  postcodes: [{
    type: String,
    trim: true,
    uppercase: true,
    match: regex.postcode,
  }],
}, { _id: false, id: false });

export default PositionSchema;