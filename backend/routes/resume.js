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

router.get('/', authenticateToken, (req, res) => {
  const { job_id, status, is_favorite } = req.query;
  let sql = 'SELECT * FROM resumes WHERE company_id = ?';
  const params = [req.user.id];

  if (job_id) {
    sql += ' AND job_id = ?';
    params.push(job_id);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (is_favorite !== undefined) {
    sql += ' AND is_favorite = ?';
    params.push(is_favorite);
  }

  sql += ' ORDER BY created_at DESC';
  try {
    const resumes = db.prepare(sql).all(params);
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/', upload.single('resume_file'), (req, res) => {
  const { job_id, name, phone, email, education, experience, skills } = req.body;
  const resume_file = req.file ? `/uploads/${req.file.filename}` : null;

  if (!job_id || !name || !phone) {
    return res.status(400).json({ error: '请填写必填字段' });
  }

  try {
    const job = db.prepare('SELECT company_id FROM jobs WHERE id = ?').get(job_id);
    if (!job) return res.status(404).json({ error: '岗位不存在' });

    const result = db.prepare(
      'INSERT INTO resumes (job_id, company_id, name, phone, email, education, experience, skills, resume_file) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run([job_id, job.company_id, name, phone, email, education, experience, skills, resume_file]);
    res.status(201).json({ message: '投递成功', resumeId: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: '投递失败' });
  }
});

router.get('/:id', authenticateToken, (req, res) => {
  try {
    const resume = db.prepare('SELECT * FROM resumes WHERE id = ? AND company_id = ?').get(req.params.id, req.user.id);
    if (!resume) return res.status(404).json({ error: '简历不存在' });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

router.put('/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  
  try {
    const result = db.prepare(
      'UPDATE resumes SET status = ? WHERE id = ? AND company_id = ?'
    ).run([status, req.params.id, req.user.id]);
    if (result.changes === 0) return res.status(404).json({ error: '简历不存在' });
    res.json({ message: '状态更新成功' });
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
});

router.put('/:id/favorite', authenticateToken, (req, res) => {
  const { is_favorite } = req.body;
  
  try {
    const result = db.prepare(
      'UPDATE resumes SET is_favorite = ? WHERE id = ? AND company_id = ?'
    ).run([is_favorite, req.params.id, req.user.id]);
    if (result.changes === 0) return res.status(404).json({ error: '简历不存在' });
    res.json({ message: '收藏状态更新成功' });
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
});

router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM resumes WHERE id = ? AND company_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: '简历不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
