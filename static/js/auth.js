const loginForm = document.querySelector('form');

loginForm.addEventListener('submit', event => {
    event.preventDefault();

    let formData = new FormData(event.target);

    fetch('/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData))
    })
    .then(response => response.json())
    .then(data => {
        if (data.success === 1) {
            window.location.href = 'profile';
        } else {
            new Modal('Ошибка', 'Пользователь с таким логином или паролем не найден. Проверьте валидность введенных данных!')
        }
    })
})