
try {
var player1
var floors = [];
var keys = [];
const gravity = 0.0001
const jumpSpeed = 0.005
const moveSpeed = 0.0003

const sprite1 = new Image()
sprite1.src = './player1.png'
const sprite2 = new Image()
sprite2.src = './player2.png'

// all rectangles are stored as (x, y, width, height)
// all circles are stored as (x, y, r)
// y_max is 0.5625

function gaussian(stdev=1) {
    var u = 1 - Math.random()
    var v = Math.random()
    var z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
    return z * stdev;
}

function rotate(vx, vy, theta) {
    return {x : vx * Math.cos(theta) - vy * Math.sin(theta),
            y : vx * Math.sin(theta) + vy * Math.cos(theta)}
}


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

const clip = (num, min, max) => Math.min(Math.max(num, min), max);

function inter_c_c(circ1, circ2) {
    // returns <intersecting?>, <unit_x direction>, <unit_y direction>
    var x = circ1.x-circ2.x;
    var y = circ1.y-circ2.y;
    var dist = (x**2 + y**2)**0.5
    return [dist <= circ1.radius+circ2.radius, x/dist, y/dist]

}

function inter_c_r(circ, rect) {
    // returns <intersecting?>, <direction_x=-1 or 0 or 1>, <direction_y=-1 or 0 or 1>
    // direction represents relative direction circle should "bounce" towards to negate collision
    // direction functionality is not working yet
    
    var x = (circ.x - rect.x);
    var y = (circ.y - rect.y);
    var colliding = false;
    var direction_x = 0;
    var direction_y = 0;

    if (Math.abs(x) > rect.width/2 + circ.radius)  { return [false, 0, 0] }
    if (Math.abs(y) > rect.height/2 + circ.radius) { return [false, 0, 0] }

    cornerDist = (Math.abs(x) - rect.width/2)**2 + (Math.abs(y) - rect.height/2)**2;
    
    if (circ.radius > Math.abs(x-rect.width/2)){
        direction_x = 1
    } else if (circ.radius > Math.abs(x+rect.width/2)){
        direction_x = -1
    }

    if (circ.radius > Math.abs(y-rect.height/2)){
        direction_y = 1
    } else if (circ.radius > Math.abs(y+rect.height/2)){
        direction_y = -1
    }

    if (Math.abs(x) <= rect.width/2){
        colliding=true
        direction_x=0
    } 

    if (Math.abs(y) <= rect.height/2){
        colliding=true
        direction_y=0
    }

    return [(cornerDist <= circ.radius**2) || colliding, direction_x, direction_y]
}

function c_c_elastic(circ1, circ2){
    resx = circ1.xspeed - circ2.xspeed
    resy = circ1.yspeed - circ2.yspeed

    var m1 = circ1.mass
    var m2 = circ2.mass
    var theta = -Math.atan2(circ2.y - circ1.y, circ2.x - circ1.x);
    var v1 = rotate(circ1.speedx, circ1.speedy, theta);
    var v2 = rotate(circ2.speedx, circ2.speedy, theta);
    var u1 = rotate(v1.x * (m1 - m2)/(m1 + m2) + v2.x * 2 * m2/(m1 + m2), v1.y, -theta);
    var u2 = rotate(v2.x * (m2 - m1)/(m1 + m2) + v1.x * 2 * m1/(m1 + m2), v2.y, -theta);
    
    circ1.speedx = u1.x
    circ1.speedy = u1.y
    circ2.speedy = u2.x
    circ2.speedy = u2.y
}

function startGame() {
    myGameArea.start()
    ctx = myGameArea.context

    player1 = new Player(0.3, 0.3, sprite1, 'a', 'd', 'w', 's', 0.2);
    player2 = new Player(0.7, 0.1, sprite2, 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 0.8);

    floors.push(new Floor(0.1, 0.4, 0.9, 0.44))
    floors.push(new Floor(0.7, 0.3, 0.9, 0.34))
    
    const border = 0.02
    floors.push(new Floor(-0.1      , -0.1           , 1.1       , 0 + border))
    floors.push(new Floor(-0.1      , 0.5625 - border, 1.1       , 0.6625    ))
    floors.push(new Floor(-0.1      , -0.1           , 0 + border, 0.6625    ))
    floors.push(new Floor(1 - border, -0.1           , 1.1       , 0.6625    ))

    floorImg = new Image()
    floorImg.src = './brick.png'

    quakeX = 0
    quakeY = 0
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

function Floor(x1, y1, x2, y2, colour){
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.x = (x1+x2)/2
    this.y = (y1+y2)/2
    this.width = x2-x1
    this.height = y2-y1

    this.render = function() {
        ctx.fillStyle = ctx.createPattern(floorImg, "repeat");
        ctx.fillRect(canvas_width*this.x1,
                     canvas_width*this.y1,
                     canvas_width*(this.x2-this.x1),
                     canvas_width*(this.y2-this.y1))
    }
}

function Player(x, y, sprite, leftKey, rightKey, upKey, downKey, healthX) {
    this.ammo = 0
    this.x = x
    this.y = y
    this.radius = 0.02
    this.sprite = sprite
    this.speedx = 0
    this.speedy = 0
    this.health = 1
    this.mass = 1

    this.leftKey  = leftKey
    this.rightKey = rightKey
    this.upKey    = upKey
    this.downKey  = downKey

    this.healthX = healthX
    this.healthY = 0.05
    this.healthWidth  = 0.2
    this.healthHeight = 0.02

    gradient = ctx.createLinearGradient((this.healthX-this.healthWidth/2)*canvas_width,
                                        (this.healthY-this.healthHeight*3)*canvas_width,
                                        (this.healthX+this.healthWidth/2)*canvas_width,
                                        (this.healthY+this.healthHeight*3)*canvas_width)

    gradient.addColorStop(0  , "#ff0000")
    gradient.addColorStop(0.5, "#f9ff00")
    gradient.addColorStop(1  , "#12ff00")

    this.gradient = gradient

    this.render = function() {
        ctx.save()

        ctx.translate(this.x*canvas_width, this.y*canvas_width)

        var theta = this.x/this.radius
        ctx.rotate(theta);

        ctx.drawImage(
            this.sprite,
            -this.radius*canvas_width,
            -this.radius*canvas_width,
            this.radius*canvas_width*2,
            this.radius*canvas_width*2
        )
        ctx.restore()

        ctx.strokeStyle = "rgba(0, 0, 0, 1)"
        ctx.fillStyle = this.gradient
        ctx.beginPath()

        ctx.roundRect((this.healthX-this.healthWidth/2)*canvas_width,
                      (this.healthY-this.healthHeight/2)*canvas_width,
                      this.healthWidth*canvas_width*this.health,
                      this.healthHeight*canvas_width,
                      this.healthHeight*canvas_width/2)
                     
        ctx.stroke()
        ctx.fill()

    }
    this.move = function() {
        maxSpeed = 0.01
        
        this.speedy = gravity + this.speedy
        this.speedy = clip(this.speedy, -maxSpeed, maxSpeed)
        this.speedx = clip(this.speedx, -maxSpeed, maxSpeed)
        this.speedx *= 0.98

        this.x += this.speedx
        this.y += this.speedy
    }
}


function updateGameArea() {
    var colliding, direction_x, direction_y, jumping
    myGameArea.clear();
    myGameArea.frameNo += 1;

    [player1, player2].forEach(player => {
        player.move()
        jumping = false
        floors.forEach(floor => {
            
            [colliding, direction_x, direction_y] = inter_c_r(player, floor)
            // console.log(colliding, direction_x, direction_y)
            // console.log(direction_y)
            // console.log(colliding)
            if (colliding){
                if (direction_y){
                    player.y -= player.speedy
                    player.speedy = 0
                }
                if (direction_x){
                    player.x -= player.speedx
                    player.speedx = 0
                }
                if (direction_y<0 && keys[player.upKey]){
                    jumping = true;
                }
            }
        })
    
        if (jumping){
            player.speedy=-jumpSpeed
        }
        if (keys[player.leftKey]){
            player.speedx-=moveSpeed
        }
        if (keys[player.rightKey]){
            player.speedx+=moveSpeed
        }
        if (keys[player.downKey]){
            player.speedy+=2*moveSpeed 
        }
    
        quakeX += (gaussian(0.2)) * (2**Math.abs(player.speedx) + 2**Math.abs(player.speedy) - 2)
        quakeY += (gaussian(0.2)) * (2**Math.abs(player.speedx) + 2**Math.abs(player.speedy) - 2)
    })
    
    // ERROR IS HERE!!
    
    var temp = inter_c_c(player1,player2)
    colliding  = temp[0]
    direction_x = temp[1]
    direction_y = temp[2]
    // console.log(colliding)


    if (colliding){
        c_c_elastic(player1, player2)

        var relSpeed = (player1.speedx - player2.speedx)**2 + (player1.speedy - player2.speedy)**2
        if (relSpeed>0.0001){
            speed1 = player1.speedx**2 + player1.speedy**2
            speed2 = player2.speedx**2 + player2.speedy**2

            player1.health -= 2000000 * speed1 * relSpeed
            player2.health -= 2000000 * speed2 * relSpeed

        }
    }
    
    // RENDER THINGS

    ctx.save()
    ctx.translate(canvas_width*quakeX, canvas_width*quakeY)
    player1.render()
    player2.render()

    floors.forEach(floor => {
        floor.render()
    })
    ctx.restore()

    // STOP RENDERING THINGS

    quakeX *= 0.9
    quakeY *= 0.9
}

} catch (error) {
    console.error(error);
}