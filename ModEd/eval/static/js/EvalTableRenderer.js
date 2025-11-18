/**
 * EvalTableRenderer - Extends AdvanceTableRender to filter out unwanted fields
 * This renderer filters out system fields like 'model', 'id', 'createdat', etc.
 */
class EvalTableRenderer extends AdvanceTableRender {
  constructor(application, options = {}) {
    super(application, options);
  }

  /**
   * Override getAllColumns to filter out unwanted fields
   */
  getAllColumns() {
    // Get the original columns from parent class
    const originalColumns = this.schema || [];
    
    // Filter out unwanted fields
    const unwantedFields = ['model', 'id', 'createdat', 'updatedat', 'deletedat', 'instructorid', 'courseid', 'studentid', 'quizid', 'instructor', 'course', 'assignment', 'status'];
    // Get list of custom column names (to hide original versions)
    const customColumnNames = (this.customColumns || []).map(c => c.name.toLowerCase());
    // Date fields that should be hidden if we have custom formatted versions
    const dateFieldsToHide = ['duedate', 'startdate', 'submittedat', 'startedat'];
    // Fields that should be hidden if we have custom formatted versions (not just dates)
    const customFieldsToHide = ['attachmentpath'];
    
    const filteredSchema = originalColumns.filter(col => {
      const colNameLower = col.name.toLowerCase();
      // Hide if in unwanted fields
      if (unwantedFields.includes(colNameLower)) return false;
      // Hide original date fields if we have custom formatted versions with the same name
      if (dateFieldsToHide.includes(colNameLower) && customColumnNames.includes(colNameLower)) return false;
      // Hide fields that have custom formatted versions
      if (customFieldsToHide.includes(colNameLower) && customColumnNames.includes(colNameLower)) return false;
      // Hide hidden fields
      if (col.type === 'hidden' || col.type === '-' || col.display === false) return false;
      return true;
    });
    
    return [...filteredSchema, ...this.customColumns];
  }
}
