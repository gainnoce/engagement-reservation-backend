const mongoose = require("mongoose");

const CalendarRuleSchema = new mongoose.Schema({
  ruleType: {
    type: String,
    enum: ["country", "engageAccount", "businessUnit"],
    required: true,
  },
  ruleValue: {
    type: String,
    required: true,
  },
  blockDays: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("CalendarRule", CalendarRuleSchema);
