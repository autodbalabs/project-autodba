<script>
  // No props needed for this component
</script>

<div class="loading-container">
  <div class="loading-animation">
    <div class="database-icon">🗄️</div>
    <div class="pulse-dots">
      <span class="dot">.</span>
      <span class="dot">.</span>
      <span class="dot">.</span>
    </div>
  </div>
  <div class="loading-message">
    <p>Analyzing your database</p>
    <p class="sub-message">Gathering performance insights</p>
  </div>
</div>

<style>
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
  }

  .loading-animation {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }

  .database-icon {
    font-size: 48px;
    margin-bottom: 16px;
    animation: float 2s ease-in-out infinite;
  }

  .pulse-dots {
    display: flex;
    gap: 4px;
  }

  .dot {
    font-size: 24px;
    animation: pulse 1.5s ease-in-out infinite;
    color: var(--text-light);
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  .loading-message {
    color: var(--text-light);
  }

  .loading-message p {
    margin: 0;
    font-size: 1.1em;
    font-weight: 500;
  }

  .sub-message {
    font-size: 0.9em !important;
    color: var(--text-placeholder);
    margin-top: 8px !important;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.2;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
  }
</style> 