class User {
  constructor({ id, username, email, password, firstName, lastName, role = 'author', isActive = true, createdAt, updatedAt }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.isActive = isActive;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  updateProfile(data) {
    const updatableFields = ['firstName', 'lastName', 'email'];
    updatableFields.forEach(field => {
      if (data[field] !== undefined) {
        this[field] = data[field];
      }
    });
    this.updatedAt = new Date();
  }

  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  activate() {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  hasPermission(action) {
    const permissions = {
      admin: ['create', 'read', 'update', 'delete', 'publish', 'manage_users'],
      editor: ['create', 'read', 'update', 'delete', 'publish'],
      author: ['create', 'read', 'update']
    };

    return permissions[this.role]?.includes(action) || false;
  }
}

module.exports = User;
