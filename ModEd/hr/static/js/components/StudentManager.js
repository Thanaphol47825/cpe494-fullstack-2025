// Sub-module for Student Management features
class StudentManager {
    constructor() {
        console.log('StudentManager sub-module loaded')
    }

    // Advanced student search functionality
    searchStudents(query) {
        console.log(`Searching students with query: ${query}`)
        return [
            { id: 'STU001', name: 'Alice Johnson', program: 'Computer Science' },
            { id: 'STU002', name: 'Bob Smith', program: 'Mathematics' },
            { id: 'STU003', name: 'Carol Davis', program: 'Physics' }
        ].filter(student => 
            student.name.toLowerCase().includes(query.toLowerCase()) ||
            student.program.toLowerCase().includes(query.toLowerCase())
        )
    }

    // Generate student report
    generateStudentReport(studentId) {
        console.log(`Generating report for student: ${studentId}`)
        return {
            grades: [
                { subject: 'Mathematics', grade: 'A' },
                { subject: 'Physics', grade: 'B+' },
                { subject: 'Computer Science', grade: 'A-' }
            ],
            attendance: '95%',
            status: 'Good Standing'
        }
    }

    // Render enhanced student list with search
    renderEnhancedStudentList(container) {
        container.innerHTML = `
            <div class="enhanced-student-manager">
                <div style="margin-bottom: 20px;">
                    <input type="text" id="studentSearch" placeholder="Search students..." 
                           style="width: 300px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <button onclick="window.studentManager.performSearch()" 
                            style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; margin-left: 10px;">
                        Search
                    </button>
                </div>
                <div id="studentResults">
                    <p>Enter a search term to find students...</p>
                </div>
            </div>
        `
        
        // Make this instance globally accessible for onclick handlers
        window.studentManager = this
        
        // Add enter key support
        document.getElementById('studentSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch()
            }
        })
    }

    performSearch() {
        const query = document.getElementById('studentSearch').value
        const results = this.searchStudents(query)
        const resultsContainer = document.getElementById('studentResults')
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>No students found matching your search.</p>'
            return
        }
        
        resultsContainer.innerHTML = `
            <h4>Search Results (${results.length} found):</h4>
            <div style="display: grid; gap: 10px;">
                ${results.map(student => `
                    <div style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; background: #f8f9fa;">
                        <strong>${student.name}</strong>
                        <div>Student ID: ${student.id} | Program: ${student.program}</div>
                        <div style="margin-top: 10px;">
                            <a routerLink="hr/students/${student.id.toLowerCase()}" 
                               style="background: #007bff; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px; margin-right: 5px;">
                                View Details
                            </a>
                            <button onclick="window.studentManager.showReport('${student.id}')" 
                                    style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 3px;">
                                Show Report
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `
    }

    showReport(studentId) {
        const report = this.generateStudentReport(studentId)
        alert(`Report for ${studentId}:\nGrades: ${JSON.stringify(report.grades, null, 2)}\nAttendance: ${report.attendance}\nStatus: ${report.status}`)
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.StudentManager = StudentManager
}