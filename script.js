const Peer = window.Peer;

const localId = document.getElementById("js-local-id");
const connectTrigger = document.getElementById("js-connect-trigger");
const remoteId = document.getElementById("js-remote-id");
const messages = document.getElementById("js-messages");
const sdkSrc = document.querySelector("script[src*=skyway]");

let conn = null;

const gap = 8;
const colors = ["#56a764", "#0074bf", "#c93a40", "#de9610"];
const darks = ["#33643c", "#003659", "#7b2226", "#7f5609"];

let state = {
  diff: [0, 0, 0, 0],
  points: [0, 0, 0, 0],
  turns: [0, 0, 0, 0],
};

function copyToClipboard() {
  navigator.clipboard.writeText(localId.textContent);
}

const peer = (window.peer = new Peer({
  key: "970d753a-71db-4bfe-ab4d-9a6300296152",
  debug: 3,
}));  

peer.once("open", (id) => {
  localId.textContent = id;
});

// Register connecter handler
connectTrigger.addEventListener("click", () => {
  if (!peer.open) return;

  conn = peer.connect(remoteId.value);

  conn.once("open", async () => {
    messages.textContent = "Connected";
  });

  conn.on("data", (data) => {
    state = JSON.parse(data);
  });
});


// Register connected peer handler
peer.on("connection", (dataConnection) => {
  conn = dataConnection;

  conn.once("open", async () => {
    messages.textContent = "Connected";
  });

  conn.on("data", (data) => {
    state = JSON.parse(data);
  });
});

peer.on("error", console.error);

// Processing.js

let w, h;

function setup() {
  w = windowWidth / 4;
  h = windowHeight / 4;
  createCanvas(windowWidth, windowHeight);
}  

function draw() {
  // background("#000000");

  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      let color = null;
      if (
        mouseIsPressed &&
        Math.floor(mouseX / w) === x &&
        Math.floor(mouseY / h) === y
      ) {
        color = darks[y];
      } else {
        color = colors[y];
      }  

      const left = x * w + (x % 2 ? 0 : gap);
      const top = y * h + gap;

      fill(color);
      stroke(color);
      rect(left, top, w - gap, h - gap * 2);
    }  
  }  

  fill("white");
  stroke("white");

  textSize(96);
  textAlign(CENTER, CENTER);
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 2; x++) {
      const left = x * w * 2 + gap;
      const top = y * h + gap;
      let num = x === 0 ? "+" + state.diff[y] : state.points[y];
      num = (num + "").replace("+-", "-");
      text(num, left, top, 2 * w, h);
    }  
  }  

  textSize(48);
  textAlign(LEFT, TOP);
  for (let y = 0; y < 4; y++) {
    const top = y * h + 2 * gap;
    const left = 2 * w + 2 * gap;
    text(`第${state.turns[y]}ターン`, left, top);
  }  
}  

function mousePressed() {
  const x = Math.floor(mouseX / w);
  const y = Math.floor(mouseY / h);

  if (x === 0) state.diff[y]--;
  if (x === 1) state.diff[y]++;
  if (x === 2) (state.points[y] -= state.diff[y]), state.turns[y]--;
  if (x === 3) (state.points[y] += state.diff[y]), state.turns[y]++;

  if (conn) conn.send(JSON.stringify(state));
}  
