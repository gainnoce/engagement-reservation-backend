document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('memberModal');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const closeBtn = document.getElementsByClassName('close')[0];
    const memberForm = document.getElementById('memberForm');
    
    // Open modal for adding new member
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', function() {
            memberForm.reset();
            memberForm.dataset.mode = 'add';
            modal.style.display = 'block';
        });
    }

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle form submission
    if (memberForm) {
        memberForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = {
                name: document.getElementById('memberName').value,
                email: document.getElementById('memberEmail').value,
                role: document.getElementById('memberRole').value
            };

            const mode = memberForm.dataset.mode;
            const memberId = memberForm.dataset.memberId;
            
            try {
                const response = await fetch(`/api/team/member${mode === 'edit' ? `/${memberId}` : ''}`, {
                    method: mode === 'edit' ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    alert('Failed to save team member');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while saving');
            }
        });
    }

    // Edit member
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', async function() {
            const memberId = this.dataset.id;
            try {
                const response = await fetch(`/api/team/member/${memberId}`);
                const member = await response.json();
                
                document.getElementById('memberName').value = member.name;
                document.getElementById('memberEmail').value = member.email;
                document.getElementById('memberRole').value = member.role;
                
                memberForm.dataset.mode = 'edit';
                memberForm.dataset.memberId = memberId;
                modal.style.display = 'block';
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to load member details');
            }
        });
    });

    // Remove member
    document.querySelectorAll('.remove-button').forEach(button => {
        button.addEventListener('click', async function() {
            if (confirm('Are you sure you want to remove this team member?')) {
                const memberId = this.dataset.id;
                try {
                    const response = await fetch(`/api/team/member/${memberId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        window.location.reload();
                    } else {
                        alert('Failed to remove team member');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('An error occurred while removing the member');
                }
            }
        });
    });
});
