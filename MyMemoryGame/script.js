const MAX_PAIRS = 15;
const MIN_PAIRS = 5;
const CARD_BACK_IMAGE = "cardBack.jpg";

class Card {
    constructor(image) {
        this.image = image;
        this.flipped = false;
        this.matched = false;
    }

    isMatching(card) {
        return this.image === card.image;
    }

    flip() {
        this.flipped = !this.flipped;
    }

    update(cardElement) {
        cardElement.innerHTML = this.flipped || this.matched ? `<img src="${this.image}" alt="Card image">` : `<img src="${CARD_BACK_IMAGE}" alt="Card back">`;
    }
}

class CardDeck {
    constructor(images, numOfPairs) {
        this.cards = [];
        this.flippedCards = [];
        this.matchedCards = [];
        this.initialize(images, numOfPairs);
    }

    flipDeck() {
        for (let i = 0; i < this.amount; i++) {
            this.cards[i].flip();
        }
    }

    get amount() {
        return this.cards.length;
    }

    initialize(images, numOfPairs) {
        for (var i = 0; i < numOfPairs; i++) {
            this.cards.push(new Card(images[i]));
            this.cards.push(new Card(images[i]));
        }
        this.shuffle();
    }

    _swap(arr, i, j) {
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    shuffle() {
        for (let i = 0; i < this.amount; i++) {
            let random = Math.floor(Math.random() * this.amount);
            this._swap(this.cards, i, random);
        }
    }
}

class Leaderboard {
    constructor() {
        this.leaderboardKey = "leaderboard";
        this.maxSize = 10;
    }

    load() {
        let leaderboard = localStorage.getItem(this.leaderboardKey);
        return leaderboard ? JSON.parse(leaderboard) : [];
    }

    save(leaderboard) {
        localStorage.setItem(this.leaderboardKey, JSON.stringify(leaderboard));
    }

    update(name, numOfCards, time, moves) {
        let leaderboard = this.load();
        leaderboard.push({name, numOfCards, time, moves});
        leaderboard.sort((a, b) => a.time - b.time || a.moves - b.moves);
        if (leaderboard.length > this.maxSize) leaderboard.length = this.maxSize;
        this.save(leaderboard);
    }

    clear() {
        localStorage.removeItem(this.leaderboardKey);
    }

    render() {
        let leaderboard = this.load();
        let leaderboardHTML = `
    <table class='table'>
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Card Pairs</th>
                <th>Time</th>
                <th>Moves</th>
            </tr>
        </thead>
        <tbody>
            ${leaderboard.map((entry, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${entry.name}</td>
                    <td>${entry.numOfCards}</td>
                    <td>${entry.time}</td>
                    <td>${entry.moves}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    `;
        $('#leaderboard').html(leaderboardHTML); // Replace '#leaderboard' with the actual id of your HTML element
    }
}

class CardDeckRenderer {
    constructor(deck) {
        this.deck = deck;
    }

    render() {
        return this.deck.cards.map((card, i) => `<div class="col-3 col-md-2 my-1">
            <div class="card" id="card-${i}" onclick="cardClicked(${i})">
                ${card.flipped || card.matched ? `<img src="${card.image}" alt="Card image">` : `<img src="${CARD_BACK_IMAGE}" alt="Card back">`}
            </div>
        </div>`).join('');
    }
}

class Timer {
    constructor() {
        this.startTime = null;
        this.interval = null;
    }

    start() {
        this.startTime = Date.now();
        this.interval = setInterval(() => {
            const elapsedTime = Date.now() - this.startTime;
            const seconds = Math.floor(elapsedTime / 1000);
            const milliseconds = elapsedTime % 1000;
            $("#timer").text(`Time: ${seconds}.${milliseconds} s`);
        }, 1);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    reset() {
        this.stop();
        $("#timer").text("Time: 0 s");
    }
}

class Game {

    constructor(themeManager, leaderboard) {
        this.themeManager = themeManager;
        this.leaderboard = leaderboard;
        this.cards = null;
        this.moves = 0;
        this.renderer = null;
        this.numofpairs = 0;
        this.timer = new Timer();
        this.firstCardFlipped = false;
    }


    start(numOfPairs, theme) {
        this.numofpairs = numOfPairs;
        if (!this.themeManager.hasTheme(theme)) {
            debugger
            throw new Error(`Theme "${theme}" does not exist`);
        } else {
            this.themeManager.setTheme(theme);
        }
        this.cards = new CardDeck(this.themeManager.getTheme(), numOfPairs);
        this.renderer = new CardDeckRenderer(this.cards);
        this.quickShow();
    }

    quickShow() {
        setTimeout(() => {
            this.cards.flipDeck();
            this.render();
        }, 3000);
        this.cards.flipDeck();
        this.render()
    }

    render() {
        $("#game-board").html(this.renderer.render());
        $("#counter").text(`${this.moves} moves`);
    }

    end() {
        if (this.cards.matchedCards.length === this.cards.amount) {
            this.timer.stop();
            const playerName = $("#playerName").val();
            const numOfCards = this.numofpairs;
            this.leaderboard.update(playerName, numOfCards, $("#timer").text(), this.moves);

            // Display the modal
            $('#myModal').modal('show');

            $("#leaderboard").html(this.leaderboard.render());
            game.timer.reset()
            this.firstCardFlipped = false;
            $("#game").hide();
            $("#menu").show();
        }
    }

    incrementMoves() {
        this.moves++;
        this.render();
    }

    cardClicked(index) {
        if (this.cards.flippedCards.length === 2) {
            return;
        }

        let card = this.cards.cards[index];
        if (card.flipped || card.matched) {
            return;
        }
        //timer start
        if (!this.firstCardFlipped) {
            this.timer.start();
            this.firstCardFlipped = true;
        }

        card.flip();
        this.cards.flippedCards.push(card);

        let cardElement = document.getElementById(`card-${index}`);
        card.update(cardElement);

        if (this.cards.flippedCards.length === 2) {
            setTimeout(() => this.checkMatch(), 1000);
        }
    }

    checkMatch() {
        if (this.cards.flippedCards[0].isMatching(this.cards.flippedCards[1])) {
            this.cards.flippedCards.forEach(card => card.matched = true);
            this.cards.matchedCards.push(...this.cards.flippedCards);
        } else {
            this.cards.flippedCards.forEach(card => {
                card.flip();
                let cardIndex = this.cards.cards.indexOf(card);
                let cardElement = document.getElementById(`card-${cardIndex}`);
                card.update(cardElement);
            });
        }
        this.cards.flippedCards = [];
        this.incrementMoves();
        this.end();
    }

    reset() {
        this.moves = 0;
        this.timer.reset();
        this.firstCardFlipped = false;
        this.cards.cards.forEach((card, index) => {
            card.flipped = false;
            card.matched = false;
            let cardElement = document.getElementById(`card-${index}`);
            card.update(cardElement);
        });
        this.cards.matchedCards = [];
        this.cards.shuffle();
        this.quickShow();
    }
}

class ThemeManager {
    constructor() {
        this.themes = {
            circles: ["themes/circles/card1.jpg", "themes/circles/card2.jpg", "themes/circles/card3.jpg", "themes/circles/card4.jpg", "themes/circles/card5.jpg", "themes/circles/card6.jpg", "themes/circles/card7.jpg", "themes/circles/card8.jpg", "themes/circles/card9.jpg", "themes/circles/card10.jpg", "themes/circles/card11.jpg", "themes/circles/card12.jpg", "themes/circles/card13.jpg", "themes/circles/card14.jpg", "themes/circles/card15.jpg"],
            dragonball: ["themes/dragonball/1.jpg", "themes/dragonball/2.jpg", "themes/dragonball/3.jpg", "themes/dragonball/4.jpg", "themes/dragonball/5.jpg", "themes/dragonball/6.jpg", "themes/dragonball/7.jpg", "themes/dragonball/8.jpg", "themes/dragonball/9.jpg", "themes/dragonball/10.jpg", "themes/dragonball/11.jpg", "themes/dragonball/12.jpg", "themes/dragonball/13.jpg", "themes/dragonball/14.jpg", "themes/dragonball/15.jpg"],
            anime: ["themes/anime/1.jpg", "themes/anime/2.jpg", "themes/anime/3.jpg", "themes/anime/4.jpg", "themes/anime/5.jpg", "themes/anime/6.jpg", "themes/anime/7.jpg", "themes/anime/8.jpg", "themes/anime/9.jpg", "themes/anime/10.jpg", "themes/anime/11.jpg", "themes/anime/12.jpg", "themes/anime/13.jpg", "themes/anime/14.jpg", "themes/anime/15.jpg"],

        };
        this.currenttheme = '';
    }

    setTheme(theme) {
        this.currenttheme = theme;
    }

    getTheme() {
        return this.themes[this.getCurrentTheme()];
    }

    getCurrentTheme() {
        return this.currenttheme
    }

    hasTheme(themeName) {
        return themeName in this.themes;
    }
}

$("#game").hide();

$(document).ready(() => {
    const themeManager = new ThemeManager();
    const leaderboard = new Leaderboard();

    const game = new Game(themeManager, leaderboard);
    let numOfPairs = 0;
    let theme = '';

    leaderboard.load();
    leaderboard.render();

    $("#start-btn").click(() => {
        game.moves = 0;
        numOfPairs = parseInt($("#numOfPairs").val());
        theme = $("#themeSelect").val();
        console.log(numOfPairs)
        if (numOfPairs >= MIN_PAIRS && numOfPairs <= MAX_PAIRS && theme !== '') {
            $("#menu").hide();
            $("#game").show();
            game.start(numOfPairs, theme);
        } else {
            alert(`Enter a number between ${MIN_PAIRS} and ${MAX_PAIRS} and select a valid theme`);
        }
    });

    $("#reset-btn").click(() => {
        game.reset();
    });

    $("#menu-btn").click(() => {
        game.timer.reset()
        this.firstCardFlipped = false;
        $("#game").hide();
        $("#menu").show();
    });
    $("#clear-leaderboard-btn").click(() => {
        game.leaderboard.clear();
        $("#leaderboard").empty();
    });


    window.cardClicked = index => game.cardClicked(index);
});
