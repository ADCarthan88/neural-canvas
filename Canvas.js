const { pool, redis } = require('../database/connection');

class Canvas {
  static async create({ title, description, ownerId }) {
    const query = `
      INSERT INTO canvases (title, description, owner_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [title, description, ownerId]);
    return result.rows[0];
  }

  static async findById(id) {
    // Try cache first
    const cached = await redis.get(`canvas:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const query = `
      SELECT c.*, u.username as owner_name
      FROM canvases c
      JOIN users u ON c.owner_id = u.id
      WHERE c.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    const canvas = result.rows[0];
    
    if (canvas) {
      // Cache for 5 minutes
      await redis.setEx(`canvas:${id}`, 300, JSON.stringify(canvas));
    }
    
    return canvas;
  }

  static async updateCanvasData(id, canvasData) {
    const query = `
      UPDATE canvases 
      SET canvas_data = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [JSON.stringify(canvasData), id]);
    
    // Invalidate cache
    await redis.del(`canvas:${id}`);
    
    return result.rows[0];
  }

  static async getUserCanvases(userId) {
    const query = `
      SELECT id, title, description, thumbnail_url, created_at
      FROM canvases
      WHERE owner_id = $1
      ORDER BY updated_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async saveVersion(canvasId, canvasData, userId) {
    const versionQuery = `
      INSERT INTO canvas_versions (canvas_id, version_number, canvas_data, created_by)
      VALUES ($1, (
        SELECT COALESCE(MAX(version_number), 0) + 1
        FROM canvas_versions
        WHERE canvas_id = $1
      ), $2, $3)
      RETURNING version_number
    `;
    
    const result = await pool.query(versionQuery, [canvasId, JSON.stringify(canvasData), userId]);
    return result.rows[0].version_number;
  }
}

module.exports = Canvas;
