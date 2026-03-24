const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InvitationTemplate = sequelize.define('InvitationTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    unique: true
  },
  template_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  template_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  html_path: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'invitation_templates',
  timestamps: false
});

module.exports = InvitationTemplate;
