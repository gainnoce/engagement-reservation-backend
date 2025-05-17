const mongoose = require("mongoose");

const ExpertSchema = new mongoose.Schema({
  name: String,
  email: String,
  specialty: String,

  // Address Information
  street: String,
  city: String,
  stateProvince: String,
  country: String,
  zipCode: String,

  ltcServiceAgreement: String,
  rationale: {
    extensiveExperience: Boolean,
    currentResearch: Boolean,
    recentPublications: Boolean,
    text: String,
  },

  needAgreement: Boolean,
  haveAgreementNoNumber: Boolean,
  haveAgreementWithNumber: Boolean,
  agreementType: {
    type: String,
    enum: ["service", "msa", "sow", ""],
  },
  agreementNumber: String,
  sameHoursAsEngagement: Boolean,
  individualTotalHours: String,
  individualHoursBreakdown: [
    {
      type: String,
      hours: Number,
    },
  ],
  travelRequired: Boolean,
  engageAccountActive: Boolean,
});

const EngagementRequestSchema = new mongoose.Schema({
  engagementNumber: {
    type: String,
    trim: true,
  },
  engagementName: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
  requestNumber: String,
  engagementNumber: String,
  engagementName: String,
  engagementDate: Date,
  submittedBy: {
    name: String,
    email: String,
  },
  activityOwner: {
    name: String,
    email: String,
  },
  businessUnit: String,
  isLongTermAgreement: {
    type: Boolean,
    default: false,
  },
  experts: [ExpertSchema],
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  submittingOnBehalfOfOthers: Boolean,
  additionalInfo: {
    requestorName: String,
    requestorEmail: String,
    activityOwnerName: String,
    activityOwnerEmail: String,
    businessUnit: String,
    requestorEngageAccountActive: Boolean,
    activityOwnerEngageAccountActive: Boolean,
  },
  hasEngagementOccurred: Boolean,
  isPaymentsOnlyRequest: Boolean,
  totalHours: String,
  hoursBreakdown: [
    {
      type: String,
      hours: Number,
    },
  ],
  engagementType: String,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  referenceNumber: {
    type: String,
    unique: true,
  },
});

// Add a pre-save middleware to generate the reference number
EngagementRequestSchema.pre("save", async function (next) {
  try {
    if (!this.referenceNumber) {
      // Determine if this is a Milestone/one-off or service agreement/MSA-SOW
      const isMilestoneOrOneOff = this.experts.some(
        (expert) =>
          expert.needOneOffContract === true ||
          (expert.isVirtualOnlyConsulting === true &&
            expert.hasExistingAgreement === false)
      );

      if (isMilestoneOrOneOff) {
        // Generate MT-YYYY-XXXXXX format
        const currentYear = new Date().getFullYear();
        const lastMTNumber = await this.constructor
          .findOne({
            referenceNumber: { $regex: `MT-${currentYear}-` },
          })
          .sort({ referenceNumber: -1 });

        let sequence = 1;
        if (lastMTNumber) {
          const lastSequence = parseInt(
            lastMTNumber.referenceNumber.split("-")[2]
          );
          sequence = lastSequence + 1;
        }

        this.referenceNumber = `MT-${currentYear}-${sequence
          .toString()
          .padStart(6, "0")}`;
      } else {
        // Generate AGR-XXXXXX format
        const lastAGRNumber = await this.constructor
          .findOne({
            referenceNumber: { $regex: "AGR-" },
          })
          .sort({ referenceNumber: -1 });

        let sequence = 1;
        if (lastAGRNumber) {
          const lastSequence = parseInt(
            lastAGRNumber.referenceNumber.split("-")[1]
          );
          sequence = lastSequence + 1;
        }

        this.referenceNumber = `AGR-${sequence.toString().padStart(6, "0")}`;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("EngagementRequest", EngagementRequestSchema);
