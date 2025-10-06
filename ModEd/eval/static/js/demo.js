// Eval Module Demo Initialization
console.log('Initializing Eval Module Demo...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Initialize the EvalApplication
    const evalApp = new EvalApplication();
    
    console.log('Eval Module Demo initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Eval Module Demo:', error);
  }
});
