const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../database');
const multer = require('multer');
const path = require('path');

const JWT_SECRET = 'your-secret-key-here';
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: '未授权' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'token无效' });
    req.user = user;
    next();
  });
}

router.get('/profile', authenticateToken, (req, res) => {
  try {
    const company = db.prepare('SELECT id, name, contact_name, phone, email, address, business_license, license_number, status FROM companies WHERE id = ?').get(req.user.id);
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

router.put('/profile', authenticateToken, upload.single('business_license'), (req, res) => {
  const { name, contact_name, phone, email, address, license_number } = req.body;
  const business_license = req.file ? `/uploads/${req.file.filename}` : null;

  const params = [];
  let sql = 'UPDATE companies SET updated_at = CURRENT_TIMESTAMP';
  
  if (name) { sql += ', name = ?'; params.push(name); }
  if (contact_name) { sql += ', contact_name = ?'; params.push(contact_name); }
  if (phone) { sql += ', phone = ?'; params.push(phone); }
  if (email) { sql += ', email = ?'; params.push(email); }
  if (address) { sql += ', address = ?'; params.push(address); }
  if (license_number) { sql += ', license_number = ?'; params.push(license_number); }
  if (business_license) { sql += ', business_license = ?'; params.push(business_license); }
  
  sql += ' WHERE id = ?';
  params.push(req.user.id);

  try {
    db.prepare(sql).run(params);
    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
});

router.post('/verify', authenticateToken, upload.single('business_license'), (req, res) => {
  const { license_number } = req.body;
  const business_license = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    db.prepare(
      'UPDATE companies SET license_number = ?, business_license = ?, status = ? WHERE id = ?'
    ).run([license_number, business_license, 'pending', req.user.id]);
    res.json({ message: '资质认证提交成功，等待审核' });
  } catch (err) {
    res.status(500).json({ error: '提交失败' });
  }
});

module.exports = router;
