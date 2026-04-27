const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // تحقق من الحقول
    if (!email || !password)
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });

    // ابحث عن المستخدم
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: 'البريد الإلكتروني غير موجود' });

    // تحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });

    // أنشئ التوكن
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};