'use strict';

(function() {

    var socket = io();
    let body = document.body;
    let game = document.querySelector('#game');
    let dice = document.querySelector('#dice');
    let chance = document.querySelector('#chance');
    let vault = document.querySelector('#vault');
    let cards = [];
    for (let i = 0; i <= 427; i++) {
        cards.push(document.querySelector('#card_' + i))
    }
    let movingCard = {
        type : 'move',
        id: null,
        x: null,
        y: null
    };
    let pawn = false;
    let chanceCards = [
        'Банката ви изплаща дивидент от $50',
        'Глоба за шофиране в нетрезво състояние $20',
        'Платете училищни такси $150',
        'Продължете до площад "МАКЕДОНИЯ". Ако преминете през "СТАРТ", получавате $200',
        'продължете до "БОЯНА"',
        'продължете до "СТАРТ"',
        'Върнете се три места назад',
        'Връщат ви заем за строителство. Получавате $150',
        'Продължете до "ОБОРИЩЕ". Ако преминете през "СТАРТ", получавате $200',
        'Отивате директно в затвора',
        'Продължавате до "ПЛОВДИВ". Ако преминете през "СТАРТ", получавате $200',
        'Печелите турнир по решаване на кръстословици. Получавате $100',
        'Основен ремонт на всичките ви сгради. За всяка къща платете по $25. За всеки хотел платете по $100',
        'Плащате за ремонт на улици и пътища. $40 за всяка къща. $115 за всеки хотел',
        'Глоба за превишена скорост $15',
        'Излезте от затвора без пари'];
    let vaultCards = [
        'Такса за лекар. Платете $50',
        'Имате рожден ден. Получавате по $10 от всеки играч',
        'Платете глоба от $10 или изтеглете "ШАНС"',
        'Получавате $25 лихва по облигации',
        'Върнете се на "БОТЕВГРАДСКО ШОСЕ"',
        'Продължете до "СТАРТ"',
        'Получавате наследство от $100',
        'Олихвяване на влог. Получавате $100',
        'Плащате $50 за застраховка живот',
        'Отивате директно в затвора',
        'Връщат ви надвзети данъци. Получавате $20',
        'Печелите второ място в конкурс по красота. Получавате $10',
        'банкова грешка във ваша полза. Получавате $200',
        'Продавате акции и получавате $50',
        'Платете $100 на болница',
        'Излезте от затвора без пари'];

    dice.addEventListener('contextmenu', throttle(rightClick, 5000), false);
    chance.addEventListener('contextmenu', throttle(rightClick, 5000), false);
    vault.addEventListener('contextmenu', throttle(rightClick, 5000), false);

    for (let card of cards) {
        card.addEventListener('click', click, false);
        game.addEventListener('mousemove', throttle(mouseMove, 20), false);
    }

    socket.on('monopoly', function(data) {
        if (data.type == 'move') {
            movingCard.id = data.id;
            if (data.id) {
                cards[data.id].style.left = data.x + 'px';
                cards[data.id].style.top = data.y + 'px';
            }
        } else {
            console.log(data);
            rightClick(null, data);
        }
    });

    function rightClick(e, data) {
        if (e) {
            e.preventDefault();
            let temp;
            if (e.target.id == 'dice') {
                temp = rng(6, 1) + ' & ' + rng(6, 1);
                dice.innerHTML = temp;
                socket.emit('monopoly', {type: 'dice', value: temp});
            } else if (e.target.id == 'chance') {
                temp = chanceCards[rng(15, 0)];
                chance.innerHTML = temp;
                socket.emit('monopoly', {type: 'chance', value: temp});
            } else if (e.target.id == 'vault') {
                temp = vaultCards[rng(15, 0)];
                vault.innerHTML = temp;
                socket.emit('monopoly', {type: 'vault', value: temp});
            }
        }
        if (data) {
            if (data.type == 'dice') {
                dice.innerHTML = data.value;
            } else if (data.type == 'chance') {
                chance.innerHTML = data.value;
            } else if (data.type == 'vault') {
                vault.innerHTML = data.value;
            }
        }
    }

    function rng(a, b) {
        return Math.floor(Math.random() * a + b);
    }

    function click(e) {
        e.preventDefault();
        if (!movingCard.id) {
            movingCard.id = this.id.slice(5);
            if (e.target.classList && e.target.classList.contains('pawn')) {
                pawn = true;
            }
        } else {
            movingCard.id = null;
            movingCard.x = null;
            movingCard.y = null;
            pawn = false;
        }
        this.classList.toggle('selected');
        socket.emit('monopoly', movingCard);
    }

    function mouseMove(e) {
        if (movingCard.id) {
            e.preventDefault();
            movingCard.x = e.clientX - 40;
            movingCard.y = e.clientY - 70;
            if (pawn) {
                movingCard.x = e.clientX - 25;
                movingCard.y = e.clientY - 25;
            }
            cards[movingCard.id].style.left = movingCard.x + 'px';
            cards[movingCard.id].style.top = movingCard.y + 'px';

            socket.emit('monopoly', movingCard);
        }
    }

    // limit the number of events per second
    function throttle(callback, delay) {
        var previousCall = new Date().getTime();
        return function() {
            var time = new Date().getTime();

            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }

})();
