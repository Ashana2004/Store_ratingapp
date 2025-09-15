export const showCenteredAlert = (message) => {
  const alertDiv = document.createElement('div');
  alertDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    border: 2px solid #6096c2;
    border-radius: 8px;
    padding: 20px 30px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    color: #333;
    text-align: center;
    max-width: 400px;
    word-wrap: break-word;
  `;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    document.body.removeChild(alertDiv);
  }, 3000);
};