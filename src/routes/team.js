const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { isLoggedIn, isManager } = require('../middleware/auth');

// Get team page
router.get('/my-team', isLoggedIn, isManager, async (req, res) => {
    try {
        const team = await Team.findOne({ managerId: req.session.userId });
        res.render('my-team', { 
            team,
            businessUnit: req.session.businessUnit,
            currentRole: req.session.userRole,
            features: {
                calendarRules: true,
                userRoleSystem: true
            }
        });
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).send('Error loading team page');
    }
});

// API Routes

// Get team member
router.get('/api/team/member/:id', isLoggedIn, isManager, async (req, res) => {
    try {
        const team = await Team.findOne({ 
            managerId: req.session.userId,
            'members._id': req.params.id 
        });
        const member = team.members.id(req.params.id);
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch member details' });
    }
});

// Add team member
router.post('/api/team/member', isLoggedIn, isManager, async (req, res) => {
    try {
        let team = await Team.findOne({ managerId: req.session.userId });
        
        if (!team) {
            team = new Team({
                managerId: req.session.userId,
                businessUnit: req.session.businessUnit,
                members: []
            });
        }

        team.members.push({
            ...req.body,
            businessUnit: team.businessUnit
        });

        await team.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add team member' });
    }
});

// Update team member
router.put('/api/team/member/:id', isLoggedIn, isManager, async (req, res) => {
    try {
        const team = await Team.findOne({ 
            managerId: req.session.userId,
            'members._id': req.params.id 
        });

        const member = team.members.id(req.params.id);
        Object.assign(member, req.body);
        await team.save();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update team member' });
    }
});

// Remove team member
router.delete('/api/team/member/:id', isLoggedIn, isManager, async (req, res) => {
    try {
        const team = await Team.findOne({ managerId: req.session.userId });
        team.members.pull(req.params.id);
        await team.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove team member' });
    }
});

module.exports = router;
