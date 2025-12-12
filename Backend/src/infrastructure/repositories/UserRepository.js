const IUserRepository = require('../../domain/repositories/IUserRepository');
const dbConnection = require('../database/DatabaseConnection');
const User = require('../../domain/entities/User');

class UserRepository extends IUserRepository {
  constructor() {
    super();
  }

  async findAll() {
    try {
      const pool = await dbConnection.getPool();
      const [rows] = await pool.execute(
        'SELECT id, username, email, firstName, lastName, role, isActive, createdAt, updatedAt FROM users ORDER BY createdAt DESC'
      );
      
      return rows.map(row => this.mapRowToUser(row));
    } catch (error) {
      console.error('❌ Error in findAll:', error);
      throw new Error('Database error while fetching users');
    }
  }

  async findById(id) {
    try {
      const pool = await dbConnection.getPool();
      const [rows] = await pool.execute(
        'SELECT id, username, email, firstName, lastName, role, isActive, createdAt, updatedAt FROM users WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapRowToUser(rows[0]);
    } catch (error) {
      console.error('❌ Error in findById:', error);
      throw new Error('Database error while fetching user');
    }
  }

  async findByEmail(email) {
    try {
      const pool = await dbConnection.getPool();
      const [rows] = await pool.execute(
        'SELECT id, username, email, firstName, lastName, role, isActive, createdAt, updatedAt FROM users WHERE email = ?',
        [email]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapRowToUser(rows[0]);
    } catch (error) {
      console.error('❌ Error in findByEmail:', error);
      throw new Error('Database error while fetching user by email');
    }
  }

  async findByUsername(username) {
    try {
      const pool = await dbConnection.getPool();
      const [rows] = await pool.execute(
        'SELECT id, username, email, firstName, lastName, role, isActive, createdAt, updatedAt FROM users WHERE username = ?',
        [username]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapRowToUser(rows[0]);
    } catch (error) {
      console.error('❌ Error in findByUsername:', error);
      throw new Error('Database error while fetching user by username');
    }
  }

  async create(userData) {
    try {
      const pool = await dbConnection.getPool();
      
      const [result] = await pool.execute(
        `INSERT INTO users (username, email, password, firstName, lastName, role, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.username,
          userData.email,
          userData.password,
          userData.firstName,
          userData.lastName,
          userData.role || 'author',
          userData.isActive !== undefined ? userData.isActive : true
        ]
      );
      
      return await this.findById(result.insertId);
      
    } catch (error) {
      console.error('❌ Error in create:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('email')) {
          throw new Error('Email already exists');
        }
        if (error.message.includes('username')) {
          throw new Error('Username already exists');
        }
        throw new Error('User with this email or username already exists');
      }
      
      throw new Error('Database error while creating user');
    }
  }

  async update(id, userData) {
    try {
      const pool = await dbConnection.getPool();
      
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      const fieldsToUpdate = [];
      const values = [];
      
      if (userData.username !== undefined) {
        fieldsToUpdate.push('username = ?');
        values.push(userData.username);
      }
      if (userData.email !== undefined) {
        fieldsToUpdate.push('email = ?');
        values.push(userData.email);
      }
      if (userData.firstName !== undefined) {
        fieldsToUpdate.push('firstName = ?');
        values.push(userData.firstName);
      }
      if (userData.lastName !== undefined) {
        fieldsToUpdate.push('lastName = ?');
        values.push(userData.lastName);
      }
      if (userData.role !== undefined) {
        fieldsToUpdate.push('role = ?');
        values.push(userData.role);
      }
      if (userData.isActive !== undefined) {
        fieldsToUpdate.push('isActive = ?');
        values.push(userData.isActive);
      }
      
      if (fieldsToUpdate.length === 0) {
        return existingUser;
      }
      
      fieldsToUpdate.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id);
      
      const query = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
      
      await pool.execute(query, values);
      
      return await this.findById(id);
      
    } catch (error) {
      console.error('❌ Error in update:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('email')) {
          throw new Error('Email already exists');
        }
        if (error.message.includes('username')) {
          throw new Error('Username already exists');
        }
      }
      
      throw new Error('Database error while updating user');
    }
  }

  async delete(id) {
    try {
      const pool = await dbConnection.getPool();
      
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }
      
      const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
      
      return result.affectedRows > 0;
      
    } catch (error) {
      console.error('❌ Error in delete:', error);
      throw new Error('Database error while deleting user');
    }
  }

  async exists(email, username) {
    try {
      const pool = await dbConnection.getPool();
      const [rows] = await pool.execute(
        'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
        [email, username]
      );
      
      return rows.length > 0;
    } catch (error) {
      console.error('❌ Error in exists:', error);
      throw new Error('Database error while checking user existence');
    }
  }

  mapRowToUser(row) {
    return new User({
      id: row.id,
      username: row.username,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role,
      isActive: Boolean(row.isActive),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
}

module.exports = UserRepository;
