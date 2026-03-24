const sequelize = require('../config/db');
const User = require('./User');
const InvitationTemplate = require('./InvitationTemplate');
const Invitation = require('./Invitation');
const InvitationImage = require('./InvitationImage');
const PrivateInvitation = require('./PrivateInvitation');
const Guest = require('./Guest');
const MessageCheckin = require('./MessageCheckin');
const Groom = require('./Groom');
const Bride = require('./Bride');

// users.id -> *.users_id
User.hasMany(Invitation, { foreignKey: 'users_id', as: 'invitations' });
Invitation.belongsTo(User, { foreignKey: 'users_id', as: 'user' });

User.hasMany(Guest, { foreignKey: 'users_id', as: 'guests' });
Guest.belongsTo(User, { foreignKey: 'users_id', as: 'user' });

User.hasMany(InvitationImage, { foreignKey: 'users_id', as: 'invitationImages' });
InvitationImage.belongsTo(User, { foreignKey: 'users_id', as: 'user' });

User.hasMany(Groom, { foreignKey: 'users_id', as: 'grooms' });
Groom.belongsTo(User, { foreignKey: 'users_id', as: 'user' });

User.hasMany(Bride, { foreignKey: 'users_id', as: 'brides' });
Bride.belongsTo(User, { foreignKey: 'users_id', as: 'user' });

// invitation_templates.id -> invitations.template_id
InvitationTemplate.hasMany(Invitation, { foreignKey: 'template_id', as: 'invitations' });
Invitation.belongsTo(InvitationTemplate, { foreignKey: 'template_id', as: 'template' });

// invitations.id -> invitation_images.invitation_id
Invitation.hasMany(InvitationImage, { foreignKey: 'invitation_id', as: 'images' });
InvitationImage.belongsTo(Invitation, { foreignKey: 'invitation_id', as: 'invitation' });

// invitations.id -> private_invitation.invitationns_id
Invitation.hasMany(PrivateInvitation, { foreignKey: 'invitationns_id', as: 'privateInvitations' });
PrivateInvitation.belongsTo(Invitation, { foreignKey: 'invitationns_id', as: 'invitation' });

// guest.id -> private_invitation.guest_id
Guest.hasOne(PrivateInvitation, { foreignKey: 'guest_id', as: 'privateInvitation' });
PrivateInvitation.belongsTo(Guest, { foreignKey: 'guest_id', as: 'guest' });

// invitations.id -> messages_checkins.invitation_id
Invitation.hasMany(MessageCheckin, { foreignKey: 'invitation_id', as: 'messagesCheckins' });
MessageCheckin.belongsTo(Invitation, { foreignKey: 'invitation_id', as: 'invitation' });

// guest.id -> messages_checkins.guest_id
Guest.hasMany(MessageCheckin, { foreignKey: 'guest_id', as: 'messagesCheckins' });
MessageCheckin.belongsTo(Guest, { foreignKey: 'guest_id', as: 'guest' });

// groom.id / bride.id -> invitations.groom_id / invitations.bride_id
Groom.hasMany(Invitation, { foreignKey: 'groom_id', as: 'invitationsAsGroom' });
Invitation.belongsTo(Groom, { foreignKey: 'groom_id', as: 'groom' });

Bride.hasMany(Invitation, { foreignKey: 'bride_id', as: 'invitationsAsBride' });
Invitation.belongsTo(Bride, { foreignKey: 'bride_id', as: 'bride' });

module.exports = {
  sequelize,
  User,
  InvitationTemplate,
  Invitation,
  InvitationImage,
  PrivateInvitation,
  Guest,
  MessageCheckin,
  Groom,
  Bride
};
