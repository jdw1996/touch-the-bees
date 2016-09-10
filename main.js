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

const BEE_FREQUENCY = 20;           // a higher number creates fewer bees
const BEE_RADIUS = 30;              // radius of a bee, in pixels
const BEE_SPEED = 5;                // horizontal speed of a bee
const BEE_DROP_SPEED = 15;          // vertical drop speed of a dead bee
const BEE_TOUCH_SENSITIVITY = 1.5;  // multiplier of radius

const BEE_COLOUR = "#fce94f";
const BEE_OUTLINE_COLOUR = "#2e3436";
const BEE_OUTLINE_THICKNESS = 10;

var counter = 0;


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

    // Handle mousedown events.
    handleMouseDown: function(e) {
        let canvasRect = this.canvas.getBoundingClientRect();
        let mousePoint = new Point(e.clientX - canvasRect.left,
                                   e.clientY - canvasRect.top);
        for (let i = 0; i < this.bees.length; i++) {
            let dist = distance(mousePoint, this.bees[i].centre);
            if (dist < this.bees[i].radius * this.bees[i].sensitivity) {
                this.bees[i].kill();
            }
        }
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
    this.sensitivity = BEE_TOUCH_SENSITIVITY;
    this.centre = new Point(- this.radius,
                            randrange(this.radius,
                                      this.canvas.height - this.radius));
    this.speed = BEE_SPEED;
    this.dead = false;

    this.colour = BEE_COLOUR;
    this.outlineColour = BEE_OUTLINE_COLOUR;
    this.outlineThickness = BEE_OUTLINE_THICKNESS;

    // Update the bee's position.
    this.update = function() {
        if (this.centre.x + this.speed > this.canvas.width + this.radius) {
            return UPDATE_FAILURE;
        }
        this.centre.x += this.speed;

        if (this.dead) {
            this.centre.y += BEE_DROP_SPEED;
        } else {
            let dy = randrange(-10, 10);
            if (this.centre.y + dy < this.radius
                || this.centre.y + dy > this.canvas.height - this.radius) {
                dy = -dy;
            }
            this.centre.y += dy;
        }

        return UPDATE_SUCCESS;
    }

    // Display the bee on the canvas.
    this.draw = function() {
        this.context.fillStyle = this.colour;
        this.context.strokeStyle = this.outlineColour;
        this.context.lineWidth = this.outlineThickness;
        this.context.beginPath();
        this.context.arc(this.centre.x, this.centre.y, this.radius,
                         0, 2 * Math.PI);
        this.context.fill();
        this.context.stroke();
    }

    // Kill the bee.
    this.kill = function() {
        this.dead = true;
    }
}


/* MAIN EXECUTION */

function startGame() {
    GAME.start();
    CANVAS.addEventListener("mousedown",
                            function(e) {
                                GAME.handleMouseDown(e);
                            });
}

window.onload = startGame;
