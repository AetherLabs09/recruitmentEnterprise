const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = 'your-secret-key-here';

router.post('/register', (req, res) => {
  const { name, contact_name, phone, email, address, license_number, password } = req.body;
  
  if (!name || !contact_name || !phone || !password) {
    return res.status(400).json({ error: '请填写必填字段' });
  }

  try {
    const hash = bcrypt.hashSync(password, 10);
    const result = db.run(
      'INSERT INTO companies (name, contact_name, phone, email, address, license_number, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, contact_name, phone, email, address, license_number, hash]
    );
    res.status(201).json({ message: '注册成功', companyId: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: '注册失败' });
  }
});

router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  
  try {
    const company = db.prepare('SELECT * FROM companies WHERE phone = ?').get(phone);
    
    if (!company) return res.status(401).json({ error: '账号或密码错误' });

    const isMatch = bcrypt.compareSync(password, company.password);
    if (!isMatch) return res.status(401).json({ error: '账号或密码错误' });

    const token = jwt.sign({ id: company.id, name: company.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, company: { id: company.id, name: company.name, phone: company.phone, status: company.status } });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
