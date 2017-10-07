const container = document.querySelector('#app');
const audio = new Audio('https://notificationsounds.com/soundfiles/5b69b9cb83065d403869739ae7f0995e/file-sounds-937-job-done.mp3');

const kJoinScreen = 0;
const kGameScreen = 1;

class Connect4 {
    constructor() {
        this.screen = kJoinScreen;
        this.boardname = undefined;
        this.tilesprepared = false;
        this.color = 1;
        this.stateCheckInterval = undefined;
    }

    setupStateCheckInterval() {
        this.stateCheckInterval = setInterval(() => {
            if (this.screen === kGameScreen) {
                this.render();
            }
        }, 500);
    }

    render() {
        switch (this.screen) {
        case kJoinScreen: {
            container.className = '';

            this.clearScreen();
            const inputfield_container = document.createElement('form');
            const name_inputfield = document.createElement('input');
            const name_submit = document.createElement('input');
            const color_selector = document.createElement('select');

            inputfield_container.id = 'inputfield_container';
            name_inputfield.id = 'name_inputfield';
            name_inputfield.type = 'text';
            name_inputfield.className += 'loginscreen_inputs';
            name_inputfield.placeholder = 'Board name';
            name_submit.id = 'name_submit';
            name_submit.type = 'submit';
            name_submit.className += 'loginscreen_inputs';
            color_selector.id = 'color_selector';
            color_selector.className += 'loginscreen_inputs';

            color_selector.appendChild((() => {
                const option = document.createElement('option');
                option.value = 1;
                option.innerText = 'Red';
                option.selected = true;
                return option;
            })());

            color_selector.appendChild((() => {
                const option = document.createElement('option');
                option.value = 2;
                option.innerText = 'Black';
                return option;
            })());

            inputfield_container.onsubmit = (event) => {
                event.preventDefault();
                this.joinGame(name_inputfield.value, color_selector.selectedIndex + 1);
            };

            inputfield_container.appendChild(name_inputfield);
            inputfield_container.appendChild(color_selector);
            inputfield_container.appendChild(name_submit);
            container.appendChild(inputfield_container);
            break;
        }

        case kGameScreen: {
            if (!this.tilesprepared) {
                this.clearScreen();
                this.buildTiles();
                this.tilesprepared = true;
            }

            if (this.color === 1) container.className = 'primary_color';
            if (this.color === 2) container.className = 'secondary_color';

            const gamefield = document.querySelector('#gamefield');

            this.requestServer('state', [this.boardname], (response) => {

                if (response.data.lastPlacedColor !== this.color) {

                    if (document.title === 'Connect 4') {
                        audio.play();
                    }

                    document.title = '**YOUR TURN**';
                } else {
                    document.title = 'Connect 4';
                }

                response.data.board.map((row, y) => {
                    y = parseInt(y, 10);
                    row.map((column, x) => {
                        x = parseInt(x, 10);
                        const tile = gamefield.children[y].children[x].children[0];

                        if (column === 0) tile.className = 'tile empty_tile';
                        if (column === 1) tile.className = 'tile primary_tile';
                        if (column === 2) tile.className = 'tile secondary_tile';
                    });
                });

                if (response.won !== 0) {
                    clearInterval(this.stateCheckInterval);
                    this.stateCheckInterval = undefined;
                    alert('Player number #' + response.won + ' has won the game!');
                }
            });

            break;
        }
        }
    }

    clearScreen() {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    buildTiles() {
        const gamefield = document.createElement('div');
        gamefield.id = 'gamefield';
        for (let y = 0; y < 8; y++) {
            const rowdiv = document.createElement('div');
            rowdiv.className += 'row';

            for (let x = 0; x < 12; x++) {

                const columndiv = document.createElement('div');
                const tilediv = document.createElement('div');

                columndiv.className += 'column';
                tilediv.className += 'tile';

                tilediv.dataset.x = x;
                tilediv.dataset.y = y;

                tilediv.onclick = (event) => {
                    event.preventDefault();

                    const x = parseInt(event.target.dataset.x, 10);
                    const y = parseInt(event.target.dataset.y, 10);

                    this.toggleTile(x, y);
                };

                columndiv.appendChild(tilediv);
                rowdiv.appendChild(columndiv);
            }

            gamefield.appendChild(rowdiv);
        }

        container.appendChild(gamefield);
    }

    toggleTile(x, y) {
        this.requestServer('set_color', [this.boardname, y, x, this.color], (response) => {
            if (response.ok === false) {
                alert(response.message);
            }

            if (this.stateCheckInterval !== undefined) this.render();
        });
    }

    joinGame(name, color) {
        if (name.length === 0) {
            alert('Please enter a boardname');
            return;
        }

        this.color = color;

        // Check if the board already exists
        this.requestServer('state', [name], (response) => {

            // The board does not exist yet
            if (!response.ok) {
                return this.requestServer('create_board', [name], (response) => {
                    this.attachToGame(name);
                });
            }

            this.attachToGame(name);
        });
    }

    attachToGame(name) {
        this.boardname = name;
        this.screen = kGameScreen;
        this.setupStateCheckInterval();
        this.render();
    }

    requestServer(url, params, callback) {
        const request = new XMLHttpRequest();
        request.open('GET', '/apps/connect4/' + url + '/' + params.join('/'), true);
        request.addEventListener('load', () => {
            callback(JSON.parse(request.response));
        }, false);
        request.send();
    }
}

const game = new Connect4();
game.render();
