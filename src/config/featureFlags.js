// Feature flags configuration
const featureFlags = {
  ENABLE_AUTH: true,
  ENABLE_ADMIN: true,
  ENABLE_API: true,
  userRoleSystem: true,
  calendarRules: true,
  NOMSIG_APPROVAL_SYSTEM: true,
  CRF_GENERATION: true
};

console.log("Feature Flags Module Loaded:", featureFlags);

function isFeatureEnabled(flag) {
  const value = featureFlags[flag];
  console.log(`[Feature Flag Check] ${flag} = ${value}`);
  return value === true;
}

function setupFeatureFlagRoutes(app) {
  app.get('/feature-flags', (req, res) => {
    console.log("Feature Flags Route - Current Flags:", featureFlags);
    res.json(featureFlags);
  });
}

module.exports = {
  isFeatureEnabled,
  setupFeatureFlagRoutes,
  featureFlags
};