/*
 * Joseph Winters
 * Spring 2016
 */


/* GLOBAL VARIABLES */

const CANVAS = document.getElementById("mycanvas");
const CONTEXT = CANVAS.getContext("2d");
const REFRESH_RATE = 20;    // milliseconds between refreshes
const BACKGROUND_COLOUR = "#729fcf";

const UPDATE_SUCCESS = "Successfully updated.";
const UPDATE_FAILURE = "The object can no longer be updated.";

const BEE_FREQUENCY = 20;   // a higher number creates fewer bees
const BEE_RADIUS = 30;      // radius of a bee, in pixels
const BEE_SPEED = 5;        // horizontal speed of a bee

const BEE_COLOUR = "#fce94f";
const BEE_OUTLINE_COLOUR = "#2e3436";
const BEE_OUTLINE_THICKNESS = 10;

var counter = 0;


/* HELPER FUNCTIONS */

// Return a random number between min (inclusive) and max (exclusive).
function randrange(min, max) {
    return Math.random() * (max - min) + min;
}


/* OBJECTS AND CONSTRUCTORS */

const game = {
    canvas: CANVAS,
    context: CONTEXT,

    bees: [],

    // Start playing the game.
    start: function() {
        this.interval = setInterval(
            (function(self) {
                return function() {
                    self.update();
                };
            })(this),
            REFRESH_RATE
        );
    },

    // Update the game.
    update: function() {
        if (counter % BEE_FREQUENCY === 0) {
            this.bees.push(new Bee());
            counter = 0;    // reset the counter
        }
        this.draw();
        counter++;
    },

    // Display the current frame of the game.
    draw: function() {
        this.clear();
        let i = this.bees.length - 1;
        while (i >= 0) {
            let ret = this.bees[i].update();
            if (ret !== UPDATE_SUCCESS) {
                // the bee has left the screen and should be deleted
                this.bees.splice(i, 1);
            } else {
                this.bees[i].draw();
            }
            i--;
        }
    },

    // Clear the canvas and fill it with the background colour.
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = BACKGROUND_COLOUR;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

function Bee() {
    this.canvas = CANVAS;
    this.context = CONTEXT;

    this.radius = BEE_RADIUS;
    this.x = - this.radius;
    this.y = randrange(this.radius, this.canvas.height - this.radius);
    this.speed = BEE_SPEED;

    // Update the bee's position.
    this.update = function() {
        if (this.x + this.speed > this.canvas.width + this.radius) {
            return UPDATE_FAILURE;
        }
        this.x += this.speed;

        let dy = randrange(-10, 10);
        if (this.y + dy < this.radius
            || this.y + dy > this.canvas.height - this.radius) {
            dy = -dy;
        }
        this.y += dy;

        return UPDATE_SUCCESS;
    }

    // Display the bee on the canvas.
    this.draw = function() {
        this.context.fillStyle = BEE_COLOUR;
        this.context.strokeStyle = BEE_OUTLINE_COLOUR;
        this.context.lineWidth = BEE_OUTLINE_THICKNESS;
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.fill();
        this.context.stroke();
    }
}


/* MAIN EXECUTION */

function startGame() {
    game.start();
}

window.onload = startGame;
