const express = require("express"); //server side
const socket = require("socket.io");
const app = express();

const { Board, Led, Button, Sensor } = require("johnny-five");
const board = new Board({ port: "COM4" });

const server = app.listen(3000, () => {
  //za server
  console.log("Listening on port 3000");
});

app.use(express.static("public")); //index.html v public

const io = socket(server); //socket od serverja

board.on("ready", () => {
  //use kar hocs delat z arduinotom pis tuki not

  // Create a standard `led` component instance
  const rdeca = new Led(13); //notr je port
  const zelena = new Led(12);
  const gumb = new Button(2);
  const pot = new Sensor("A0");

  io.on("connection", (socket) => {
    //ko se bo prikljucil client na server se bo to izpisalo
    console.log(`User connected, socket ID: ${socket.id}`);

    gumb.on("press", () => {
      //poslje na client side
      io.sockets.emit("klik", { pritisnjeno: true });
    });

    gumb.on("release", () => {
      io.sockets.emit("klik", { pritisnjeno: false });
    });

    pot.on("change", () => {
      const { val, raw } = pot;

      io.sockets.emit("potpot", { value: raw });
    });

    socket.on("test", (data) => {
      if (data.status) {
        rdeca.on();
        zelena.off();
      } else {
        zelena.on();
        rdeca.off();
      }
    });

    socket.on("klik", (data) => {
      io.sockets.emit("klik", data);
      if (data.status == "klik") console.log("oajnfdk");

      led.toggle();
    });
  });
});
