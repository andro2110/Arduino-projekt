const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const paketi = document.getElementsByClassName("paket");
const tunel = document.getElementById("tunel");
const senzor = document.getElementById("senzor");
const htmlTeza = document.getElementById("teza");
const htmlPaketi = document.getElementById("skenirano");
const htmlSkTeza = document.getElementById("skTeza");

const socket = io(); //client side
const p = document.getElementById("text");

const key = {
  up: 38,
  down: 40,
  space: "Space",
};

let keysPressed = {
  up: false,
  down: false,
  space: false,
};

let tmpTeza = 10;
let paketZaznan = false;
let skenirano = false;
let poskeniraniPaketi = 0;
let skupnaTeza = 0;

let packets = [];
let crte = [];

class Paket {
  constructor(nr, teza) {
    this.xpos = 65;
    this.ypos = 40;
    this.stevilka = nr;
    this.teza = teza;
  }

  isOff() {
    if (this.xpos >= 1300) return true;
    else return false;
  }

  get getTeza() {
    return this.teza;
  }

  get getPos() {
    const pos = { x: this.xpos, y: this.ypos };
    return pos;
  }

  update() {
    if (this.ypos <= 400) this.ypos += 5;
    else {
      this.xpos += 3;
    }
  }

  render() {
    ctx.drawImage(paketi[this.stevilka], this.xpos, this.ypos, 100, 100);
  }
}

class Lucka {
  constructor(x, y, rd) {
    this.xpos = x;
    this.ypos = y;
    this.radius = rd;
    this.color;
  }

  set setColor(clr) {
    this.color = clr;
  }

  render() {
    ctx.beginPath();
    ctx.arc(this.xpos, this.ypos, this.radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = "10";
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

class Crta {
  constructor(x) {
    this.xpos = x;
    this.ypos = 405;
    this.height = 100;
  }

  narisiCrto(srcX, srY, destX, destY) {
    ctx.beginPath();
    ctx.moveTo(srcX, srY);
    ctx.lineTo(destX, destY);
    ctx.lineWidth = "3";
    ctx.strokeStyle = "#640000";
    ctx.stroke();
  }

  isOff() {
    if (this.xpos >= 1300) return true;
    else return false;
  }

  update() {
    this.xpos += 3;
  }

  render() {
    this.narisiCrto(this.xpos, this.ypos, this.xpos, this.ypos + this.height);
  }
}

function narisiSenzor() {
  ctx.beginPath();
  ctx.moveTo(canvas.width - 550, 405);
  ctx.lineTo(canvas.width - 550, 505);
  ctx.lineWidth = "10";
  ctx.strokeStyle = "#db6400";
  ctx.lineCap = "round";
  ctx.stroke();
}

function narisiTrak() {
  ctx.beginPath();
  ctx.moveTo(0, 455);
  ctx.lineTo(canvas.width - 500, 455);
  ctx.lineWidth = "100";
  ctx.strokeStyle = "#898989";
  ctx.lineCap = "butt";
  ctx.stroke();
}

function initCrte() {
  let razmik = 0;
  for (let i = 0; i < 20; i++) {
    const c = new Crta(razmik);
    crte.push(c);
    razmik += 65;
  }
}

const tunelucka = new Lucka(115, 185, 5);
const senzorLucka = new Lucka(canvas.width - 550, 570, 5);

function gameUpdate() {
  paketZaznan = packets.some((e) => {
    //preverja ce je paket na senzorju

    if (
      e.getPos.x + 100 > canvas.width - 550 &&
      e.getPos.x <= canvas.width - 550
    ) {
      if (skenirano == false) {
        poskeniraniPaketi++;
        skenirano = true;
        skupnaTeza += packets[0].getTeza;
      }

      return true;
    } else {
      skenirano = false;
      return false;
    }
  });

  if (paketZaznan) senzorLucka.setColor = "#ff4646";
  else senzorLucka.setColor = "#00af91";

  packets.forEach((packet) => {
    packet.update();

    if (packet.isOff()) {
      packets.shift();
    }
  });

  crte.forEach((crta) => {
    crta.update();

    if (crta.isOff()) {
      const c = new Crta(0);
      crte.pop();
      crte.unshift(c);
    }
  });

  if (keysPressed.space) {
    tunelucka.setColor = "#ff4646";
  } else {
    tunelucka.setColor = "#00af91";
  }

  htmlTeza.innerHTML = tmpTeza;
  htmlPaketi.innerHTML = poskeniraniPaketi;
  htmlSkTeza.innerHTML = skupnaTeza;
}

function gameRender() {
  narisiTrak();

  crte.forEach((crta) => {
    crta.render();
  });

  packets.forEach((packet) => {
    packet.render();
  });

  ctx.drawImage(tunel, 0, 0, 230, 200);
  narisiSenzor();
  ctx.drawImage(senzor, canvas.width - 600, 505, 100, 200);

  tunelucka.render();
  senzorLucka.render();
}

initCrte();

setInterval(() => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  gameUpdate();
  gameRender();
}, 20);

window.addEventListener("keydown", (e) => {
  if (e.keyCode == key.up) {
    tmpTeza++;
    keysPressed.up = true;
    keysPressed.down = false;
  } else if (e.keyCode == key.down) {
    tmpTeza--;
    keysPressed.down = true;
    keysPressed.up = false;
  }
});

window.addEventListener("keydown", (e) => {
  if (e.code == key.space) {
    keysPressed.space = true;
    const st = Math.floor(Math.random() * 5 + 0);
    const p = new Paket(st, tmpTeza);
    packets.push(p);
    tmpTeza = 10;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code == key.space) {
    keysPressed.space = false;
  }
});

socket.on("klik", (data) => {
  p.innerHTML = data.text;

  console.log(keysPressed);
});
