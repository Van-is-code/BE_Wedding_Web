'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'transfer_content', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('invoices', 'transfer_content', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.sequelize.query("UPDATE orders SET transfer_content = CONCAT('WeddingWeb', UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 10))) WHERE transfer_content IS NULL");
    await queryInterface.sequelize.query("UPDATE invoices SET transfer_content = CONCAT('WeddingWeb', UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 10))) WHERE transfer_content IS NULL");

    await queryInterface.changeColumn('orders', 'transfer_content', {
      type: Sequelize.STRING(255),
      allowNull: false
    });

    await queryInterface.changeColumn('invoices', 'transfer_content', {
      type: Sequelize.STRING(255),
      allowNull: false
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('invoices', 'transfer_content');
    await queryInterface.removeColumn('orders', 'transfer_content');
  }
};
