/*
  Johan Karlsson (DonKarlssonSan)
*/

class Piece {
  constructor (public pos: p5.Vector, private img: p5.Image, public i: number) {
    this.width = img.width;
    this.height = img.height;
  }
  
  draw() {
    image(this.img, this.pos.x, this.pos.y);
  }
  
  hits(hitpos: p5.Vector) {
    if(hitpos.x > this.pos.x && 
       hitpos.x < this.pos.x + this.width && 
       hitpos.y > this.pos.y && 
       hitpos.y < this.pos.y + this.height) {
      return true;
    }
    return false;
  }
}

class Puzzle {
  private pieces: Array<Piece>;
  private dragPiece: Piece;
  private isDragging: boolean = false;
  private canPlay: boolean = true;
  private clickOffset: p5.Vector;
  private w: number;
  private h: number;
  
  constructor(
    private x: number, 
    private y: number,  
    private img: p5.Image, 
    private side: number) {   
      
    this.pieces = [];
    this.width = img.width;
    this.height = img.height;
    this.w = this.width/side;
    this.h = this.height/side;

    this.placePieces();
  }
  
  private placePieces() {
    for(let y = 0; y < this.side; y++) {
      for(let x = 0; x < this.side; x++) {
        let img = createImage(this.w, this.h);
        img.copy(this.img, this.w*x, this.h*y, this.w, this.h, 0, 0, this.w, this.h);
        let pos = this.randomPos(this.w, this.h);
        let index = x + y * this.side;
        this.pieces.push(new Piece(pos, img, index));
      }
    }
  }

  private randomPos(marginRight: number, marginBottom: number) {
    return createVector(
      random(0, windowWidth-marginRight), 
      random(0, windowHeight-marginBottom));
  } 

  public draw() {
    rect(this.x-1, this.y-1, this.width+1, this.height+1);
    noFill();
    this.pieces.forEach(r => r.draw());
  }

  public mousePressed(x: number, y: number) {
    if(this.canPlay) {
      let m = createVector(x, y);
      let index: number;
      this.pieces.forEach((p, i) => {
        if(p.hits(m)) {
          this.clickOffset = p5.Vector.sub(p.pos, m);
          this.isDragging = true;
          this.dragPiece = p;
          index = i;
        }
      });
      if(this.isDragging) {
        this.putOnTop(index);
      }
    }
  }

  public mouseDragged(x: number, y: number) {
    if(this.isDragging) {
      let m = createVector(x, y);
      this.dragPiece.pos.set(m).add(this.clickOffset);
    } 
  }
  
  public mouseReleased() {
    if(this.isDragging) {
      this.isDragging = false;
      this.snapTo(this.dragPiece);
      this.checkEndGame();
    }
  }

  private putOnTop(index: number) {
    this.pieces.splice(index, 1);
    this.pieces.push(this.dragPiece); 
  }
  
  public snapTo(p: Piece) {
    let dx = this.w/2;
    let dy = this.h/2;
    let x2 = this.x + this.width;
    let y2 = this.y + this.height;
    for(let y = this.y; y < y2; y += this.h) {
      for(let x = this.x; x < x2; x += this.w) {
        if(this.shouldSnapToX(p, x, dx, dy, y2)) {
           p.pos.x = x;
        }
        if(this.shouldSnapToY(p, y, dx, dy, x2)) {
           p.pos.y = y;
        }
      }
    }
  }
  
  private shouldSnapToX(p, x, dx, dy, y2) {
    return this.isOnGrid(p.pos.x, x, dx) && this.isInsideFrame(p.pos.y, this.y, y2-this.h, dy)
  }
  
  private shouldSnapToY(p, y, dx, dy, x2) {
    return this.isOnGrid(p.pos.y, y, dy) && this.isInsideFrame(p.pos.x, this.x, x2-this.w, dx)
  }
  
  private isOnGrid(actualPos, gridPos, d) {
    return actualPos > gridPos - d && actualPos < gridPos + d;
  }

  private isInsideFrame(actualPos, frameStart, frameEnd, d) {
    return actualPos > frameStart - d && actualPos < frameEnd + d;
  }
  
  private checkEndGame() {
    let nrCorrectNeeded = this.side * this.side;
    let nrCorrect = 0;
    this.pieces.forEach(p => {
      let correctIndex = p.i;
      let actualIndex = (p.pos.x - this.x)/this.w + (p.pos.y - this.y)/this.h * this.side; 
      if(actualIndex === correctIndex) {
        nrCorrect += 1;
      }
    });
    if(nrCorrect === nrCorrectNeeded) {
      let h1 = createElement("h1", "Good Job!");
      this.canPlay = false;
    } else {
      console.log("Right places: " + nrCorrect);
    }
  }
}

let puzzle: Puzzle;
let imgCb: p5.Image;

function preload() {
  imgCb = loadImage("https://s3-us-west-2.amazonaws.com/s.cdpn.io/254249/Exit_planet_dust_album_cover.jpg"); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  let x0 = windowWidth/2 - imgCb.width/2;
  let y0 = windowHeight/2 - imgCb.height/2;
  puzzle = new Puzzle(x0, y0, imgCb, 3);
}

function draw() {
  background("white");
  puzzle.draw();
}

function mousePressed() {
  puzzle.mousePressed(mouseX, mouseY);
}

function mouseDragged() {
  puzzle.mouseDragged(mouseX, mouseY);
}

function mouseReleased() {
  puzzle.mouseReleased();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}