// Handle role-based UI visibility
function handleRoleBasedUI() {
    const currentRole = sessionStorage.getItem('selectedRole') || 'coordinator';
    
    // Elements to show/hide based on role
    const calendarRulesLink = document.querySelector('a[href="/calendar-rules"]');
    const myTeamLink = document.querySelector('a[href="/my-team"]');
    const settingsLink = document.querySelector('.settings-link');
    
    // Hide all role-specific elements first
    if (calendarRulesLink) calendarRulesLink.style.display = 'none';
    if (myTeamLink) myTeamLink.style.display = 'none';
    if (settingsLink) settingsLink.style.display = 'none';

    // Show elements based on role
    if (currentRole === 'manager') {
        if (calendarRulesLink) calendarRulesLink.style.display = '';
        if (myTeamLink) myTeamLink.style.display = '';
        if (settingsLink) settingsLink.style.display = '';
    } else if (currentRole === 'coordinator') {
        if (settingsLink) settingsLink.style.display = '';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', handleRoleBasedUI);

// Update UI when role is switched
async function switchRole(role) {
    sessionStorage.setItem('selectedRole', role);
    
    try {
        const response = await fetch('/api/switch-role', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role })
        });
        
        if (response.ok) {
            location.reload();
        }
    } catch (error) {
        console.error('Error switching role:', error);
    }
}
