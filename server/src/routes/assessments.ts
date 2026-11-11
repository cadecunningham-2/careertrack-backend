import { Router, Response } from 'express';
import pool from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/assessments
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { grades, riasec_scores, aptitude_ratings, recommendations } = req.body;

  if (!grades || !riasec_scores || !aptitude_ratings || !recommendations) {
    res.status(400).json({ error: 'grades, riasec_scores, aptitude_ratings, and recommendations are required' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO assessments (user_id, grades, riasec_scores, aptitude_ratings, recommendations)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.user!.userId,
        JSON.stringify(grades),
        JSON.stringify(riasec_scores),
        JSON.stringify(aptitude_ratings),
        JSON.stringify(recommendations),
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/assessments/mine
router.get('/mine', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.display_name, u.email
       FROM assessments a
       JOIN users u ON u.id = a.user_id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [req.user!.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/assessments  (admin only)
router.get('/', authenticate, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.display_name, u.email
       FROM assessments a
       JOIN users u ON u.id = a.user_id
       ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/assessments/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Students can only delete their own; admins can delete any
    let query: string;
    let params: unknown[];

    if (req.user!.role === 'admin') {
      query = 'DELETE FROM assessments WHERE id = $1 RETURNING id';
      params = [id];
    } else {
      query = 'DELETE FROM assessments WHERE id = $1 AND user_id = $2 RETURNING id';
      params = [id, req.user!.userId];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Assessment not found or not authorized' });
      return;
    }
    res.json({ message: 'Assessment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
