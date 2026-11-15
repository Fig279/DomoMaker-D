const models = require('../models');

const Domo = models.Domo;

// render the app page, react loads the domos
const makerPage = (req, res) => {
  return res.render('app');
};

// create a domo owned by the logged in user
const makeDomo = async (req, res) => {
  if (!req.body.name || !req.body.age || !req.body.mood) {
    return res.status(400).json({ error: 'Name, age, and mood are required!' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    mood: req.body.mood,
    owner: req.session.account._id,
  };

  try {
    const newDomo = new Domo(domoData);
    await newDomo.save();
    return res.status(201).json({
      name: newDomo.name,
      age: newDomo.age,
      mood: newDomo.mood,
    });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists!' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid domo data!' });
    }
    return res.status(500).json({ error: 'An error occured making domo!' });
  }
};

// update one of the logged in user's domos
const editDomo = async (req, res) => {
  const { id, name, age, mood } = req.body;

  if (!id || !name || !age || !mood) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    // owner in the query so users can only edit their own domos
    const query = { _id: id, owner: req.session.account._id };
    const domo = await Domo.findOne(query).exec();

    if (!domo) {
      return res.status(404).json({ error: 'Domo not found!' });
    }

    domo.name = name;
    domo.age = age;
    domo.mood = mood;
    await domo.save();

    return res.json({ name: domo.name, age: domo.age, mood: domo.mood });
  } catch (err) {
    console.log(err);
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid domo data!' });
    }
    return res.status(500).json({ error: 'An error occured editing domo!' });
  }
};

// json list of the logged in user's domos
const getDomos = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Domo.find(query).select('name age mood').lean().exec();

    return res.json({ domos: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving domos!' });
  }
};

module.exports = {
  makerPage,
  makeDomo,
  editDomo,
  getDomos,
};
