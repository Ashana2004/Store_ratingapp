// Show a centered alert dialog
export const showCenteredAlert = (message, duration = 3000) => {
  // Remove any existing alerts first
  const existingAlerts = document.querySelectorAll('.centered-alert');
  existingAlerts.forEach(alert => document.body.removeChild(alert));

  // Create new alert
  const alertDiv = document.createElement('div');
  alertDiv.className = 'centered-alert';
  alertDiv.textContent = message;
  
  // Add to body
  document.body.appendChild(alertDiv);

  // Remove after duration
  setTimeout(() => {
    if (alertDiv && alertDiv.parentNode === document.body) {
      document.body.removeChild(alertDiv);
    }
  }, duration);
};