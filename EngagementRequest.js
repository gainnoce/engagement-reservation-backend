const mongoose = require('mongoose');

const ExpertSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  address: String,
  city: String,
  stateProvince: String,
  country: String,
  zipCode: String,
  specialty: String,
  rationale: String,
  ltcServiceAgreement: String,
  travelRequired: Boolean,
  engageAccountActive: Boolean
});

const EngagementRequestSchema = new mongoose.Schema({
  submittedBy: {
    name: String,
    email: String
  },
  activityOwner: {
    name: String,
    email: String
  },
  isPostEngagement: Boolean,
  experts: [ExpertSchema],
  engagementDate: Date,
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EngagementRequest', EngagementRequestSchema);
