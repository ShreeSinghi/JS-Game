
try {
    
var player1
var floors = [];
var keys = [];
var gravity = 0.001
// all rectangles are stored as (x, y, width, height)
// all circles are stored as (x, y, r)
// y_max is 0.5625

window.addEventListener("keydown",
    function(e){
        keys[e.key] = true;
    },
false);

window.addEventListener('keyup',
    function(e){
        keys[e.key] = false;
    },
false);

function inter_c_c(circ1, circ2) {
    // returns <intersecting?>, <unit_x direction>, <unit_y direction>
    var x = circ1.x-circ2.x;
    var y = circ1.y-circ2.y;
    var dist = (x**2 + y**2)**0.5
    if ( dist <= circ1.radius+circ2.radius){
        return (true, x/dist, y/dist)
    } else {
        return (false, 0, 0)
    }
}

function inter_c_r(circ, rect) {
    // returns <intersecting?>, <direction_x=-1 or 0 or 1>, <direction_y=-1 or 0 or 1>
    // direction represents relative direction circle should "bounce" towards to negate collision
    let x = (circ.x - rect.x);
    let y = (circ.y - rect.y);
    let colliding = false;
    let direction_x = 0;
    let direction_y = 0;

    if (Math.abs(x) > rect.width/2 + circ.radius)  { return [false, 0, 0] }
    if (Math.abs(y) > rect.height/2 + circ.radius) { return [false, 0, 0] }

    if (x <= rect.width/2)  { colliding=true; direction_x=Math.sign(x) } 
    if (y <= rect.height/2) { colliding=true; direction_y=Math.sign(y) }

    if (colliding){
        return [colliding, direction_x, direction_y]
    }

    cornerDist = (Math.abs(x) - rect.width/2)**2 + (Math.abs(y) - rect.height/2)**2;
    
    return [(cornerDist <= circle.radius**2), Math.sign(x), Math.sign(y)]
}


function startGame() {
    player1 = new player(0.5, 0.3, "red");
    floors.push(new floor(0.1, 0.4, 0.9, 0.5, "green"))
    myGameArea.start();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        canvas_width = window.screen.width*0.7;
        canvas_height = canvas_width * 9/16;

        this.canvas.width = canvas_width
        this.canvas.height = canvas_height

        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        },
    clear : function() {
        this.context.clearRect(0, 0, canvas_width, canvas_height);
    }
}

function floor(x1, y1, x2, y2, colour){
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.x = (x1+x2)/2
    this.y = (y1+y2)/2
    this.width = x2-x1
    this.height = y2-y1

    this.colour = colour

    this.render = function() {
        ctx = myGameArea.context
        ctx.fillStyle = this.colour
        ctx.fillRect(canvas_width*this.x1,
                     canvas_width*this.y1,
                     canvas_width*(this.x2-this.x1),
                     canvas_width*(this.y2-this.y1))
    }
}

function player(x, y, colour) {
    this.ammo = 0
    this.x = x
    this.y = y
    this.radius = 0.02
    this.colour = colour
    this.speedx = 0
    this.speedy = 0

    this.render = function() {
        ctx = myGameArea.context
        ctx.fillStyle = this.colour;
        ctx.beginPath();
        ctx.arc(this.x*canvas_width, this.y*canvas_width, this.radius*canvas_width, 0, 2 * Math.PI);
        ctx.fill();
    }

    this.move = function() {
        maxSpeed = 0.01
        
        this.speedy = Math.min(gravity+this.speedy, maxSpeed)
        // console.log(this.speedy)

        this.x += this.speedx
        this.y += this.speedy
    }
}

function updateGameArea() {
    var colliding, direction_x, direction_y
    myGameArea.clear();
    myGameArea.frameNo += 1;
    player1.move()
    console.log(keys)

    floors.forEach(floor => {
        
        [colliding, direction_x, direction_y] = inter_c_r(player1, floor)
        // console.log(direction_y)
        // console.log(colliding)
        if (colliding){
            player1.y -= player1.speedy
            player1.speedy = 0
        }
    });

    floors.forEach(floor => {
        floor.render()
    });

    player1.render();
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}


} catch (error) {
    console.error(error);
}