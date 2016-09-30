/*
 * Joseph Winters
 * Spring 2016
 */


/* GLOBAL VARIABLES */

// Global
const CURRENT_SCORE = document.getElementById("currentscore");
const HIGH_SCORE = document.getElementById("highscore");
const HIGH_SCORE_STRING = "highscore";

const CANVAS = document.getElementById("mycanvas");
const CONTEXT = CANVAS.getContext("2d");
const REFRESH_RATE = 20;            // milliseconds between refreshes
const BACKGROUND_COLOUR = "#729fcf";

// Bees
const BEE_UPDATED = "Successfully updated the bee.";
const BEE_DEAD_AND_FALLEN = "The bee died and has now left the screen.";
const BEE_ESCAPED = "The bee escaped beyond the end of the screen.";

const BEE_FREQUENCY = 40;           // a higher number creates fewer bees
const BEE_RADIUS = 30;              // radius of a bee, in pixels
const BEE_BASE_SPEED = 2;           // default horizontal speed of a bee
const BEE_DROP_SPEED = 15;          // vertical drop speed of a dead bee
const BEE_TOUCH_SENSITIVITY = 1.5;  // multiplier of radius
const BEES_PER_LEVEL = 10;          // number of kills before speed increases

const BEE_COLOUR = "#fce94f";
const BEE_OUTLINE_COLOUR = "#2e3436";
const BEE_OUTLINE_THICKNESS = 10;
const BEE_STRIPE_OFFSET = 10;

// Text
const TEXT_FONT = "40px Source Code Pro";
const TEXT_COLOUR = "#eeeeec";

const START_TEXT = "Click to start touching bees!";
const START_TEXT_NW_CORNER = new Point(140, 210);

const PAUSE_TEXT = "The game is paused.";
const PAUSE_TEXT_NW_CORNER = new Point(280, 210);

const END_TEXT1 = "Final score: ";
const END_TEXT1_NW_CORNER = new Point(300,180);
const END_TEXT2 = "Click to play again!";
const END_TEXT2_NW_CORNER = new Point(250,END_TEXT1_NW_CORNER.y + 60);

// Buttons
const BUTTON_COLOUR = "#4e9a06";

const RESUME_BUTTON = {
    height: 100,
    width: 100,
    nwCorner: new Point(360, 260),
    resume: {
        top: new Point(380, 280),
        right: new Point(450, 310),
        bottom: new Point(380, 340)
    }
};

const RESTART_BUTTON = {
    height: 100,
    width: 100,
    nwCorner: new Point(540, 260),
    restart: {
        centre: new Point(590, 310),
        radius: 30,
        thickness: 10,
        arcStart: - 3 * Math.PI / 4,
        arcEnd: 5 * Math.PI / 6,
        arrowTip: new Point(557, 301),
        arrowWing1: new Point(562, 276),
        arrowWing2: new Point(582, 296)
    }
};

const REPLAY_BUTTON = {
    height: 100,
    width: 100,
    nwCorner: new Point(450, 270),
    replay: {
        top: new Point(470, 290),
        right: new Point(540, 320),
        bottom: new Point(470, 350)
    }
};

const PAUSE_BUTTON = {
    height: 80,
    width: 80,
    nwCorner: new Point(20, 400),
    bars: {
        height: 40,
        width: 15,
        nwCorner1: new Point(40, 420),
        nwCorner2: new Point(65, 420)
    }
};


/* HELPER FUNCTIONS */

// Return a random number between min (inclusive) and max (exclusive).
function randrange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// Constructor for a Point object (x, y).
function Point(x, y) {
    this.x = x;
    this.y = y;
}

// Return the distance between two Point objects.
function distance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Return true if pt is in the rectangle with top-left corner nwCorner, height
//   height, and width width.
function pointInRect(pt, nwCorner, height, width) {
    return ((nwCorner.x <= pt.x && pt.x <= nwCorner.x + width)
            && (nwCorner.y <= pt.y && pt.y <= nwCorner.y + height));
}


/* OBJECTS AND CONSTRUCTORS */

const GAME = {
    bees: [],
    beeSpeed: BEE_BASE_SPEED,
    currentScore: 0,
    level: 1,
    highScore: localStorage.getItem(HIGH_SCORE_STRING),
    gameOver: true,
    paused: false,
    startedPlaying: false,
    counter: 0,

    // Run the game.
    run: function() {
        this.pregame();
        this.playInterval = setInterval(
            (function(self) {
                return function() {
                    if (! self.gameOver && ! self.paused) {
                        self.update();
                        self.draw();
                    } else if (self.paused) {
                        self.pausegame();
                    } else if (self.startedPlaying) {
                        self.endgame();
                    }
                };
            })(this),
            REFRESH_RATE
        );
    },

    // Update the game.
    update: function() {
        let i = this.bees.length - 1;
        while (i >= 0) {
            let ret = this.bees[i].update(this.beeSpeed);
            if (ret !== BEE_UPDATED) {
                // the bee has left the screen and should be deleted
                this.bees.splice(i, 1);
            }
            if (ret === BEE_ESCAPED) {
                // a bee has escaped the screen without being killed
                this.gameOver = true;
            }
            i--;
        }
        if (this.counter % BEE_FREQUENCY === 0) {
            this.bees.push(new Bee());
            this.counter = 0;   // reset the counter
        }
        CURRENT_SCORE.textContent = this.currentScore;
        if (this.highScore === null || this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            HIGH_SCORE.textContent = this.highScore;
            localStorage.setItem(HIGH_SCORE_STRING, this.highScore);
        }
        if (this.currentScore === (this.level + 1) * BEES_PER_LEVEL) {
            this.level++;
            this.beeSpeed++;
        }
        this.counter++;
    },

    // Display the current frame of the game.
    draw: function() {
        this.clear();
        for (let i = 0; i < this.bees.length; i++) {
            this.bees[i].draw();
        }

        if (this.startedPlaying) {
            CONTEXT.fillStyle = BUTTON_COLOUR;
            CONTEXT.fillRect(PAUSE_BUTTON.nwCorner.x,
                             PAUSE_BUTTON.nwCorner.y,
                             PAUSE_BUTTON.width,
                             PAUSE_BUTTON.height);
            CONTEXT.fillStyle = TEXT_COLOUR;
            CONTEXT.fillRect(PAUSE_BUTTON.bars.nwCorner1.x,
                             PAUSE_BUTTON.bars.nwCorner1.y,
                             PAUSE_BUTTON.bars.width,
                             PAUSE_BUTTON.bars.height);
            CONTEXT.fillRect(PAUSE_BUTTON.bars.nwCorner2.x,
                             PAUSE_BUTTON.bars.nwCorner2.y,
                             PAUSE_BUTTON.bars.width,
                             PAUSE_BUTTON.bars.height);
        }
    },

    // Handle mousedown events.
    handleMouseDown: function(e) {
        let canvasRect = CANVAS.getBoundingClientRect();
        let mousePoint = new Point(e.clientX - canvasRect.left,
                                   e.clientY - canvasRect.top);
        if (! this.gameOver && ! this.paused) {
            if (pointInRect(mousePoint, PAUSE_BUTTON.nwCorner,
                            PAUSE_BUTTON.height, PAUSE_BUTTON.width)) {
                this.paused = true;
            }
            for (let i = 0; i < this.bees.length; i++) {
                let dist = distance(mousePoint, this.bees[i].centre);
                if (dist < BEE_RADIUS * BEE_TOUCH_SENSITIVITY) {
                    this.bees[i].kill();
                    this.currentScore++;
                }
            }
        } else if (this.paused) {
            if (pointInRect(mousePoint, RESUME_BUTTON.nwCorner,
                            RESUME_BUTTON.height, RESUME_BUTTON.width)) {
                this.paused = false;
            } else if (pointInRect(mousePoint, RESTART_BUTTON.nwCorner,
                                   RESTART_BUTTON.height,
                                   RESTART_BUTTON.width)) {
                this.reset();
                this.paused = false;
            }
        } else {
            this.reset();
        }
    },

    // Retrieve and display the high score and display the start screen.
    pregame: function() {
        HIGH_SCORE.textContent = this.highScore;
        this.draw();
        CONTEXT.fillStyle = TEXT_COLOUR;
        CONTEXT.font = TEXT_FONT;
        CONTEXT.fillText(START_TEXT,
                         START_TEXT_NW_CORNER.x,
                         START_TEXT_NW_CORNER.y);
    },

    // Display the pause screen.
    pausegame: function() {
        this.clear();
        CONTEXT.fillStyle = TEXT_COLOUR;
        CONTEXT.font = TEXT_FONT;
        CONTEXT.fillText(PAUSE_TEXT,
                         PAUSE_TEXT_NW_CORNER.x,
                         PAUSE_TEXT_NW_CORNER.y);

        CONTEXT.fillStyle = BUTTON_COLOUR;
        CONTEXT.fillRect(RESUME_BUTTON.nwCorner.x,
                         RESUME_BUTTON.nwCorner.y,
                         RESUME_BUTTON.width,
                         RESUME_BUTTON.height);

        CONTEXT.fillStyle = TEXT_COLOUR;
        CONTEXT.beginPath();
        CONTEXT.moveTo(RESUME_BUTTON.resume.top.x, RESUME_BUTTON.resume.top.y);
        CONTEXT.lineTo(RESUME_BUTTON.resume.right.x,
                       RESUME_BUTTON.resume.right.y);
        CONTEXT.lineTo(RESUME_BUTTON.resume.bottom.x,
                       RESUME_BUTTON.resume.bottom.y);
        CONTEXT.fill();

        CONTEXT.fillStyle = BUTTON_COLOUR;
        CONTEXT.fillRect(RESTART_BUTTON.nwCorner.x,
                         RESTART_BUTTON.nwCorner.y,
                         RESTART_BUTTON.width,
                         RESTART_BUTTON.height);

        CONTEXT.strokeStyle = TEXT_COLOUR;
        CONTEXT.lineWidth = RESTART_BUTTON.restart.thickness;
        CONTEXT.beginPath();
        CONTEXT.arc(RESTART_BUTTON.restart.centre.x,
                    RESTART_BUTTON.restart.centre.y,
                    RESTART_BUTTON.restart.radius,
                    RESTART_BUTTON.restart.arcStart,
                    RESTART_BUTTON.restart.arcEnd);
        CONTEXT.stroke();
        CONTEXT.fillStyle = TEXT_COLOUR;
        CONTEXT.beginPath();
        CONTEXT.moveTo(RESTART_BUTTON.restart.arrowTip.x,
                       RESTART_BUTTON.restart.arrowTip.y);
        CONTEXT.lineTo(RESTART_BUTTON.restart.arrowWing1.x,
                       RESTART_BUTTON.restart.arrowWing1.y);
        CONTEXT.lineTo(RESTART_BUTTON.restart.arrowWing2.x,
                       RESTART_BUTTON.restart.arrowWing2.y);
        CONTEXT.fill();
        // TODO: draw restart symbol
    },

    // Display the end of game screen.
    endgame: function() {
        this.clear();
        CONTEXT.fillStyle = TEXT_COLOUR;
        CONTEXT.font = TEXT_FONT;
        CONTEXT.fillText(END_TEXT1 + this.currentScore,
                         END_TEXT1_NW_CORNER.x,
                         END_TEXT1_NW_CORNER.y);
        CONTEXT.fillText(END_TEXT2,
                         END_TEXT2_NW_CORNER.x,
                         END_TEXT2_NW_CORNER.y);

        CONTEXT.fillStyle = BUTTON_COLOUR;
        CONTEXT.fillRect(REPLAY_BUTTON.nwCorner.x,
                         REPLAY_BUTTON.nwCorner.y,
                         REPLAY_BUTTON.width,
                         REPLAY_BUTTON.height);

        CONTEXT.fillStyle = TEXT_COLOUR;
        CONTEXT.beginPath();
        CONTEXT.moveTo(REPLAY_BUTTON.replay.top.x, REPLAY_BUTTON.replay.top.y);
        CONTEXT.lineTo(REPLAY_BUTTON.replay.right.x,
                       REPLAY_BUTTON.replay.right.y);
        CONTEXT.lineTo(REPLAY_BUTTON.replay.bottom.x,
                       REPLAY_BUTTON.replay.bottom.y);
        CONTEXT.fill();
    },

    // Reset the variables that must be reset to start a new game.
    reset: function() {
        this.bees = [];
        this.beeSpeed = BEE_BASE_SPEED;
        this.currentScore = 0;
        this.level = 1;
        this.gameOver = false;
        this.startedPlaying = true;
        this.counter = 0;
    },

    // Clear the canvas and fill it with the background colour.
    clear: function() {
        CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
        CONTEXT.fillStyle = BACKGROUND_COLOUR;
        CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);
    }
};

function Bee() {
    this.centre = new Point(- BEE_RADIUS,
                            randrange(BEE_RADIUS,
                                      CANVAS.height - BEE_RADIUS));
    this.dead = false;

    // Update the bee's position.
    this.update = function(beeSpeed) {
        if (this.centre.x + beeSpeed > CANVAS.width + BEE_RADIUS
            && ! this.dead) {
            return BEE_ESCAPED;
        }
        this.centre.x += beeSpeed;

        if (this.dead) {
            if (this.centre.y + BEE_DROP_SPEED > CANVAS.height + BEE_RADIUS) {
                return BEE_DEAD_AND_FALLEN;
            }
            this.centre.y += BEE_DROP_SPEED;
        } else {
            let dy = randrange(-10, 10);
            if (this.centre.y + dy < BEE_RADIUS
                || this.centre.y + dy > CANVAS.height - BEE_RADIUS) {
                dy = -dy;
            }
            this.centre.y += dy;
        }

        return BEE_UPDATED;
    }

    // Display the bee on the canvas.
    this.draw = function() {
        CONTEXT.fillStyle = BEE_COLOUR;
        CONTEXT.strokeStyle = BEE_OUTLINE_COLOUR;
        CONTEXT.lineWidth = BEE_OUTLINE_THICKNESS;
        CONTEXT.beginPath();
        CONTEXT.arc(this.centre.x, this.centre.y, BEE_RADIUS,
                    0, 2 * Math.PI);
        CONTEXT.fill();
        CONTEXT.stroke();

        CONTEXT.lineWidth = BEE_OUTLINE_THICKNESS;
        CONTEXT.beginPath();
        CONTEXT.moveTo(this.centre.x - BEE_STRIPE_OFFSET,
                       this.centre.y - BEE_RADIUS);
        CONTEXT.lineTo(this.centre.x - BEE_STRIPE_OFFSET,
                       this.centre.y + BEE_RADIUS);
        CONTEXT.stroke();
        CONTEXT.beginPath();
        CONTEXT.moveTo(this.centre.x + BEE_STRIPE_OFFSET,
                       this.centre.y - BEE_RADIUS);
        CONTEXT.lineTo(this.centre.x + BEE_STRIPE_OFFSET,
                       this.centre.y + BEE_RADIUS);
        CONTEXT.stroke();
    }

    // Kill the bee.
    this.kill = function() {
        this.dead = true;
    }
}


/* MAIN EXECUTION */

function runGame() {
    GAME.run();
    CANVAS.addEventListener("mousedown",
                            function(e) {
                                GAME.handleMouseDown(e);
                            });
}

window.onload = runGame;
