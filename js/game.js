'use strict';

function initGame () {
    console.log('Initializing Game');

    var game = new Phaser.Game('100', '100', Phaser.AUTO, 'gameDiv', { preload: preload, create: create, update: update });

    function preload() {

        game.load.image('sky', 'assets/sky.png');
        game.load.spritesheet('dude', 'assets/dude.png', 32, 48);


        game.load.tilemap('final', 'assets/new.json', null, Phaser.Tilemap.TILED_JSON);

        game.load.image('bus-stop', 'assets/104718-200.png');
        game.load.image('bus', 'assets/bus_icon.png');
        game.load.image('cloud', 'assets/clip-art-of-raining-cats-and-dogs-LBuz6b-clipart.png');
        game.load.image('boxes', 'assets/tiles_spritesheet.png');
        game.load.image('tree', 'assets/tree_PNG224.png');
        game.load.image('coffee-cup', 'assets/yellow-tea-cup-md.png');
        game.load.image('gamecube', 'assets/GameCube - The SpongeBob SquarePants Movie - Mr Krabs.png');
        game.load.image('labels', 'assets/labels.png');

    }

    var player, platforms, cursors, map, layer, actionButton;

    var PLAYER_SPEED = 650;
    var PLAYER_JUMP = 550;
    var PLAYER_GRAVITY = 800;
    // var PLAYER_GRAVITY = 0;

    var TILE_SIDE = 32;

    var TIME_LIMIT = 60; // Minutes
    var COLLISION_TILES = [ 40, 49, 52, 180, 189, 100, 109, 76, 139, 64, 106, 97, 172,
                            193, 133, 62, 120, 141, 142, 166, 96, 114, 122, 125, 84,
                            79, 67, 140, 153, 163, 60, 144, 156, 157, 52, 195, 54, 55, 56, 69, 168, 205, 88, 108, 184, 68, 195, 48 ];
    // var currentTime = TIME_LIMIT * 60; // Seconds
    var currentTime = 0;
    if (Cookies.get('emti')) {
        currentTime = parseInt(Cookies.get('emti'));
    }
    var clues = [
        {
            // text: 'Clue 1',
            text: 'In this life you won’t get far, Without some food to feed your car. You don’t need to break the bank, Find the place to fill your tank. ',
            cluebox: {
                x: 31, // X Tiles
                y: 98  // Y Tiles
            }
        },
        {
            // text: 'Clue 2',
            text: 'Go to a place where people stand, The roads are wide and the vehicles grand. A booth showing tickets for sale on top, This is the place where the passengers stop. ',
            cluebox: {
                x: 9,
                y: 143
            }
        },
        {
            // text: 'Clue 3',
            text: 'There is a place we go for a walk, The children play and we can talk. Find this place if you want a lark, The answer you seek is in the …',
            cluebox: {
                x: 93, // X Tiles
                y: 103  // Y Tiles
            }
        },
        {
            // text: 'Clue 4',
            text: 'A pile of words, Jackets of hordes. Take a quick look, In the place of the book. ',
            cluebox: {
                x: 101, // X Tiles
                y: 85  // Y Tiles
            }
        },
        {
            // text: 'Clue 5',
            text: 'I’m full of pins and interesting stuff, People stare and can’t get enough. Paper and invites hang around, Up on the wall I can be found. ',
            cluebox: {
                x: 134, // X Tiles
                y: 64  // Y Tiles
            }
        },
        {
            // text: 'Clue 6',
            text: 'A place where we ultimately sleep, If I go please don\'t weep. Visit me once or even twice, Bring me roses, it will suffice. ',
            cluebox: {
                x: 123, // X Tiles
                y: 131  // Y Tiles
            }
        },
        {
            // text: 'Clue 7',
            text: 'To solve the hunt you must get, Into the room wired to the net. Crammed with tech and full of code, The clue is hidden in this abode. ',
            cluebox: {
                x: 73, // X Tiles
                y: 59  // Y Tiles
            }
        },
        {
            // text: 'Clue 8',
            text: 'There’s a place nearby you’ll want to meet, A portal place where people greet. Find me at the gatekeeper’s home, Search this area with a fine toothed comb. ',
            cluebox: {
                x: 119, // X Tiles
                y: 74  // Y Tiles
            }
        },
        {
            // text: 'Clue 9',
            text: 'To solve this little fix, Liquids, solids, gases mix. Head to the place of some reaction, To further this puzzle transaction. ',
            cluebox: {
                x: 26, // X Tiles
                y: 10  // Y Tiles
            }
        },
        {
            // text: 'Clue 10',
            text: 'I try to send a letter, But all I do is receive. The port to all things outside, I am wooden I believe. ',
            cluebox: {
                x: 55, // X Tiles
                y: 8  // Y Tiles
            }
        }
    ];
    var currentClueIndex = 0;
    if (Cookies.get('ci')) {
        currentClueIndex = parseInt(Cookies.get('ci'));
    }
    // Set same values in DOM
    $('#scoreDiv').text('Clues: ' + currentClueIndex + '/' + clues.length);
    $('#clueDiv').text(clues[currentClueIndex].text);

    var lastClueTime = '';
    if (Cookies.get('lct')) {
        lastClueTime = Cookies.get('lct');
        $('#lastClueTimeDiv').text('Last clue at: ' + lastClueTime);
    }

    function create() {
        // Start game timer
        startTimer ();

        //  We're going to be using physics, so enable the Arcade Physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // game.world.setBounds(-800, -600, 3200, 1200);

        //  A simple background for our game
        var sky = game.add.sprite(0, 0, 'sky');
        sky.scale.setTo(4, 4);
        sky.fixedToCamera = true;


        // Setup platforms with tiles sprite
        map = game.add.tilemap('final');
        map.setTileSize(TILE_SIDE, TILE_SIDE);

        map.addTilesetImage('104718-200', 'bus-stop');
        map.addTilesetImage('bus_icon', 'bus');
        map.addTilesetImage('clip-art-of-raining-cats-and-dogs-LBuz6b-clipart', 'cloud');
        map.addTilesetImage('tiles_spritesheet', 'boxes');
        map.addTilesetImage('tree_PNG224', 'tree');
        map.addTilesetImage('yellow-tea-cup-md', 'coffee-cup');
        map.addTilesetImage('GameCube - The SpongeBob SquarePants Movie - Mr Krabs', 'gamecube');
        map.addTilesetImage('labels', 'labels');


        map.setCollision(COLLISION_TILES);

        // map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);
        layer = map.createLayer('platforms');
        // layer.scale.set(0.8);
        layer.resizeWorld();


        //  The platforms group contains the ground and the 2 ledges we can jump on
        // platforms = game.add.group();
        //  We will enable physics for any object that is created in this group
        // platforms.enableBody = true;
        // Here we create the ground.
        // var ground = platforms.create(-800, 600 - 64, 'ground');
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        // ground.scale.setTo(8, 2);
        //  This stops it from falling away when you jump on it
        // ground.body.immovable = true;
        //  Now let's create two ledges
        // var ledge = platforms.create(400, 400, 'ground');
        // ledge.body.immovable = true;
        // ledge = platforms.create(-150, 250, 'ground');
        // ledge.body.immovable = true;
        // ledge = platforms.create(0, 0, 'ground');
        // ledge.body.immovable = true;

        // The player and its settings
        player = game.add.sprite(67 * TILE_SIDE, 142 * TILE_SIDE, 'dude');

        //  We need to enable physics on the player
        game.physics.arcade.enable(player);

        //  Player physics properties. Give the little guy a slight bounce.
        /* player.body.bounce.y = 0.2;*/
        player.body.gravity.y = PLAYER_GRAVITY;
        player.body.collideWorldBounds = true;

        //  Our two animations, walking left and right.
        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);

        // Make the game camera follow the player
        game.camera.follow(player);

        //  Our controls.
        cursors = game.input.keyboard.createCursorKeys();

        actionButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        actionButton.onDown.add(playerActionFunc, this);

        if (parseInt(Cookies.get('emti')) <= 0 || parseInt(Cookies.get('ci')) >= clues.length) {
            // Disabling Keyboard
            cursors = game.input.keyboard.disable = false;
            //  Stand still
            player.animations.stop();
        }
    }

    function update() {

        //  Collide the player and the stars with the platforms
        game.physics.arcade.collide(player, layer);

        //  Reset the players velocity (movement)
        player.body.velocity.x = 0;

        if (cursors.left.isDown)
        {
            //  Move to the left
            // player.body.velocity.x = -650;
            player.body.velocity.x = -PLAYER_SPEED;

            player.animations.play('left');
        }
        else if (cursors.right.isDown)
        {
            //  Move to the right
            player.body.velocity.x = PLAYER_SPEED;

            player.animations.play('right');
        }
        else
        {
            //  Stand still
            player.animations.stop();

            player.frame = 4;
        }

        //  FOR DEBUGGING
        // player.body.velocity.y = 0;
        // if (cursors.down.isDown) {
        //     player.body.velocity.y = 450;
        // } else if (cursors.up.isDown) {
        //     player.body.velocity.y = -450;
        // }
        
        //  Allow the player to jump if they are touching the ground.
        if (cursors.up.isDown && player.body.blocked.down)
        {
            player.body.velocity.y = -PLAYER_JUMP;
        }

    }

    function playerActionFunc () {
        // check if the player is on a clue box
        var playerX = player.position.x;
        var playerY = player.position.y;
        console.log(playerX / TILE_SIDE, playerY / TILE_SIDE);

        var playerTileX = Math.floor(playerX / TILE_SIDE);
        var playerTileY = Math.floor(playerY / TILE_SIDE);
        console.log(playerTileX, playerTileY);

        var tileObj = map.getTile(playerTileX, playerTileY, layer);
        console.log(tileObj);

        // if the tile is a clue box tile

            // if player is on the right clue box, call correctClueFunc
            if (clues[currentClueIndex].cluebox.x >= playerTileX - 1 &&
                 clues[currentClueIndex].cluebox.x <= playerTileX + 1 &&
                 clues[currentClueIndex].cluebox.y >= playerTileY - 1 &&
                 clues[currentClueIndex].cluebox.y <= playerTileY + 1
               ) {
                correctClueFunc();
            } else {
                // if player is on a wrong clue box, call wrongClueFunc
                wrongClueFunc();
            }

    }

    function correctClueFunc () {
        console.log('Correct Clue');

        // Set currentTime to the time for last clue
        lastClueTime = $('#timeDiv').text();
        Cookies.set('lct', lastClueTime, { expires: 7 });
        $('#lastClueTimeDiv').text('Last clue at: ' + $('#timeDiv').text());

        // Start correct clue animation, increment clue score/index, change clue
        currentClueIndex++;

        $('#scoreDiv').text('Clues: ' + currentClueIndex + '/' + clues.length);

        // Animate winningBird
        $('#winningBird').addClass('large');
        setTimeout(function(){
            $('#winningBird').removeClass('large');
        }, 7000);

        Cookies.set('ci', currentClueIndex, { expires: 7 });

        if (currentClueIndex >= clues.length) {
            gameEndFunc();
        } else {
            $('#clueDiv').text(clues[currentClueIndex].text);
        }
    }

    function wrongClueFunc () {
        console.log('Wrong Clue');
        // Start wrong clue animation
    }

    function gameEndFunc () {
        console.log('Game End');

        // Stop timer
        clearInterval(timerInterval);

        // Show the time and score
        alert('Score: ' + currentClueIndex + ' / ' + clues.length + '\n' +
              'Time: ' + $('#timeDiv').text());

        // Stopping all player movements
	      player.animations.stop();

        // Disabling Keyboard
        cursors = game.input.keyboard.disable = false;
    }

    // Timer
    var timerInterval;
    function startTimer () {
        timerInterval = setInterval(function () {
            var hours = 0, mins = 0, secs = 0;
            if (currentTime >= 3600) {
                hours = Math.floor(currentTime / 3600);
                mins = Math.floor((currentTime % 3600) / 60);
                secs = Math.floor((currentTime % 3600) % 60);
            } else if (currentTime >= 60) {
                hours = 0;
                mins = Math.floor(currentTime / 60);
                secs = Math.floor(currentTime % 60);
            // } else if (currentTime <= 0) {
            //     $('#timeDiv').text('00:00:00');
            //     gameEndFunc();
            } else {
                hours = 0;
                mins = 0;
                secs = currentTime;
            }

            var hourString = hours < 10 ? '0' + hours : hours;
            var minuteString = mins < 10 ? '0' + mins : mins;
            var secondsString = secs < 10 ? '0' + secs : secs;
            $('#timeDiv').text(hourString + ':' + minuteString + ':' + secondsString);

            Cookies.set('emti', currentTime, { expires: 7 });

            // currentTime--;
            currentTime++;
        }, 1000);
    }
}

function setHeaderButtons () {
    $('#viewMapButton').click(function () {
        $('#minimap').toggleClass('show');
        if ($(this).text() === 'View Map') {
            $(this).text('Close Map');
        } else if ($(this).text() === 'Close Map') {
            $(this).text('View Map');
        }
    });

    $('#viewInsButton').click(function () {
        $('#instructionsBox').toggleClass('show');
        if ($(this).text() === 'View Instructions') {
            $(this).text('Close Instructions');
        } else if ($(this).text() === 'Close Instructions') {
            $(this).text('View Instructions');
        }
    });
}

var gameStarted = false;
function showInitialScreen () {
    var keyString = '';
    $('body').on('keydown', function(event) {
            switch (event.originalEvent.keyCode) {
            case 13:
                if (!gameStarted) {
                    if ($('#instructionsBox').hasClass('show')) {
                        gameStarted = true;
                        $('#instructionsBox').removeClass('show top');
                        $('#startScreen').addClass('hide');
                        initGame();
                        $('#header').addClass('show');
                    } else {
                        $('#instructionsBox').addClass('show top');
                    }
                }
                break;
        }

        switch (event.originalEvent.key) {
        case 'c':
            if (keyString === '' ||
                keyString === 'clear' ||
                keyString === 'clearca') {
                keyString += 'c';
            }
            break;
        case 'l':
            if (keyString === 'c') {
                keyString += 'l';
            }
            break;
        case 'e':
            if (keyString === 'cl' ||
                keyString === 'clearcach') {
                keyString += 'e';
            }
            break;
        case 'a':
            if (keyString === 'cle' ||
                keyString === 'clearc') {
                keyString += 'a';
            }
            break;
        case 'r':
            if (keyString === 'clea') {
                keyString += 'r';
            }
            break;
        case 'h':
            if (keyString === 'clearcac') {
                keyString += 'h';
            }
            break;
        default:
            keyString = '';
        }

        if (keyString === 'clearcache') {
            Cookies.remove('emti');
            Cookies.remove('ci');
            Cookies.remove('lct');
            console.log('removed');
        }


    });
}

$(document).ready(function () {
    showInitialScreen();
    setHeaderButtons();
    // initGame();
});
