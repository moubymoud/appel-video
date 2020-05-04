require("dotenv").config();
var sslRedirect = require("heroku-ssl-redirect");
// Initialisation et authentification
var twillioAuthToken =
  process.env.HEROKU_AUTH_TOKEN || process.env.LOCAL_AUTH_TOKEN;
var twillioAccountSID =
  process.env.HEROKU_TWILLIO_SID || process.env.LOCAL_TWILLIO_SID;
var twilio = require("twilio")(twillioAccountSID, twillioAuthToken);
var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var path = require("path");
var public = path.join(__dirname, "public");
const url = require("url");

// force le ssl par redirection
app.use(sslRedirect());

// Simplifie l'url
app.use(function (req, res, next) {
  if (req.path.substr(-1) === "/" && req.path.length > 1) {
    let query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

// La liste des URL sur la plateforme
app.get("/", function (req, res) {
  res.sendFile(path.join(public, "landing.html"));
});

app.get("/docteur", function (req, res) {
  res.sendFile(path.join(public, "docteur.html"));
});

app.get("/rdv", function (req, res) {
  res.sendFile(path.join(public, "rdv.html"));
});

app.get("/join/", function (req, res) {
  res.redirect("/");
});

app.get("/join/*", function (req, res) {
  if (Object.keys(req.query).length > 0) {
    logIt("redirect:" + req.url + " to " + url.parse(req.url).pathname);
    res.redirect(url.parse(req.url).pathname);
  } else {
    res.sendFile(path.join(public, "chat.html"));
  }
});

app.get("/notsupported", function (req, res) {
  res.sendFile(path.join(public, "notsupported.html"));
});

app.get("/notsupportedios", function (req, res) {
  res.sendFile(path.join(public, "notsupportedios.html"));
});

// Rend les fichier dans "public" statique
app.use(express.static("public"));

// Affichage des informations
function logIt(msg, room) {
  if (room) {
    console.log(room + ": " + msg);
  } else {
    console.log(msg);
  }
}

// Initialisation de la téléconsultation
io.on("connection", function (socket) {
  // Faire en sorte qu'une 3ème personne n'assiste pas a la téléconsultation
  socket.on("join", function (room) {
    logIt("A client joined the room", room);
    var clients = io.sockets.adapter.rooms[room];
    var numClients = typeof clients !== "undefined" ? clients.length : 0;
    if (numClients === 0) {
      socket.join(room);
    } else if (numClients === 1) {
      socket.join(room);
      // Informer que le patient est connecté.
      logIt("Broadcasting ready message", room);
      // Permettre le début de la télconsultation
      socket.broadcast.to(room).emit("willInitiateCall", room);
      socket.emit("ready", room).to(room);
      socket.broadcast.to(room).emit("ready", room);
    } else {
      logIt("room already full", room);
      socket.emit("full", room);
    }
  });

  // Utililsation du token de twilio pour faire les échanges et instaurer la téléconsultation
  socket.on("token", function (room) {
    logIt("Received token request", room);
    twilio.tokens.create(function (err, response) {
      if (err) {
        logIt(err, room);
      } else {
        logIt("Token generated. Returning it to the browser client", room);
        socket.emit("token", response).to(room);
      }
    });
  });

  // Relai médecin
  socket.on("candidate", function (candidate, room) {
    logIt("Received candidate. Broadcasting...", room);
    socket.broadcast.to(room).emit("candidate", candidate);
  });

  // Relai patient 
  socket.on("offer", function (offer, room) {
    logIt("Received offer. Broadcasting...", room);
    socket.broadcast.to(room).emit("offer", offer);
  });

  // Mise en place de la vidéo
  socket.on("answer", function (answer, room) {
    logIt("Received answer. Broadcasting...", room);
    socket.broadcast.to(room).emit("answer", answer);
  });
});

// Essaie de voir pour Heroku, sinon va sur 3000
var port = process.env.PORT || 3000;
http.listen(port, function () {
  console.log("http://localhost:" + port);
});
