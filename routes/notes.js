const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser')
const Notes = require('../models/Notes')


//R1: get all the notes using get "auth/api/fetchallnotes"
router.get('/fetchallnotes', fetchuser, async (req, res) => {

    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);


    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");

    }


})


//R2: add a new note using post"auth/api/addnote"
router.post('/addnote', fetchuser, [
    body('title', 'enter a valid title').isLength({ min: 3 }),
    body('description', 'description must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {

    try {
        const { title, description, tag } = req.body;
        //if there are errors return error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Notes({
            title, description, tag, user: req.user.id

        })

        const savedNote = await note.save();
        res.json(savedNote)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");

    }



})

//R3: update a existing note using put /api/notes/updatenote login required

router.put('/updatenote/:id', fetchuser, async (req, res) => {

    try {
        const { title, description, tag } = req.body;

        //create a new note object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //find the note to be updated and update it

        let note = await Notes.findById(req.params.id);
        if (!note) {
            res.status(404).send("not found");
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not allowed");
        }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");


    }



})
//R4: delete a existing note using delete /api/notes/updatenote login required

router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {
        //find the note to be deleted and delete it

        let note = await Notes.findById(req.params.id);
        if (!note) {
            res.status(404).send("not found");
        }
        //Allow deletion only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not allowed");
        }

        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({ "succes": "notes has been deleted", note: note });


    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");



    }




})


module.exports = router