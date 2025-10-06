// Sub-module for Leave Management features
class LeaveManager {
    constructor() {
        console.log('LeaveManager sub-module loaded')
        this.leaveTypes = [
            'Annual Leave',
            'Sick Leave',
            'Personal Leave',
            'Emergency Leave',
            'Study Leave'
        ]
    }

    // Calculate leave balance
    calculateLeaveBalance(employeeId, leaveType) {
        // Mock calculation
        const balances = {
            'Annual Leave': 20,
            'Sick Leave': 10,
            'Personal Leave': 5,
            'Emergency Leave': 3,
            'Study Leave': 15
        }
        return balances[leaveType] || 0
    }

    // Render leave request form
    renderLeaveRequestForm(container) {
        container.innerHTML = `
            <div class="leave-request-form">
                <h3>📝 Leave Request Form</h3>
                
                <form style="max-width: 600px; margin: 20px 0;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">Leave Type:</label>
                        <select id="leaveType" onchange="window.leaveManager.updateBalance()" 
                                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            ${this.leaveTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
                        </select>
                        <div id="leaveBalance" style="margin-top: 5px; font-size: 0.9em; color: #666;"></div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px;">Start Date:</label>
                            <input type="date" id="startDate" 
                                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px;">End Date:</label>
                            <input type="date" id="endDate" 
                                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                    </div>
                    
                    <div style="margin: 15px 0;">
                        <label style="display: block; margin-bottom: 5px;">Reason:</label>
                        <textarea id="leaveReason" rows="4" 
                                  style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                                  placeholder="Please provide a reason for your leave request..."></textarea>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <button type="button" onclick="window.leaveManager.submitLeave()" 
                                style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 4px; margin-right: 10px;">
                            Submit Request
                        </button>
                        <a routerLink="hr/leave" 
                           style="background: #6c757d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                           Cancel
                        </a>
                    </div>
                </form>
            </div>
        `
        
        // Make this instance globally accessible
        window.leaveManager = this
        
        // Initialize with first leave type
        this.updateBalance()
    }

    updateBalance() {
        const leaveType = document.getElementById('leaveType').value
        const balance = this.calculateLeaveBalance('current_user', leaveType)
        document.getElementById('leaveBalance').textContent = `Available: ${balance} days`
    }

    submitLeave() {
        const leaveType = document.getElementById('leaveType').value
        const startDate = document.getElementById('startDate').value
        const endDate = document.getElementById('endDate').value
        const reason = document.getElementById('leaveReason').value
        
        if (!startDate || !endDate || !reason.trim()) {
            alert('Please fill in all required fields.')
            return
        }
        
        // Calculate days
        const start = new Date(startDate)
        const end = new Date(endDate)
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
        
        console.log('Leave request submitted:', {
            type: leaveType,
            startDate,
            endDate,
            days,
            reason
        })
        
        alert(`Leave request submitted successfully!\nType: ${leaveType}\nDuration: ${days} days\nFrom: ${startDate} to ${endDate}`)
        
        // Navigate back to leave management
        location.hash = 'hr/leave'
    }

    // Render leave history
    renderLeaveHistory(container) {
        const mockHistory = [
            { id: 1, type: 'Annual Leave', startDate: '2024-01-15', endDate: '2024-01-19', status: 'Approved', days: 5 },
            { id: 2, type: 'Sick Leave', startDate: '2024-02-10', endDate: '2024-02-10', status: 'Approved', days: 1 },
            { id: 3, type: 'Personal Leave', startDate: '2024-03-05', endDate: '2024-03-07', status: 'Pending', days: 3 }
        ]
        
        container.innerHTML = `
            <div class="leave-history">
                <h3>📊 Leave History</h3>
                
                <div style="margin: 20px 0;">
                    ${mockHistory.map(leave => `
                        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; background: #f8f9fa; margin-bottom: 10px;">
                            <div style="display: flex; justify-content: between; align-items: center;">
                                <div>
                                    <strong>${leave.type}</strong> - ${leave.days} day(s)
                                    <div>From: ${leave.startDate} to ${leave.endDate}</div>
                                </div>
                                <div>
                                    <span style="padding: 4px 8px; border-radius: 3px; font-size: 0.85em; background: ${leave.status === 'Approved' ? '#d4edda' : '#fff3cd'}; color: ${leave.status === 'Approved' ? '#155724' : '#856404'};">
                                        ${leave.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 20px;">
                    <a routerLink="hr/leave/create" 
                       style="background: #28a745; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">
                       + New Leave Request
                    </a>
                </div>
            </div>
        `
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.LeaveManager = LeaveManager
}
