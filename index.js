// 1. IMPORTS AND SETUP
const express = require("express");
const session = require("express-session");
const path = require("path");
const { isFeatureEnabled, setupFeatureFlagRoutes } = require('./src/config/featureFlags');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import models
const EngagementRequest = require("./src/models/EngagementRequest");
const CalendarRule = require("./src/models/CalendarRule");

// 2. VIEW ENGINE SETUP
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 3. MIDDLEWARE SETUP
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use('/js', express.static(path.join(__dirname, 'src', 'public', 'js')));
app.use('/css', express.static(path.join(__dirname, 'src', 'public', 'css')));
app.use('/images', express.static(path.join(__dirname, 'src', 'public', 'images')));

const MongoDBStore = require('connect-mongodb-session')(session);

// Create a MongoDB session store
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions',
  databaseName: 'engagement_system',
  expires: 24 * 60 * 60 * 1000, // 24 hours
  autoRemove: 'native',
  autoRemoveInterval: 10, // In minutes
  ttl: 24 * 60 * 60, // 24 hours
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
});

// Add detailed MongoDB connection logging
store.on('connection', () => {
  console.log('MongoDB session store connected');
  console.log('MongoDB URI:', process.env.MONGODB_URI);
});

store.on('disconnection', () => {
  console.log('MongoDB session store disconnected');
});

store.on('error', (error) => {
  console.error('MongoDB session store error:', error);
});

// Log session store stats
setInterval(() => {
  store.all((err, sessions) => {
    if (err) {
      console.error('Error getting sessions:', err);
      return;
    }
    console.log('Current sessions count:', sessions.length);
    console.log('Sessions:', sessions);
  });
}, 60000); // Every minute

// Catch errors
store.on('error', function(error) {
  console.error('MongoDB session store error:', error);
});

// Check if MongoDB is properly connected
store.on('ready', function() {
  console.log('MongoDB session store ready');
});

// Log session store stats
setInterval(() => {
  store.all((err, sessions) => {
    if (err) {
      console.error('Error getting sessions:', err);
      return;
    }
    console.log('Current sessions count:', sessions.length);
  });
}, 60000); // Every minute

// Session setup
app.use(session({
  store: store,
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax',
    domain: '.onrender.com',
    path: '/',
    secure: true,
    proxy: true
  },
  name: 'engagement-session',
  rolling: true,
  genid: function(req) {
    return require('crypto').randomBytes(24).toString('hex');
  }
}));

// Add CORS middleware
// Update CORS configuration
app.use(cors({
  origin: ['https://your-render-app.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers']
}));

// Add explicit session handling middleware
app.use((req, res, next) => {
  // Force session initialization
  if (!req.session) {
    req.session = {};
  }
  
  // Save session on every request if authenticated
  if (req.session && req.session.isAuthenticated) {
    req.session.save(err => {
      if (err) {
        console.error('Error saving session:', err);
      }
      next();
    });
  } else {
    next();
  }
});

// Add cookie handling middleware
app.use((req, res, next) => {
  // Set session cookie explicitly
  if (req.session && req.session.isAuthenticated) {
    res.cookie('engagement-session', req.sessionID, {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      domain: '.onrender.com',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });
  }
  next();
});

// Add session save middleware
app.use((req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    req.session.save(err => {
      if (err) {
        console.error('Error saving session:', err);
      }
      next();
    });
  } else {
    next();
  }
});

// Add session save middleware
app.use((req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    req.session.save(err => {
      if (err) {
        console.error('Error saving session:', err);
      }
      next();
    });
  } else {
    next();
  }
});

// Add session save middleware to ensure sessions are saved after each request
app.use((req, res, next) => {
  if (req.session) {
    req.session.save(err => {
      if (err) {
        console.error('Error saving session:', err);
      }
      next();
    });
  } else {
    next();
  }
});

// Error handling
process.on("uncaughtException", (error) => {
  console.error("\n=== Uncaught Exception ===");
  console.error("Error:", error);
  console.error("Stack:", error.stack);
  console.error("=== Exception End ===\n");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("\n=== Unhandled Rejection ===");
  console.error("Reason:", reason);
  console.error("Promise:", promise);
  console.error("=== Rejection End ===\n");
});

// CORS setup
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept", "Origin", "Authorization"]
}));

// Default countries configuration
const DEFAULT_COUNTRIES = {
  // Europe
  UK: { blockDays: 30, nomSig: true },
  France: { blockDays: 60, nomSig: true },
  Germany: { blockDays: 30, nomSig: false },
  Italy: { blockDays: 45, nomSig: true },
  Spain: { blockDays: 30, nomSig: false },
  Netherlands: { blockDays: 30, nomSig: false },
  Belgium: { blockDays: 30, nomSig: true },
  Switzerland: { blockDays: 30, nomSig: false },
  Ireland: { blockDays: 30, nomSig: false },
  Sweden: { blockDays: 30, nomSig: false },

  // North America
  "United States": { blockDays: 14, nomSig: false },
  Canada: { blockDays: 14, nomSig: false },
  Mexico: { blockDays: 30, nomSig: false },

  // Asia
  Japan: { blockDays: 30, nomSig: false },
  "South Korea": { blockDays: 14, nomSig: true },
  China: { blockDays: 45, nomSig: false },
  Singapore: { blockDays: 14, nomSig: true },
  India: { blockDays: 45, nomSig: false },

  // Australia/Oceania
  Australia: { blockDays: 30, nomSig: false },
  "New Zealand": { blockDays: 30, nomSig: false },
};

// Auth middleware
const isLoggedIn = (req, res, next) => {
  console.log("\n=== Auth Check ===");
  console.log("Session present:", !!req.session);
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
  
  // Check if session exists and is authenticated
  if (!req.session || !req.session.isAuthenticated) {
    console.log("User not authenticated, redirecting to /admin");
    res.redirect("/admin");
    return;
  }
  
  // Set user data for use in views
  req.user = {
    isAuthenticated: req.session.isAuthenticated,
    role: req.session.userRole
  };
  
  console.log("User authenticated, proceeding");
  next();
};

// Role-based access middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    console.log("\n=== Role Check ===");
    console.log("Required roles:", allowedRoles);
    console.log("User role:", req.session?.userRole);

    if (!req.session?.userRole) {
      return res.status(403).json({
        error: "Access denied",
        reason: "No role specified"
      });
    }

    if (allowedRoles.includes(req.session.userRole)) {
      next();
    } else {
      res.status(403).json({
        error: "Access denied",
        reason: "Insufficient privileges",
        userRole: req.session.userRole,
        requiredRoles: allowedRoles
      });
    }
  };
};

// 5. SESSION SETUP
app.use((req, res, next) => {
  console.log("\n=== Session Debug (Early) ===");
  console.log("Session ID:", req.sessionID);
  console.log("Full Session:", JSON.stringify(req.session, null, 2));
  console.log("User:", req.session?.user);
  console.log("Role:", req.session?.user?.role);
  console.log("=== Session Debug End ===\n");
  next();
});

// 6. FEATURE FLAGS SETUP
setupFeatureFlagRoutes(app);

// 7. DATABASE CONNECTION
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
  MONGODB_URI_PREFIX: process.env.MONGODB_URI?.substring(0, 20) + '...',
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    console.log("Database Name:", mongoose.connection.db.databaseName);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// 8. AUTHENTICATION ROUTES
// Admin login GET route
app.get("/admin", (req, res) => {
  // If user is already authenticated, redirect to dashboard
  if (req.session.isAuthenticated) {
    res.redirect("/dashboard");
  } else {
    res.render("admin", {
      title: "Admin Login",
      error: req.query.error
    });
  }
});

// Admin login POST handler
app.post("/admin", (req, res) => {
  console.log('\n=== Admin Login Attempt ===');
  console.log('Received body:', req.body);
  console.log('Session before:', req.session);
  
  const { username, password } = req.body;
  
  // For demo purposes - using the original credentials
  if (username === "admin" && password === "password123") {
    console.log('Credentials match, setting session');
    req.session.isAuthenticated = true;
    req.session.userRole = "admin";
    
    // Save session immediately
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect("/admin?error=Session error");
      }
      
      console.log('Session saved successfully, redirecting to dashboard');
      res.redirect("/dashboard");
    });
  } else {
    console.log('Invalid credentials provided');
    res.redirect("/admin?error=Invalid credentials");
  }
});

// Admin logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/admin");
  });
});

// Feature flag routes
setupFeatureFlagRoutes(app);

// Login route (for backward compatibility)
app.post("/login", (req, res) => {
  console.log("\n=== Login Attempt ===");
  console.log("Body:", req.body);
  const { username, password } = req.body;
  
  // For demo purposes - using the original credentials
  if (username === "admin" && password === "password123") {
    console.log("Login successful");
    req.session.isAuthenticated = true;
    req.session.userRole = "admin";
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect("/admin?error=Session error");
      }
      console.log("Session saved, redirecting to dashboard");
      res.redirect("/dashboard");
    });
  } else {
    res.redirect("/admin?error=Invalid credentials");
  }
});

app.post("/login", (req, res) => {
  console.log("\n=== Login Attempt ===");
  console.log("Body:", req.body);
  const { username, password } = req.body;
  
  // For demo purposes - using the original credentials
  if (username === "admin" && password === "password123") {
    console.log("Login successful");
    req.session.isAuthenticated = true;
    req.session.userRole = "admin";
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect("/admin?error=Session error");
      }
      console.log("Session saved, redirecting to dashboard");
      res.redirect("/dashboard");
    });
  } else {
    console.log("Login failed - Invalid credentials");
    console.log("Provided credentials:", { username, password });
    res.redirect("/admin?error=Invalid credentials");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/admin");
  });
});

// 9. MAIN PAGE ROUTES
app.get("/", (req, res) => {
  console.log("Root route accessed");
  res.send(`
    <html>
      <head><title>Engagement Reservation System API</title></head>
      <body>
        <h1>Welcome to the Engagement Reservation System API</h1>
        <p>Server is running successfully.</p>
        <a href="/admin">Go to Admin</a>
      </body>
    </html>
  `);
});

app.get("/dashboard", isLoggedIn, async (req, res) => {
  console.log("\n=== Dashboard Route ===");
  try {
    // Get feature flags
    const calendarRulesEnabled = isFeatureEnabled("calendarRules");
    const userRoleSystemEnabled = isFeatureEnabled("userRoleSystem");
    const nomsigApprovalEnabled = isFeatureEnabled("NOMSIG_APPROVAL_SYSTEM");
    const crfGenerationEnabled = isFeatureEnabled("CRF_GENERATION");

    console.log("[Feature Flag Check] calendarRules =", calendarRulesEnabled);
    console.log("[Feature Flag Check] userRoleSystem =", userRoleSystemEnabled);
    console.log("[Feature Flag Check] NOMSIG_APPROVAL_SYSTEM =", nomsigApprovalEnabled);
    console.log("[Feature Flag Check] CRF_GENERATION =", crfGenerationEnabled);

    const featureFlags = {
      calendarRules: calendarRulesEnabled,
      userRoleSystem: userRoleSystemEnabled,
      nomsigApproval: nomsigApprovalEnabled,
      crfGeneration: crfGenerationEnabled
    };

    console.log("Feature Flag Values:", featureFlags);
    console.log("Rendering dashboard with features:", featureFlags);

    const requests = await EngagementRequest.find().lean();
    console.log("Rendering dashboard with features:", featureFlags);
    
    res.render("dashboard", { 
      requests, 
      features: featureFlags,
      currentRole: req.session.userRole
    });
  } catch (error) {
    console.error("Error in dashboard route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// First, log that we're about to register the route
console.log("\n=== Registering Settings Route ===");

// Test route that doesn't use any middleware or rendering
app.get("/test-settings", (req, res) => {
  console.log("Test settings route hit!");
  res.send("Test settings route working!");
});

app.get("/test-admin", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "public", "admin.html"), (err) => {
    if (err) {
      console.error("Error sending admin file:", err);
      res.status(500).send("Error loading admin page");
    }
  });
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 1000
  }
})
.then(() => {
  console.log('MongoDB connected to', mongoose.connection.name);
  console.log('Connected to database:', mongoose.connection.db.databaseName);
})
.catch(err => console.error('MongoDB connection error:', err));

// Debug logging middleware
app.use((req, res, next) => {
  console.log('Request received:', {
    method: req.method,
    path: req.url,
    body: req.body
  });
  next();
});

// Welcome route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the Expert Engagement Reservation System API',
    endpoints: {
      test: '/api/test',
      engagements: '/api/engagement-requests'

    }
  });
});

// Basic settings route with minimal middleware
app.get("/basic-settings", isLoggedIn, (req, res) => {
  console.log("Basic settings route hit!");
  res.send("Basic settings page - logged in user!");
});

// Original settings route
app.get("/settings", isLoggedIn, async (req, res) => {
  console.log("\n=== Settings Route ===");
  try {
    // Get feature flags
    const calendarRulesEnabled = isFeatureEnabled("calendarRules");
    const userRoleSystemEnabled = isFeatureEnabled("userRoleSystem");
    const nomsigApprovalEnabled = isFeatureEnabled("NOMSIG_APPROVAL_SYSTEM");
    const crfGenerationEnabled = isFeatureEnabled("CRF_GENERATION");

    console.log("Feature Flag Values:", {
      calendarRules: calendarRulesEnabled,
      userRoleSystem: userRoleSystemEnabled,
      nomsigApproval: nomsigApprovalEnabled,
      crfGeneration: crfGenerationEnabled
    });

    const features = {
      calendarRules: calendarRulesEnabled,
      userRoleSystem: userRoleSystemEnabled,
      nomsigApproval: nomsigApprovalEnabled,
      crfGeneration: crfGenerationEnabled
    };

    // Mock data for testing
    const allCountries = Object.keys(DEFAULT_COUNTRIES);
    const nomsigCountries = allCountries.filter(country => DEFAULT_COUNTRIES[country].nomSig);
    const countryRules = DEFAULT_COUNTRIES;
    const userRole = req.session.userRole || 'coordinator';

    console.log("Rendering settings with data:", {
      features,
      userRole,
      hasAllCountries: !!allCountries,
      countryCount: allCountries.length
    });

    res.render("settings", { 
      features,
      allCountries,
      nomsigCountries,
      countryRules,
      userRole
    });
  } catch (error) {
    console.error("Error in settings route:", error);
    res.status(500).send("Error loading settings: " + error.message);
  }
});

// Now check if that works, if it does, we'll add the real implementation
console.log("=== Settings Route Registered ===\n");

app.get("/calendar-rules", isLoggedIn, async (req, res) => {
  try {
    const features = {
      userRoleSystem: isFeatureEnabled("userRoleSystem"),
      calendarRules: isFeatureEnabled("calendarRules")
    };
    res.render("calendar-rules", { 
      features,
      currentRole: req.session.userRole || 'coordinator'
    });
  } catch (error) {
    console.error("Error in calendar rules route:", error);
    res.status(500).send("Error loading calendar rules: " + error.message);
  }
});

app.get("/feature-flags", isLoggedIn, async (req, res) => {
  try {
    const features = {
      userRoleSystem: isFeatureEnabled("userRoleSystem"),
      calendarRules: isFeatureEnabled("calendarRules")
    };
    res.render("feature-flags", { features });
  } catch (error) {
    console.error("Error in feature flags route:", error);
    res.status(500).send("Error loading feature flags: " + error.message);
  }
});

app.get("/engagement/:id", isLoggedIn, async (req, res) => {
  try {
    const features = {
      userRoleSystem: isFeatureEnabled("userRoleSystem"),
      calendarRules: isFeatureEnabled("calendarRules")
    };
    const engagement = await EngagementRequest.findById(req.params.id).lean();
    if (!engagement) {
      return res.status(404).send("Engagement not found");
    }
    res.render("engagement-details", { engagement, features });
  } catch (error) {
    console.error("Error fetching engagement details:", error);
    res.status(500).send("Error loading engagement details");
  }
});

// Add test route for feature flags
app.get("/test-features", (req, res) => {
  console.log("\n=== Testing Feature Flags ===");
  const features = {
    calendarRules: isFeatureEnabled("calendarRules"),
    userRoleSystem: isFeatureEnabled("userRoleSystem"),
    nomsigApproval: isFeatureEnabled("NOMSIG_APPROVAL_SYSTEM"),
    crfGeneration: isFeatureEnabled("CRF_GENERATION")
  };
  console.log("Feature Flags Test:", features);
  res.json(features);
});

// 10. UTILITY ROUTES
app.get("/test", (req, res) => {
  console.log("Test route hit");
  res.send("Test route working");
});

app.get("/check-static", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "public", "styles.css"), (err) => {
    if (err) {
      console.error("Error sending styles.css:", err);
      res.status(500).send("Error loading static file");
    }
  });
});

app.get("/keepalive", (req, res) => {
  res.send("Server is alive");
});

// 11. API ROUTES
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working" });
});

app.get("/api/check-data", async (req, res) => {
  try {
    const count = await EngagementRequest.countDocuments();
    res.json({ message: "Database connected", count: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/engagement-requests/:id/assign-ec", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, you would:
    // 1. Verify the user has manager role
    // 2. Update the engagement request with EC assignment status
    // 3. Notify the EC
    // For now, we'll just send a success response
    
    res.json({ success: true, message: "Successfully assigned to EC" });
  } catch (error) {
    console.error("Error assigning to EC:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to assign to EC" 
    });
  }
});

// Mount API routes first
const apiRoutes = require("./src/routes/api");
console.log("Mounting API routes at /api");
app.use("/api", apiRoutes);

// Mount team routes
const teamRoutes = require('./src/routes/team');
app.use('/', teamRoutes);

// Role switching route
app.post('/api/switch-role', isLoggedIn, (req, res) => {
  const { role } = req.body;
  if (['coordinator', 'manager', 'owner'].includes(role)) {
    req.session.userRole = role;
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        res.status(500).json({ success: false, message: 'Failed to switch role' });
      } else {
        res.json({ success: true });
      }
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid role' });
  }
});

// 12. ERROR HANDLERS
app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).send("404 - Page not found");
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// 13. SERVER STARTUP
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server root directory: ${__dirname}`);
  console.log(`Public directory: ${path.join(__dirname, "src", "public")}`);

  console.log("\n=== All Registered Routes ===");
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`Route: ${middleware.route.path}`);
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((layer) => {
        if (layer.route) {
          console.log(`Route: ${layer.route.path}`);
        }
      });
    }
  });
  console.log("=== End Routes List ===\n");

  // Log registered routes
  console.log("\n=== Registered Routes ===");
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(
        `${Object.keys(middleware.route.methods)} ${middleware.route.path}`
      );
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          console.log(
            `${Object.keys(handler.route.methods)} ${handler.route.path}`
          );
        }
      });
    }
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error("Server error:", error);
  }
});

console.log("Server initialization completed");
