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

const LEFT_BUTTON_NW_CORNER = new Point(360,260);
const LEFT_BUTTON_WIDTH = 100;
const LEFT_BUTTON_HEIGHT = 100;
const LEFT_RESUME_TOP = new Point(LEFT_BUTTON_NW_CORNER.x + 20,
                                  LEFT_BUTTON_NW_CORNER.y + 20);
const LEFT_RESUME_RIGHT = new Point(LEFT_BUTTON_NW_CORNER.x
                                    + LEFT_BUTTON_WIDTH - 10,
                                    LEFT_BUTTON_NW_CORNER.y
                                    + (LEFT_BUTTON_HEIGHT / 2));
const LEFT_RESUME_BOTTOM = new Point(LEFT_BUTTON_NW_CORNER.x + 20,
                                     LEFT_BUTTON_NW_CORNER.y
                                     + LEFT_BUTTON_HEIGHT - 20);


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
    },

    // Handle mousedown events.
    handleMouseDown: function(e) {
        if (! this.gameOver) {
            let canvasRect = CANVAS.getBoundingClientRect();
            let mousePoint = new Point(e.clientX - canvasRect.left,
                                       e.clientY - canvasRect.top);
            for (let i = 0; i < this.bees.length; i++) {
                let dist = distance(mousePoint, this.bees[i].centre);
                if (dist < BEE_RADIUS * BEE_TOUCH_SENSITIVITY) {
                    this.bees[i].kill();
                    this.currentScore++;
                }
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
        CONTEXT.fillRect(LEFT_BUTTON_NW_CORNER.x,
                         LEFT_BUTTON_NW_CORNER.y,
                         LEFT_BUTTON_WIDTH,
                         LEFT_BUTTON_HEIGHT);

        CONTEXT.fillStyle = TEXT_COLOUR;
        CONTEXT.beginPath();
        CONTEXT.moveTo(LEFT_RESUME_TOP.x, LEFT_RESUME_TOP.y);
        CONTEXT.lineTo(LEFT_RESUME_RIGHT.x, LEFT_RESUME_RIGHT.y);
        CONTEXT.lineTo(LEFT_RESUME_BOTTOM.x, LEFT_RESUME_BOTTOM.y);
        CONTEXT.fill();
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
