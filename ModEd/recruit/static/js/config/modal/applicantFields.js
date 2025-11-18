if (typeof window !== 'undefined' && !window.ApplicantModalConfig) {
  window.ApplicantModalConfig = {
    hideColumns: [
      'created_at', 'updated_at', 'deleted_at',
      'tgat1', 'tgat2', 'tgat3',
      'tpat1', 'tpat2', 'tpat3', 'tpat4', 'tpat5',
      'portfolio_url', 'family_income',
      'math_grade', 'science_grade', 'english_grade',
      'applicant_round_information', 'address'
    ],

    applyHideColumns(schema) {
      return schema.map(col => {
        if (this.hideColumns.includes(col.name)) {
          return { ...col, display: false };
        }
        return col;
      });
    }
  };
}


