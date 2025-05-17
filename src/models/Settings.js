const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  nomsigCountries: [
    {
      type: String,
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Settings", SettingsSchema);
