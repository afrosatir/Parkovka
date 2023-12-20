fetch('/booking/get-history', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }})
    .then(response => response.json())
    .then(data => {
        if(data.length <= 0) {
            const emptyText = document.createElement('p');
            emptyText.classList = 'empty-text';
            emptyText.innerText = 'Вы еще ни разу не бронировали';
            HistoryCard.CARD_TARGET.append(emptyText);
        }
        data.forEach(element => {
            if(!element.status || !element.bookingData.carNumber) {
                return;
            }
            else {
                new HistoryCard(
                    element.bookingData.carNumber,
                    element.bookingData.startDate,
                    element.bookingData.startTime,
                    element.bookingData.endDate,
                    element.bookingData.endTime,
                    element.bookingData.address,
                    element.status)
            }
        });
    })