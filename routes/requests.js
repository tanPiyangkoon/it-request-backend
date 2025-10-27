const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

// ตั้งค่าที่เก็บไฟล์ (upload ไปที่ ./uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File upload validation
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

// Login endpoint with bcrypt password verification
router.post('/login', async (req, res) => {
  const { userId, password } = req.body;

  // Input validation
  if (!userId || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอก User ID และรหัสผ่าน' });
  }

  try {
    const result = await pool.query(
      'SELECT user_id, name, role, email, password FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'รหัสผ่านหรือผู้ใช้ไม่ถูกต้อง' });
    }

    const user = result.rows[0];

    // Compare password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'รหัสผ่านผิด' });
    }

    delete user.password;
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'DB error' });
  }
});
     

// User registration endpoint
router.post('/register', async (req, res) => {
  const { userId, name, email, password, role } = req.body;

  // Input validation
  if (!userId || !name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'กรุณากรอกข้อมูลให้ครบ: User ID, ชื่อ, Email, รหัสผ่าน'
    });
  }

  // Validate role
  const userRole = role || 'user';
  if (!['user', 'admin'].includes(userRole)) {
    return res.status(400).json({ success: false, message: 'Role ไม่ถูกต้อง' });
  }

  // Password strength validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
    });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE user_id = $1 OR email = $2',
      [userId, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User ID หรือ Email นี้ถูกใช้งานแล้ว'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (user_id, name, role, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, role, email, created_at',
      [userId, name, userRole, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'สร้างบัญชีผู้ใช้สำเร็จ',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Database error',
      details: err.message
    });
  }
});

// Enable DB-backed endpoints
router.post('/request', upload.single('image'), async (req, res) => {
  try {
    const { full_name, employee_id, department, position, email, phone, description, category } = req.body;
    let image_url = null;
    if (req.file) {
      image_url = '/uploads/' + req.file.filename;
    }
    const result = await pool.query(
      'INSERT INTO it_requests (full_name, employee_id, department, position, email, phone, description, category, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [full_name, employee_id, department, position, email, phone, description, category || 'อื่นๆ', image_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.get('/requests', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM it_requests ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});


// PUT /api/requests/:id/status - อัปเดตสถานะคำขอ
router.put('/requests/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['pending', 'done', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const result = await pool.query(
      'UPDATE it_requests SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
