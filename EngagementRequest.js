const mongoose = require('mongoose');

const ExpertSchema = new mongoose.Schema({
  name: String,
  email: String,
  street: String,
  city: String,
  stateProvince: String,
  country: String,
  zipCode: String,
  specialty: String,
  rationale: {
    text: String,
    extensiveExperience: Boolean,
    currentResearch: Boolean,
    recentPublications: Boolean
  },
  ltcServiceAgreement: String,
  travelRequired: Boolean,
  engageAccountActive: Boolean
});

const EngagementRequestSchema = new mongoose.Schema({
  businessUnit: String,
  submittingOnBehalfOfOthers: Boolean,
  additionalInfo: {
    requestorName: String,
    requestorEmail: String,
    activityOwnerName: String,
    activityOwnerEmail: String,
    businessUnit: String
  },
  isPostEngagement: Boolean,
  experts: [ExpertSchema],
  engagementDate: Date
});

module.exports = mongoose.model('EngagementRequest', EngagementRequestSchema);
