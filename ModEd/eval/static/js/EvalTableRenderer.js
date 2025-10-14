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
    const unwantedFields = ['model', 'id', 'createdat', 'updatedat', 'deletedat', 'instructorid', 'courseid', 'studentid', 'quizid', 'instructor', 'course'];
    const filteredSchema = originalColumns.filter(col =>
      !unwantedFields.includes(col.name.toLowerCase()) &&
      col.type !== 'hidden' && 
      col.type !== '-' && 
      col.display !== false
    );
    
    return [...filteredSchema, ...this.customColumns];
  }
}
