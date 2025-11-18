<div id="view-detail-modal-{{modalId}}" class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
  <div class="modal-content" style="background: white; border-radius: 8px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

    <!-- Modal Header -->
    <div style="padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size: 1.25rem; font-weight: 600; color: #1f2937;">{{title}}</h3>
      <button onclick="closeCommonViewModal('{{modalId}}')" style="color: #6b7280; cursor: pointer; background: none; border: none; font-size: 1.5rem; line-height: 1; padding: 0; width: 24px; height: 24px;">&times;</button>
    </div>

    <!-- Modal Body -->
    <div style="padding: 1.5rem;">
      <div id="view-detail-content-{{modalId}}">
        <!-- Content will be rendered here -->
      </div>

      <!-- Loading State -->
      <div id="loading-{{modalId}}" class="hidden" style="text-align: center; padding: 2rem;">
        <p style="color: #6b7280;">Loading...</p>
      </div>

      <!-- Error Message -->
      <div id="error-message-{{modalId}}" class="hidden" style="background: #fee; border: 1px solid #fcc; border-radius: 4px; padding: 1rem; color: #c00;">
        <span id="error-text-{{modalId}}"></span>
      </div>
    </div>

    <!-- Modal Footer -->
    <div style="padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; background: #f9fafb; border-radius: 0 0 8px 8px;">
      <button type="button" onclick="closeCommonViewModal('{{modalId}}')" class="btn-home" style="padding: 0.5rem 1rem; width: 100%;">
        Close
      </button>
    </div>
  </div>
</div>
