const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InvitationImage = sequelize.define('InvitationImage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    unique: true
  },
  users_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  invitation_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'invitations',
      key: 'id'
    }
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  image_alt: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  image_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'gallery'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  is_cover: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'invitation_images',
  timestamps: false
});

module.exports = InvitationImage;
