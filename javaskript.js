form.addEventListener('submit', e => {
  e.preventDefault();
  msg.textContent = '';
  
  const data = new FormData(form);

  fetch('order.php', {
    method: 'POST',
    body: data
  })
  .then(res => res.json())
  .then(res => {
    if(res.status === 'success'){
      msg.style.color = '#22c55e';
      form.reset();
    } else {
      msg.style.color = 'red';
    }
    msg.textContent = res.msg;
    setTimeout(() => msg.textContent='', 6000);
  })
  .catch(err => {
    msg.style.color = 'red';
    msg.textContent = '❌ Something went wrong!';
  });
});
