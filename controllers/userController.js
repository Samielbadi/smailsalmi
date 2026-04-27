const User = require('../models/User');

exports.getFormateurs = async (req, res) => {
  try {
    const formateurs = await User.find({ role: 'formateur' });
    res.json(formateurs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};