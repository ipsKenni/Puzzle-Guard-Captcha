class Car {
    constructor(id, length, isHorizontal, position, color, gameBoard) {
        this.id = id;
        this.startPostions = position;
        this.length = length;
        this.isHorizontal = isHorizontal;
        this.position = position;
        this.color = color;
        this.gameBoard = gameBoard;
        this.element = this.createElement();
        this.addEventListeners();
        console.dir(JSON.stringify(this.startPostions))
    }

    addEventListeners() {
        this.element.addEventListener('click', () => {
            event.preventDefault();
            this.movePositive();
            this.gameBoard.isGoalHit();
        });

        this.element.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.moveNegative();
            this.gameBoard.isGoalHit();
        });
    }

    movePositive( amount = 1 ) {
        const newPosition = this.isHorizontal 
            ? { x: this.position.x + amount, y: this.position.y } 
            : { x: this.position.x, y: this.position.y + amount };
        this.move(newPosition);
    }

    moveNegative( amount = 1 ) {
        const newPosition = this.isHorizontal 
            ? { x: this.position.x - amount, y: this.position.y } 
            : { x: this.position.x, y: this.position.y - amount };
        this.move(newPosition);
    }

    createElement() {
        const carElement = document.createElement('div');
        carElement.id = this.id;
        carElement.classList.add('car');
        carElement.style.gridColumnStart = this.position.x;
        carElement.style.gridRowStart = this.position.y;
        carElement.style.gridColumnEnd = this.isHorizontal ? `span ${this.length}` : 'auto';
        carElement.style.gridRowEnd = this.isHorizontal ? 'auto' : `span ${this.length}`;
        carElement.style.backgroundColor = this.color;
        return carElement;
    }

    move(newPosition) {
        if (newPosition.x > 0 && newPosition.x + (this.isHorizontal ? this.length - 1 : 0) <= this.gameBoard.width && 
            newPosition.y > 0 && newPosition.y + (this.isHorizontal ? 0 : this.length - 1) <= this.gameBoard.height &&
            !this.gameBoard.isPositionOccupied(newPosition, this)) {
            this.position = newPosition;
            this.updatePosition();
            return true;
        }
        return false;
    }

    updatePosition() {
        this.element.style.gridColumnStart = this.position.x;
        this.element.style.gridRowStart = this.position.y;
    }
}

class GameBoard {
    constructor(width, height, numCars) {
        this.width = width;
        this.height = height;
        this.numCars = numCars;
        this.boardElement = document.getElementById('gameBoard');
        this.boardElement.style.gridTemplateColumns = `repeat(${width}, 10px)`;
        this.boardElement.style.gridTemplateRows = `repeat(${height}, 10px)`;
        this.cars = [];
        this.goal = null; 
        this.init();
        this.addEventListeners();
        this.addRandomGoal();
    }

    init() {
        for (let i = 0; i < this.numCars; i++) {
            const id = String.fromCharCode(65 + i);
            const length = Math.floor(Math.random() * 1) + 2;
            const isHorizontal = Math.random() < 0.5;
            const position = this.getRandomPosition(length, isHorizontal);
            const color = this.getRandomColor();
            const car = new Car(id, length, isHorizontal, position, color, this);
            this.addCar(car);
        }
        this.render();
    }

    reset() {
        this.cars = [];
        this.goal = null;
        this.goalAble = false;
        this.boardElement.innerHTML = '';
    }

    addEventListeners() {
        this.boardElement.addEventListener('click', () => {
            event.preventDefault();
        });

        this.boardElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    addRandomGoal() {
        const goalPosition = this.getRandomPosition(1, true);
        const goalElement = document.createElement('div');
        const isHorizontal = Math.random() < 0.5;
        const getX = isHorizontal? this.width: goalPosition.x;
        const getY = isHorizontal? goalPosition.y: this.height;
        goalElement.style.gridColumnStart = getX;
        goalElement.style.gridRowStart = getY;
        goalElement.style.backgroundColor = 'red';
        goalElement.style.width = '10px';
        goalElement.style.height = '10px';
        this.boardElement.appendChild(goalElement);
        this.goal = new Goal({ x: getX, y: getY }, this);

        const id = 'G';
        const length = 2;
        const position = goalPosition;
        const color = 'green';
        const car = new Car(id, length, isHorizontal, position, color, this);
        for (let index = 0; index < 50; index++) {
            car.movePositive(index);
            car.moveNegative(index);
        }
        this.addCar(car);
    }

    isGoalHit( showWinner = true ) {
        return this.cars.some(car => {
            const carEndX = car.isHorizontal ? car.position.x + car.length - 1 : car.position.x;
            const carEndY = car.isHorizontal ? car.position.y : car.position.y + car.length - 1;

            if (this.goal.position.x >= car.position.x && this.goal.position.x <= carEndX &&
                this.goal.position.y >= car.position.y && this.goal.position.y <= carEndY) {
                if(showWinner) {
                    this.setWinnerScreen();
                }
                this.goalAble = true;
                return true;
            }
            return false;
        });
    }

    isGoalOccupied() {
        return this.cars.some(car => {
            const carEndX = car.isHorizontal ? car.position.x + car.length - 1 : car.position.x;
            const carEndY = car.isHorizontal ? car.position.y : car.position.y + car.length - 1;

            return this.goal.position.x >= car.position.x && this.goal.position.x <= carEndX &&
                this.goal.position.y >= car.position.y && this.goal.position.y <= carEndY;
        });
    }

    setWinnerScreen() {
        this.boardElement.innerHTML = '';
        const winnerElement = document.createElement('div');
        winnerElement.textContent = 'You are Human!';
        winnerElement.style.color = 'white';
        winnerElement.style.fontSize = '24px';
        winnerElement.style.textAlign = 'center';
        this.boardElement.appendChild(winnerElement);
    }


    getRandomPosition(length, isHorizontal) {
        const x = Math.floor(Math.random() * (this.width - (isHorizontal ? length : 1))) + 1;
        const y = Math.floor(Math.random() * (this.height - (isHorizontal ? 1 : length))) + 1;

        if (this.isRandomePositionOccupied({ x, y })) {
            return this.getRandomPosition(length, isHorizontal);
        }
        return { x, y };
    }

    isRandomePositionOccupied(position) {
        return this.cars.some(car => {
            const carStartX = car.position.x;
            const carEndX = car.isHorizontal ? car.position.x + car.length - 1 : car.position.x;
            const carStartY = car.position.y;
            const carEndY = car.isHorizontal ? car.position.y : car.position.y + car.length - 1;

            const overlapX = (position.x <= carEndX && position.x >= carStartX) || (position.x + 1 <= carEndX && position.x + 1 >= carStartX);
            const overlapY = (position.y <= carEndY && position.y >= carStartY) || (position.y + 1 <= carEndY && position.y + 1 >= carStartY);

            return overlapX && overlapY;
        });
    }

    getRandomColor() {
        const colors = ['yellow', 'blue', 'green', 'purple', 'orange'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    addCar(car) {
        this.cars.push(car);
        this.boardElement.appendChild(car.element);
    }

    render() {
        this.cars.forEach(car => {
            this.boardElement.appendChild(car.element);
        });
    }

    isPositionOccupied(position, movingCar) {
        return this.cars.some(car => {
            if (car === movingCar) return false;

            const carStartX = car.position.x;
            const carEndX = car.isHorizontal ? car.position.x + car.length - 1 : car.position.x;
            const carStartY = car.position.y;
            const carEndY = car.isHorizontal ? car.position.y : car.position.y + car.length - 1;

            const newCarStartX = position.x;
            const newCarEndX = movingCar.isHorizontal ? position.x + movingCar.length - 1 : position.x;
            const newCarStartY = position.y;
            const newCarEndY = movingCar.isHorizontal ? position.y : position.y + movingCar.length - 1;

            const overlapX = (newCarStartX <= carEndX && newCarEndX >= carStartX);
            const overlapY = (newCarStartY <= carEndY && newCarEndY >= carStartY);

            return overlapX && overlapY;
        });
    }
}

class Goal {
    constructor(position, gameBoard) {
        this.position = position;
        this.gameBoard = gameBoard;
    }
}

function moveCarsRandWhile(maxWhileLoop = 1000) {
    const gameBoard = new GameBoard(8, 8, 10);     
    let whileLoop = 0;
    while (whileLoop < maxWhileLoop) {
        const randomCar = Math.floor(Math.random() * 5);
        const randomDirection = Math.random() < 0.5 ? 'positive' : 'negative';
        if (randomDirection === 'positive') {
            gameBoard.cars[randomCar].movePositive();
        } else {
            gameBoard.cars[randomCar].moveNegative();
        }
        whileLoop++;
    }     
}

moveCarsRandWhile();