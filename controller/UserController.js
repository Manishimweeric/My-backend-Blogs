const UserModel = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
   
    const newUser = new UserModel({ email, password});
    await newUser.save();
    res.status(201).json({ message: 'Signup successful', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error signing up', error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = jwt.sign({ id: user._id }, 'secret_key123', { expiresIn: '5h' });
    

    res.status(200).json({ message: 'Login successful', token: `Bearer ${token}` });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};


