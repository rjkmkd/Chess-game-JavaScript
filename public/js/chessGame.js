const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const getPieceUnicode = (piece) => {
  const unicodePieces = {
    K: "♔",
    Q: "♕",
    R: "♖",
    B: "♗",
    N: "♘",
    P: "♙",

    k: "♚",
    q: "♛",
    r: "♜",
    b: "♝",
    n: "♘",
    p: "♙",
  };
  return unicodePieces[piece.type] || "";
};

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowindex) => {
        // console.log(row, rowindex);
        row.forEach((square, squareindex) => {
            // console.log(squareindex, square);
            const squareElement = document.createElement('div');
            squareElement.classList.add(
                "square",
                (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            if(square){
                const pieceElement = document.createElement("div")
                pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black");
                pieceElement.innerHTML = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color

                pieceElement.addEventListener("dragstart", (e)=>{
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement;
                        sourceSquare = {row: rowindex, col: squareindex};
                        e.dataTransfer.setData("text/plain", "")
                    }
                });

                pieceElement.addEventListener("dragend", (e)=>{
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement)
            }

            squareElement.addEventListener("dragover",(e)=>{
                e.preventDefault()
            });

            squareElement.addEventListener("drop", (e)=>{
                e.preventDefault();
                if(draggedPiece){
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };
                    handelMove(sourceSquare, targetSource)
                }
                
            })
            boardElement.appendChild(squareElement);
        })
    })
    if(playerRole === 'b'){
        boardElement.classList.add("flipped");
    }else{
        boardElement.classList.remove("flipped");
    }
    

};

const handelMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8-source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    }
    socket.emit("move", move)
};

socket.on("playerRole", (role)=>{
    playerRole = role;
    renderBoard()
})
socket.on("spectatorRole", ()=>{
    playerRole = null;
    renderBoard();
})
socket.on("boardState", (fen)=>{
    chess.load(fen);
    renderBoard();
})
socket.on("move", (move)=>{
    chess.move(move);
    renderBoard();
})


renderBoard();

