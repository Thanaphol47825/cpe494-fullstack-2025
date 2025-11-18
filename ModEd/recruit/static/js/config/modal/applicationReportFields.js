if (typeof window !== 'undefined' && !window.ApplicationReportModalConfig) {
  window.ApplicationReportModalConfig = {
    excludeFields: [
      'applicant_id',
      'application_rounds_id',
      'faculty_id',
      'department_id',
      'program'
    ],

    resolveAdditionalFields(data, context = {}) {
      const applicant = data.applicant || data.Applicant;
      const applicationRound = data.application_round || data.ApplicationRound;
      const faculty = data.faculty || data.Faculty;
      const department = data.department || data.Department;
      
      const applicantName = `${applicant?.first_name || ''} ${applicant?.last_name || ''}`.trim() || 'N/A';
      const programTypeMap = context.programTypeMap || {};
      const programLabel = programTypeMap[data.program] || data.program || 'N/A';
      
      const statusValue = data.application_statuses || data.ApplicationStatuses || 'Pending';
      const statusLabel = statusValue.charAt(0).toUpperCase() + statusValue.slice(1).toLowerCase();
      
      return [
        { label: 'Applicant', value: `${applicantName} (ID: ${data.applicant_id || 'N/A'})` },
        { label: 'Email', value: applicant?.email || 'N/A' },
        { label: 'Application Round', value: `${applicationRound?.round_name || applicationRound?.name || 'N/A'} (ID: ${data.application_rounds_id || 'N/A'})` },
        { label: 'Faculty', value: `${faculty?.name || 'N/A'} (ID: ${data.faculty_id || 'N/A'})` },
        { label: 'Department', value: `${department?.name || 'N/A'} (ID: ${data.department_id || 'N/A'})` },
        { label: 'Program Type', value: `${programLabel} (ID: ${data.program ?? 'N/A'})` },
        { label: 'Application Status', value: statusLabel }
      ];
    }
  };
}
