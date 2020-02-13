var canvas = document.getElementById("myCanvas");
var submitScore = document.getElementById("submitScore");
var uid = document.getElementById("uid").innerHTML;
var username = document.getElementById("username").innerHTML;
submitScore.style.display = "none";
var ctx = canvas.getContext("2d");
var totalEnemies = [];
var size = 0;
var count = 0;
var player = null;
var gameOver = false;

class point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    areOnSamePlace(point) {
        return this.x == point.x && this.y == point.y;
    }


}
class gameObject {
    objSize = 100;
    padding = 5;

    constructor(point) {
        this.point = point;
    }
    moveUp() {
        let up = this.point.y - this.objSize;
        if (up >= 0 && up < canvas.height) {
            this.point.y = up;
            return true;
        }
        return false;

    }

    moveDown() {
        let down = this.point.y + this.objSize;
        if (down >= 0 && down < canvas.height) {
            this.point.y = down;
            return true
        }
        return false;
    }

    moveLeft() {
        let left = this.point.x - this.objSize;
        if (left >= 0 && left < canvas.width) {
            this.point.x = left;
            return true;
        }
        return false;
    }

    moveRight() {
        let right = this.point.x + this.objSize;
        if (right >= 0 && right < canvas.width) {
            this.point.x = right;
            return true;
        }
        return false;
    }

    areOnSamePlace(gameObject) {
        return this.point.areOnSamePlace(gameObject.getPoint);
    }

    set setPoint(point) {
        this.point.x = point.x;
        this.point.y = point.y;
    }

    get getPoint() {
        return this.point;
    }

    objectRect() {
        return [this.getPoint.x + this.padding, this.getPoint.y + this.padding, this.objSize - this.padding * 2, this.objSize - this.padding * 2];
    }

}

function changeSize() {
    size = document.getElementById("size").value;
    canvas.width = size * 100;
    canvas.height = size * 100;
    possibleLocations = [];
    totalEnemies = [];
    document.getElementById("gameOver").innerHTML = ``;
    gameOver = false;
    count = 0;
    let x = Math.floor(Math.random() * size) * 100;
    let y = Math.floor(Math.random() * size) * 100;
    let startPoint = new point(x, y);
    player = new gameObject(startPoint);
    drawNewPlayerLocation();
    drawNewEnemyLocation();
}

function deleteOldPlayerLocation() {
    ctx.fillStyle = canvas.style.backgroundColor;
    ctx.fillRect(...player.objectRect());
}

function drawNewPlayerLocation() {
    ctx.fillStyle = "#49eb34";
    ctx.fillRect(...player.objectRect());

}

function drawNewEnemyLocation() {
    ctx.fillStyle = "#eb3434";
    let x = Math.floor(Math.random() * size) * 100;
    let y = Math.floor(Math.random() * size) * 100;
    let startPoint = new point(x, y);
    let enemy = new gameObject(startPoint);
    while (enemy.areOnSamePlace(player) ||
        totalEnemies.find(otherEnemy => otherEnemy.areOnSamePlace(enemy)) != null) {
        let x = Math.floor(Math.random() * size) * 100;
        let y = Math.floor(Math.random() * size) * 100;
        let startPoint = new point(x, y);
        enemy.point = startPoint;
    }
    totalEnemies.push(enemy);
    ctx.fillRect(...enemy.objectRect());

    if (isGameOver()) {
        gameOver = true;
        document.getElementById("gameOver").innerHTML = `You Lost! <br> Score: ${count}`;
        submitScore.style.display = 'block';
        document.getElementById("form").action = '/publish/'+count+'/'+size+'/'+uid+'/'+username;

    }
}

function isGameOver() {
    return totalEnemies.length >= size * size * 0.5;
}



function isEnemyEaten() {
    let eatenEnemy = totalEnemies.find(enemy => enemy.areOnSamePlace(player));
    if (eatenEnemy != null) {
        totalEnemies.splice(totalEnemies.indexOf(eatenEnemy), 1);
        count++;
    }
    drawNewEnemyLocation();
}

function keyListener(event) {
    var s;
    if (!gameOver) {
        deleteOldPlayerLocation();
        switch (event.keyCode) {
            case 37:
                if (player.moveLeft())
                    isEnemyEaten();
                break;
            case 39:
                clearTimeout(s);
                if (player.moveRight())
                    isEnemyEaten();
                break;
            case 38:
                if (player.moveUp())
                    isEnemyEaten();
                break;
            case 40:
                if (player.moveDown())
                    isEnemyEaten();
                break;
        }
        drawNewPlayerLocation();
    }

}


document.addEventListener('keydown', keyListener);