$(document).ready(function() {
  App.getInstance();
  
  const options = {
    button: '#update-sw',
    toast: '.notification-update',
  };

  new SW(options);
});