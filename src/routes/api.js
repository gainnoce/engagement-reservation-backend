const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const EngagementRequest = require("../models/EngagementRequest");
const CalendarRule = require("../models/CalendarRule");

router.use((req, res, next) => {
  console.log("\n=== Request Debug ===");
  console.log("URL:", req.url);
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Base URL:", req.baseUrl);
  console.log("Original URL:", req.originalUrl);
  console.log("==================\n");
  next();
});

// Add these test routes right after your imports and before other routes
router.put("/test", (req, res) => {
  console.log("Test PUT route hit");
  console.log("Test body:", req.body);
  res.json({ message: "Test PUT successful" });
});

router.put("/test/:id", (req, res) => {
  console.log("Test PUT with ID route hit");
  console.log("Test ID:", req.params.id);
  console.log("Test body:", req.body);
  res.json({ message: "Test PUT with ID successful" });
});

// Add this logging middleware to debug route matching
router.use((req, res, next) => {
  console.log("Incoming request:", {
    method: req.method,
    path: req.path,
    headers: req.headers,
  });
  next();
});

console.log("API routes file loaded");

// Test route
router.get("/test", (req, res) => {
  console.log("API test route accessed");
  res.json({ message: "Backend API is working" });
});

// Check database connection
router.get("/check-db", async (req, res) => {
  console.log("Check database route accessed");
  if (mongoose.connection.readyState === 1) {
    res.json({
      message: "Database connected",
      dbName: mongoose.connection.db.databaseName,
    });
  } else {
    res.status(500).json({ message: "Database not connected" });
  }
});

// Get all engagement requests
router.get("/engagement-requests", async (req, res) => {
  console.log("Get all engagement requests route accessed");
  try {
    const requests = await EngagementRequest.find();
    console.log(`Found ${requests.length} engagement requests`);
    res.json(requests);
  } catch (error) {
    console.error("Error in get all engagement requests route:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new engagement request
router.post("/engagement-requests", async (req, res) => {
  console.log("Create engagement request route accessed");
  try {
    const newRequest = new EngagementRequest(req.body);
    const savedRequest = await newRequest.save();

    // Include the generated reference number in the response
    res.status(201).json({
      ...savedRequest.toObject(),
      referenceNumber: savedRequest.referenceNumber,
    });

    console.log("New engagement request created:", savedRequest._id);
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error("Error in create engagement request route:", error);
    res.status(400).json({ message: error.message });
  }
});

// Get a specific engagement request
router.get("/engagement-requests/:id", async (req, res) => {
  console.log(`GET route hit for ID: ${req.params.id}`);
  try {
    const engagement = await EngagementRequest.findById(req.params.id);
    if (!engagement) {
      console.log("Engagement request not found");
      return res.status(404).json({ message: "Engagement request not found" });
    }
    res.json(engagement);
  } catch (error) {
    console.error("Error in get specific engagement request route:", error);
    res.status(500).json({ message: error.message });
  }
});

// Handle OPTIONS preflight
router.options("/engagement-requests/:id", (req, res) => {
  res.header("Access-Control-Allow-Methods", "PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(204).send();
});

router.use("/engagement-requests/:id", (req, res, next) => {
  console.log("Route debug:", {
    originalUrl: req.originalUrl,
    method: req.method,
    params: req.params,
    body: req.body,
    headers: req.headers,
  });
  next();
});

// Settings API Routes
router.get("/settings/countries", async (req, res) => {
  try {
    const countrySettings = Object.entries(DEFAULT_COUNTRIES).map(
      ([name, settings]) => ({
        name,
        nomSig: settings.nomSig,
        blockDays: settings.blockDays,
      })
    );
    res.json(countrySettings);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/settings/calendar-rules", async (req, res) => {
  try {
    const { country, days } = req.body;
    // Update the calendar rule in your database
    let rule = await CalendarRule.findOne({
      ruleType: "country",
      ruleValue: country,
    });

    if (rule) {
      rule.blockDays = days;
      await rule.save();
    } else {
      rule = new CalendarRule({
        ruleType: "country",
        ruleValue: country,
        blockDays: days,
      });
      await rule.save();
    }

    res.json({ success: true, rule });
  } catch (error) {
    console.error("Error updating calendar rule:", error);
    res.status(500).json({ message: "Error updating calendar rule" });
  }
});

router.put("/settings/nomsig-countries", async (req, res) => {
  try {
    const { country, enabled } = req.body;
    // In a real application, you would update this in your database
    // For now, we'll just send back a success response
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating NomSig countries:", error);
    res.status(500).json({ message: "Error updating settings" });
  }
});

// Update an engagement request
router.put("/engagement-requests/:id", async (req, res) => {
  console.log("\n=== PUT Request Received ===");
  console.log("PUT route hit for ID:", req.params.id);
  console.log("Body:", req.body);
  console.log("Method:", req.method);
  console.log("Headers:", req.headers);
  console.log("==========================\n");

  try {
    const { id } = req.params;
    console.log("Processing update for ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid MongoDB ID format:", id);
      return res.status(400).json({ message: "Invalid engagement ID format" });
    }

    const document = await EngagementRequest.findById(id);
    if (!document) {
      console.log("No document found with ID:", id);
      return res.status(404).json({ message: "Engagement request not found" });
    }

    console.log("Found existing document:", document);

    const updatedRequest = await EngagementRequest.findByIdAndUpdate(
      id,
      {
        $set: {
          engagementNumber: req.body.engagementNumber,
          engagementName: req.body.engagementName,
          status: req.body.status || "Pending",
        },
      },
      { new: true }
    );

    console.log("Update successful, new document:", updatedRequest);
    res.json(updatedRequest);
  } catch (error) {
    console.error("Error in PUT route:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete an engagement request
router.delete("/engagement-requests/:id", async (req, res) => {
  console.log(
    `Delete engagement request route accessed for id: ${req.params.id}`
  );
  try {
    const deletedRequest = await EngagementRequest.findByIdAndDelete(
      req.params.id
    );
    if (!deletedRequest) {
      console.log("Engagement request not found for deletion");
      return res.status(404).json({ message: "Engagement request not found" });
    }
    console.log("Engagement request deleted:", deletedRequest._id);
    res.json({ message: "Engagement request deleted successfully" });
  } catch (error) {
    console.error("Error in delete engagement request route:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all calendar rules
router.get("/calendar-rules", async (req, res) => {
  try {
    const rules = await CalendarRule.find();
    res.json(rules);
  } catch (error) {
    console.error("Error fetching calendar rules:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new calendar rule
router.post("/calendar-rules", async (req, res) => {
  try {
    const rule = new CalendarRule(req.body);
    const savedRule = await rule.save();
    res.status(201).json(savedRule);
  } catch (error) {
    console.error("Error creating calendar rule:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update calendar rule
router.put("/calendar-rules", async (req, res) => {
  try {
    const { country, days } = req.body;

    let rule = await CalendarRule.findOne({
      ruleType: "country",
      ruleValue: country,
    });

    if (rule) {
      rule.blockDays = days;
      await rule.save();
    } else {
      rule = new CalendarRule({
        ruleType: "country",
        ruleValue: country,
        blockDays: days,
      });
      await rule.save();
    }

    res.json({ success: true, rule });
  } catch (error) {
    console.error("Error updating calendar rule:", error);
    res.status(500).json({ message: "Error updating calendar rule" });
  }
});

// Delete a calendar rule
router.delete("/calendar-rules/:id", async (req, res) => {
  try {
    const rule = await CalendarRule.findByIdAndDelete(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: "Rule not found" });
    }
    res.json({ message: "Rule deleted successfully" });
  } catch (error) {
    console.error("Error deleting calendar rule:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
