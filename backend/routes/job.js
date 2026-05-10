const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = 'your-secret-key-here';

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

router.get('/', authenticateToken, (req, res) => {
  try {
    const jobs = db.prepare('SELECT * FROM jobs WHERE company_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/', authenticateToken, (req, res) => {
  const { title, salary_min, salary_max, location, responsibilities, requirements, benefits } = req.body;
  
  if (!title || !salary_min || !salary_max) {
    return res.status(400).json({ error: '请填写必填字段' });
  }

  try {
    const result = db.prepare(
      'INSERT INTO jobs (company_id, title, salary_min, salary_max, location, responsibilities, requirements, benefits) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run([req.user.id, title, salary_min, salary_max, location, responsibilities, requirements, benefits]);
    res.status(201).json({ message: '岗位创建成功', jobId: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: '创建失败' });
  }
});

router.get('/:id', authenticateToken, (req, res) => {
  try {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND company_id = ?').get(req.params.id, req.user.id);
    if (!job) return res.status(404).json({ error: '岗位不存在' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

router.put('/:id', authenticateToken, (req, res) => {
  const { title, salary_min, salary_max, location, responsibilities, requirements, benefits } = req.body;
  
  const params = [];
  let sql = 'UPDATE jobs SET updated_at = CURRENT_TIMESTAMP';
  
  if (title) { sql += ', title = ?'; params.push(title); }
  if (salary_min) { sql += ', salary_min = ?'; params.push(salary_min); }
  if (salary_max) { sql += ', salary_max = ?'; params.push(salary_max); }
  if (location) { sql += ', location = ?'; params.push(location); }
  if (responsibilities) { sql += ', responsibilities = ?'; params.push(responsibilities); }
  if (requirements) { sql += ', requirements = ?'; params.push(requirements); }
  if (benefits) { sql += ', benefits = ?'; params.push(benefits); }
  
  sql += ' WHERE id = ? AND company_id = ?';
  params.push(req.params.id, req.user.id);

  try {
    const result = db.prepare(sql).run(params);
    if (result.changes === 0) return res.status(404).json({ error: '岗位不存在' });
    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
});

router.put('/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  
  try {
    const result = db.prepare(
      'UPDATE jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND company_id = ?'
    ).run([status, req.params.id, req.user.id]);
    if (result.changes === 0) return res.status(404).json({ error: '岗位不存在' });
    res.json({ message: '状态更新成功' });
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
});

router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM jobs WHERE id = ? AND company_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: '岗位不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

router.put('/:id/refresh', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('UPDATE jobs SET updated_at = CURRENT_TIMESTAMP WHERE id = ? AND company_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: '岗位不存在' });
    res.json({ message: '刷新成功' });
  } catch (err) {
    res.status(500).json({ error: '刷新失败' });
  }
});

module.exports = router;
