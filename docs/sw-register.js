if ('serviceWorker' in navigator) {
  let refreshing = false;
  
  navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
          refreshing = true;
          window.location.reload();
      }
  });

  window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
          .then(registration => {
              console.log('서비스 워커가 성공적으로 등록되었습니다:', registration.scope);
          })
          .catch(error => {
              console.error('서비스 워커 등록 중 오류 발생:', error);
          });
  });
}
