let piece;
let pieces = { white: {}, black: {} };
let tablePlaces;
let startSquare;
let whosTurn = "white";
let peasantFirstStep = {};
["white", "black"].forEach((color) => {
    for (let i = 1; i <= 8; i++) {
        peasantFirstStep[`${color}-peasant${i}`] = true;
    }
});

class chessPiece {
    constructor(htmlEle, type, color, possibleSteps, startPos) {
        this.htmlEle = htmlEle;
        this.type = type;
        this.color = color;
        this.possibleSteps = possibleSteps;
        this.startPos = startPos;
    }

    initialize() {
        let template = document.querySelector(`template[id = ${this.color}-${this.type}`);
        let figure = template.content.cloneNode(true);
        //figure.id = this.name;

        this.htmlEle.appendChild(figure);

        this.htmlEle.addEventListener("drag", dragging);
        this.htmlEle.addEventListener("dragstart", dragStart);

        let startSquare = document.querySelector(`div[id *= '${this.startPos}'`);
        startSquare.appendChild(this.htmlEle);
    }

    calcPossiblePositions(closestSquare, pieceID) {
        let splittedID = pieceID.split("-");
        let calcAround = closestSquare.id.split("-");//array of where the piece is [x,y]
        calcAround[0] = Number(calcAround[0]);
        calcAround[1] = Number(calcAround[1]);
        let newPossiblePositions = [];
        if (this.type == "king") {

            for (let i = -1; i <= 1; i++) {
                if (0 < i + Number(calcAround[0]) && i + Number(calcAround[0]) < 9) {
                    for (let j = -1; j <= 1; j++) {
                        if (0 < j + Number(calcAround[1]) && j + Number(calcAround[1]) < 9) {
                            let position = `${Number(calcAround[0]) + i}-${Number(calcAround[1]) + j}`;
                            let squareOfPos = document.querySelector(`div[id ='${position}']`);

                            if (!squareOfPos.hasChildNodes() || (squareOfPos.hasChildNodes() && squareOfPos.children[0].id.split("-")[0] != whosTurn)) {
                                newPossiblePositions.push(position);
                            }
                        }

                    }
                }

            }

        } else if (this.type == "queen") {
            [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]].forEach((dir) => {
                let pieceInWay = false;
                let newPos = calcAround;
                let notOutOfBounds = checkOutOfBound(newPos);
                let multiplier = 1;
                let positions = this.calcWithDir(dir, pieceInWay, notOutOfBounds, multiplier, newPos);
                newPossiblePositions.push(...positions);
            });
        } else if (this.type == "rock") {
            [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach((dir) => {
                let pieceInWay = false;
                let newPos = calcAround;
                let notOutOfBounds = checkOutOfBound(newPos);
                let multiplier = 1;
                let positions = this.calcWithDir(dir, pieceInWay, notOutOfBounds, multiplier, newPos);
                newPossiblePositions.push(...positions);
            });
        } else if (this.type == "bishop") {
            [[1, 1], [-1, -1], [1, -1], [-1, 1]].forEach((dir) => {
                let pieceInWay = false;
                let newPos = calcAround;
                let notOutOfBounds = checkOutOfBound(newPos);
                let multiplier = 1;
                let positions = this.calcWithDir(dir, pieceInWay, notOutOfBounds, multiplier, newPos);
                newPossiblePositions.push(...positions);
            });
        } else if (this.type == "knight") {
            [[2, 1], [1, 2], [-1, 2], [-2, 1], [-1, -2], [-2, -1], [2, -1], [1, -2]].forEach((dir) => {
                let posToCheck = [calcAround[0] + dir[0], calcAround[1] + dir[1]];
                let notOutOfBounds = checkOutOfBound(posToCheck);

                if (notOutOfBounds) {
                    let squareEle = document.querySelector(`div[id ='${posToCheck.join("-")}']`);
                    let pieceInWay = squareEle.hasChildNodes();
                    if (pieceInWay && squareEle.children[0].id.split("-")[0] != whosTurn) {
                        newPossiblePositions.push(posToCheck.join("-"));
                        notOutOfBounds = false;
                    } else if (!pieceInWay){
                        newPossiblePositions.push(posToCheck.join("-"));
                        notOutOfBounds = false; //so we step out 

                    }


                }


            });
        } else if (this.type == "peasant") {
            for (let i = -1; i <= 1; i++) {
                let position = `${this.color == "white" ? Number(calcAround[0]) - 1 : Number(calcAround[0]) + 1}-${Number(calcAround[1]) + i}`;
                let notOutOfBounds = checkOutOfBound(position);

                if (notOutOfBounds) {
                    let squareOfPos = document.querySelector(`div[id ='${position}']`);
                    let enemyOnPos = (squareOfPos.hasChildNodes() && squareOfPos.children[0].id.split("-")[0] != whosTurn) ? true : false;
                    let pieceOnPos = (squareOfPos.hasChildNodes()) ? true : false;
                    if ((i == 0 && !pieceOnPos) || (i != 0 && enemyOnPos)) {
                        newPossiblePositions.push(position);
                    }
                }
            }
            if (peasantFirstStep[pieceID]) {
                let moveDirection = splittedID[0] == "white" ? -1 : 1;
                newPossiblePositions.push(`${Number(calcAround[0]) + (moveDirection * 2)}-${calcAround[1]}`);

            }

        }

        pieces[splittedID[0]][splittedID[1]].possibleSteps = newPossiblePositions;
    }

    calcWithDir(dir, pieceInWay, notOutOfBounds, multiplier, newPos) {
        let positions = [];
        while (!pieceInWay && notOutOfBounds) {
            let posToCheck = [newPos[0] + dir[0] * multiplier, newPos[1] + dir[1] * multiplier];
            notOutOfBounds = checkOutOfBound(posToCheck);

            if (notOutOfBounds) {
                let squareEle = document.querySelector(`div[id ='${posToCheck.join("-")}']`);
                pieceInWay = squareEle.hasChildNodes();
                pieceInWay ? squareEle.children[0].id.split("-")[0] == whosTurn ? null : positions.push(posToCheck.join("-")) : positions.push(posToCheck.join("-"));

            }

            multiplier++;

        }
        return positions;
    }
}


document.addEventListener("DOMContentLoaded", () => {
    let pieceNames = ["rock1", "knight1", "bishop1", "queen", "king", "bishop2", "knight2", "rock2", "peasant1", "peasant2", "peasant3", "peasant4", "peasant5", "peasant6", "peasant7", "peasant8"];
    ["black", "white"].forEach((color) => {
        whosTurn = color; // for the initial pos calculation
        pieceNames.forEach((pieceName, i) => {
            let start = color == "white" ? 72 - i : 9 + i;
            let row = Math.floor(start / 8);
            let col = start % 8;
            if (col == 0) {
                col = 8;
                row--;
            }
            console.log(pieceName, color, row, col);

            let pieceID = `${color}-${pieceName}`;
            let pieceType = isNaN(Number(pieceName[pieceName.length - 1])) ? pieceName : pieceName.slice(0, -1);
            let startPos = `${row}-${col}`;
            let startSquare = document.querySelector(`div[id = '${startPos}']`);

            let div = document.createElement("div");
            div.class = "chessPiece";
            div.id = pieceID;
            div.setAttribute("draggable", true);
            pieces[color][pieceName] = new chessPiece(div, pieceType, color, ["1-1"], startPos);
            pieces[color][pieceName].initialize();


        });
        pieceNames.forEach((pieceName) => {
            let startSquare = document.querySelector(`div[id = '${pieces[color][pieceName].startPos}']`);
            let pieceID = `${color}-${pieceName}`;

            pieces[color][pieceName].calcPossiblePositions(startSquare, pieceID);
        });
    });

    tablePlaces = document.querySelectorAll(".square");

    console.dir(tablePlaces);



    tablePlaces.forEach((square) => {
        square.addEventListener("dragover", draggedOver);
        square.addEventListener("dragenter", dragEntered);
        square.addEventListener("dragleave", dragLeft);
        square.addEventListener("drop", pieceDroped);
        square.addEventListener("dragend", dragEnded);

    });

});

function checkOutOfBound(pos = [0, 0]) {
    let notOutOfBounds = true;
    (pos.includes("0") || pos.includes(0)) ? notOutOfBounds = false : null;
    (pos.includes("9") || pos.includes(9)) ? notOutOfBounds = false : null;
    pos[0] < 0 ? notOutOfBounds = false : null;
    pos[0] > 8 ? notOutOfBounds = false : null;
    pos[1] < 0 ? notOutOfBounds = false : null;
    pos[1] > 8 ? notOutOfBounds = false : null;
    
    return notOutOfBounds
}

function dragging(e) {
    //console.log(e.target.id + " is dragged");
}

function dragStart(e) {
    if (e.target.id.includes(whosTurn)) {
        //console.log(e.target.id + " is started dragging");
        piece = e.target;
        startSquare = piece.closest(".square");
        //recalculate possible squares
        let pieceSplittedID = piece.id.split("-");
        pieces[pieceSplittedID[0]][pieceSplittedID[1]].calcPossiblePositions(startSquare, piece.id);
    } else {
        e.preventDefault();
    }

}

function draggedOver(e) {
    e.preventDefault();
    //console.log(" dragging over" + e.target.id );
}

function dragEntered(e) {
    //console.log(" drag entered in" + e.target.id );
    if (e.target.classList.contains("square")) {
        e.target.classList.add("highLightSquare");
    }
}

function dragLeft(e) {
    //console.log(" drag left " + e.target.id );
    if (e.target.classList.contains("square")) {
        e.target.classList.remove("highLightSquare");
    }
}


function pieceDroped(e) {
    //console.log(" piece droped in" + e.target.id );

    let closestSquare = e.target.closest(".square");
    //console.dir(closestSquare);
    // get the object of the piece
    let splittedID = piece.id.split("-");
    let figureObj = pieces[splittedID[0]][splittedID[1]];

    //check if the piece can step there
    let moveToPos = closestSquare.id;

    if (figureObj.possibleSteps.includes(moveToPos)) { //this means we put down the piece...

        //check if we hit something
        let targetChildrenID = closestSquare.hasChildNodes() ? closestSquare.children[0].id.split("-") : false;
        if (targetChildrenID && targetChildrenID[0] != whosTurn) {//then we hit another color's piece
            let graveyard = document.querySelector(`div#for${String(targetChildrenID[0]).charAt(0).toUpperCase() + String(targetChildrenID[0]).slice(1)}`);
            let pieceWrapper = closestSquare.children[0];
            //and we put it to graveyard
            graveyard.appendChild(pieceWrapper);
            //and remove draggable attribute
            pieceWrapper.setAttribute("draggable", "false");
        }
        //console.dir(e.target);

        closestSquare.appendChild(piece);
        closestSquare.classList.remove("highLightSquare");

        //so we have to re calculate the possible squares based on the piece
        pieces[splittedID[0]][splittedID[1]].calcPossiblePositions(closestSquare, piece.id);

        //check extra stuff :
        // is peasent first move?
        if (piece.id.includes("peasant")) {
            peasantFirstStep[piece.id] = false;
        }

        //set the turn to other player. 
        whosTurn = piece.id.includes("white") ? "black" : "white";
    } else {
        e.target.classList.remove("highLightSquare");
    }
}


function dragEnded(e) {
    //console.log(" dragging finished on square" + e.target.id );
}