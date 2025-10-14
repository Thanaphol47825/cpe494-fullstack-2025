/**
 * EvalFormRenderer - Extends AdvanceFormRender to filter out unwanted fields
 * This renderer filters out system fields like 'model', 'id', 'createdat', etc.
 */
class EvalFormRenderer extends AdvanceFormRender {
  constructor(application, options = {}) {
    super(application, options);
  }

  /**
   * Override loadSchema to filter out unwanted fields
   */
  async loadSchema() {
    const path = this.modelPath || this.config.modelPath;
    if (!path) {
      throw new Error('Model path is required for schema loading');
    }

    this.isLoading = true;

    try {
      // Load schema from API
      let response = await fetch(`${RootURL}/api/modelmeta/${path}`);

      if (!response.ok) {
        throw new Error(`Failed to load schema: ${response.status} ${response.statusText}`);
      }

      const rawSchema = await response.json();

      // Filter out unwanted fields
      const unwantedFields = ['model', 'id', 'createdat', 'updatedat', 'deletedat', 'instructorid', 'courseid', 'studentid', 'quizid'];
      this.schema = rawSchema.filter(field => 
        !unwantedFields.includes(field.name.toLowerCase())
      );

      return this.schema;

    } catch (error) {
      console.error("Error loading schema:", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
}

