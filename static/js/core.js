class Modal {
    constructor(label, text) {
        this.main = document.querySelector('main');
        this.label = label;
        this.text = text;
        this.el = null;
        this.show();
    }

    init() {
        const oModal = document.querySelector('.modal');
        oModal?.remove();
    }

    show() {
        this.init();
        const el = document.createElement('div');
        el.classList.add('modal');
        el.innerHTML = `<div class="message-box">
        <p class="message-label">${this.label}</p>
        <p class="message-text">${this.text}</p>
        <div class="message-actions">
            <button class="goto">Закрыть</button>
        </div>
    </div>
    <div class="modal-dimming"></div>`;
        this.el = el;
        el.querySelector('button').addEventListener('click', () => {
            this.el.remove();
        });
        this.main.append(el);
    }
}

class HistoryCard {
    static CARD_TARGET = document.querySelector('#booking-cards-holder');

    constructor(carNumber, startDate, startTime, endDate, endTime, address, status) {
        this.carNumber = carNumber;
        this.startDateTime = {
            date: startDate,
            time: startTime
        };
        this.endDateTime = {
            date: endDate,
            time: endTime
        };
        this.address = address;
        this.status = status;
        this._create()
    }

    _nodeElement() {
        const status = () => {
            if (this.status == 0) return '<p class="status-current">Ожидание</p>';
            else if (this.status == 1) return '<p class="status">Оплачено</p>';
            else if (this.status == 2) return '<p class="status-reject">Отменен</p>';
        }
        const node = document.createElement('div');
        node.classList = 'prev-booking__card';
        node.innerHTML = `
            <div class="frame-content__car-info">
                <img src="./images/default.png" alt="">
                <p class="car-number">${this.carNumber} 98 RUS</p>
            </div>
            <div class="frame-content__info">
                <p class="datetime">Начало: ${this.startDateTime.date} ${this.startDateTime.time}</p>
                <p class="datetime">Окончание: ${this.endDateTime.date} ${this.endDateTime.time}</p>
                <p class="location">${this.address}</p>
                <div class="status"></div>
            </div>`;
        node.querySelector('.status').innerHTML = status();
        return node;
    }


    _create() {
        const element = this._nodeElement();
        HistoryCard.CARD_TARGET.append(element);
    }
}