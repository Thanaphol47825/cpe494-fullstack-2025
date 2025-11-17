if (typeof window !== 'undefined' && !window.InterviewModalConfig) {
  window.InterviewModalConfig = {
    excludeFields: [
      'instructor_id',
      'application_report_id',
      'evaluated_at',
      'scheduled_appointment',
      'criteria_scores'
    ],

    resolveAdditionalFields(data) {
      const instructor = data.Instructor || data.instructor;
      const applicationReport = data.ApplicationReport || data.application_report;
      const applicant = applicationReport?.applicant || applicationReport?.Applicant;
      
      const instructorName = instructor ? `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim() : 'N/A';
      const applicantName = applicant ? `${applicant.first_name || ''} ${applicant.last_name || ''}`.trim() : 'N/A';
      
      return [
        { label: 'Instructor', value: `${instructorName} (ID: ${data.instructor_id || 'N/A'})` },
        { label: 'Application Report', value: `Report #${data.application_report_id || 'N/A'}` },
        { label: 'Applicant', value: `${applicantName} (ID: ${applicationReport?.applicant_id || 'N/A'})` },
        { label: 'Applicant Email', value: applicant?.email || 'N/A' },
        { label: 'Scheduled Appointment', value: data.scheduled_appointment ? new Date(data.scheduled_appointment).toLocaleString() : 'N/A' },
        { label: 'Evaluated At', value: data.evaluated_at ? new Date(data.evaluated_at).toLocaleString() : 'N/A' }
      ];
    }
  };
}
