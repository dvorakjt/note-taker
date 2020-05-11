// Dependencies
const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const fs = require("fs");

// Set up the Express App
const app = express();

//Set the port to work with heroku
const PORT = process.env.PORT || 3000;

//Deploy static files (html, css, index.js) from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Set up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Create an empty array...this will be filled with data from db.json if data exists
let noteDB = [];

//Read from db.json
fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) throw err;

    //if data exists, then set noteDB equal to it.
    if (data) {
        noteDB = JSON.parse(data);
    }

    //Once data is read, establish the routes and start the server

    //Get Routes
    app.get("/", (req, res) => {
        res.sendFile("index.html");
    });

    app.get("/notes", (req, res) => {
        res.sendFile("notes.html", { root: "public" });
    });

    app.get("/api/notes", (req, res) => {
        return res.json(noteDB);
    });

    //Post Route
    app.post("/api/notes", (req, res) => {
        let newNote = req.body;
        //generate a unique id using uuidv4 and add a new property to the newNote object to house this number
        newNote["id"] = uuidv4();
        //add the newNote to the array of note objects
        noteDB.push(newNote);
        //stringify the noteDB array of objects and save it to the .json file
        fs.writeFile("./db/db.json", JSON.stringify(noteDB), (err) => {
            if (err) throw err;
            return res.json(noteDB);
        });
    });

    //Delete Route
    app.delete("/api/notes/:id", (req, res) => {
        // console.log("Delete requested.");
        const id = req.params.id;
        noteDB = noteDB.filter(note => note.id !== id);
        fs.writeFile("./db/db.json", JSON.stringify(noteDB), (err) => {
            if (err) throw err;
            return res.json(noteDB);
        });
    });

    //initialize the server!
    app.listen(PORT, () => {
        console.log("App listening on PORT " + PORT);
    });
});
