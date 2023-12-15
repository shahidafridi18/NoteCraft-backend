const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')
const JWT_SECRET = 'shahidisagoodb$oy';

//R1:outecreate a user using post "/api/auth"
router.post('/createuser', [
  body('name', 'enter a valid name').isLength({ min: 3 }),
  body('email', 'enter a valid email').isEmail(),
  body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  //if there are errors return error
  let success=false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success,errors: errors.array() });
  }
  try {
    //check whether the user with this email exists already
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({success, error: "sorry a user with this email already exists " })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass
    });

    const data = {
      user: {
        id: user.id
      }
    }

    const authtoken = jwt.sign(data, JWT_SECRET);

    success=true;

    res.json({ success,authtoken });


  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occurred");
  }


})

//R2:authenticate a user "/api/auth/login"

router.post('/login', [
  body('email', 'enter a valid email').isEmail(),
  body('password', 'password cannot be blank').exists(),

], async (req, res) => {
  let success=false;

  //if there are errors return error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      success=false;
      return res.status(400).json({error: "please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
       success=false;
      return res.status(400).json({error: "please try to login with correct credentials" });


    }
    const data = {
      user: {
        id: user.id
      }
    }

    const authtoken = jwt.sign(data, JWT_SECRET);
    success=true;


    return res.json({success, authtoken });
  }
  catch (error) {
    console.error(error.message);
   return res.status(500).send("internal server error occurred");


  }

})


//r3: get logged in user details :POST "api/auth/getuser" login required
router.post('/getuser', fetchuser, async (req, res) => {
  try {
    let userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error");
  }

})

module.exports = router