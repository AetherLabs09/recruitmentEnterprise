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
  const { resume_id } = req.query;
  let sql = 'SELECT i.*, r.name as candidate_name, r.phone as candidate_phone, j.title as job_title FROM interviews i JOIN resumes r ON i.resume_id = r.id JOIN jobs j ON r.job_id = j.id WHERE i.company_id = ?';
  const params = [req.user.id];

  if (resume_id) {
    sql += ' AND i.resume_id = ?';
    params.push(resume_id);
  }

  sql += ' ORDER BY i.created_at DESC';
  try {
    const interviews = db.prepare(sql).all(params);
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/', authenticateToken, (req, res) => {
  const { resume_id, interview_time, location } = req.body;
  
  if (!resume_id || !interview_time) {
    return res.status(400).json({ error: '请填写必填字段' });
  }

  try {
    const resume = db.prepare('SELECT company_id FROM resumes WHERE id = ?').get(resume_id);
    if (!resume) return res.status(404).json({ error: '简历不存在' });
    if (resume.company_id !== req.user.id) return res.status(403).json({ error: '无权操作' });

    const result = db.prepare(
      'INSERT INTO interviews (resume_id, company_id, interview_time, location) VALUES (?, ?, ?, ?)'
    ).run([resume_id, req.user.id, interview_time, location]);
    
    db.prepare('UPDATE resumes SET status = ? WHERE id = ?').run('interviewing', resume_id);
    res.status(201).json({ message: '面试邀约已发送', interviewId: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: '创建失败' });
  }
});

router.get('/:id', authenticateToken, (req, res) => {
  try {
    const interview = db.prepare('SELECT i.*, r.name as candidate_name, r.phone as candidate_phone, j.title as job_title FROM interviews i JOIN resumes r ON i.resume_id = r.id JOIN jobs j ON r.job_id = j.id WHERE i.id = ? AND i.company_id = ?').get(req.params.id, req.user.id);
    if (!interview) return res.status(404).json({ error: '面试记录不存在' });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

router.put('/:id', authenticateToken, (req, res) => {
  const { interview_time, location, status } = req.body;
  
  const params = [];
  let sql = 'UPDATE interviews SET ';
  
  if (interview_time) { sql += 'interview_time = ?, '; params.push(interview_time); }
  if (location) { sql += 'location = ?, '; params.push(location); }
  if (status) { sql += 'status = ?, '; params.push(status); }
  
  sql = sql.slice(0, -2);
  sql += ' WHERE id = ? AND company_id = ?';
  params.push(req.params.id, req.user.id);

  try {
    const result = db.prepare(sql).run(params);
    if (result.changes === 0) return res.status(404).json({ error: '面试记录不存在' });
    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
});

router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM interviews WHERE id = ? AND company_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: '面试记录不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
