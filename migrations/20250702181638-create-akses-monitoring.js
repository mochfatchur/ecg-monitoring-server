'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('akses_monitoring', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // pastikan 'users' adalah nama tabel di DB, bukan modelName
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      perangkat_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'perangkat', // pastikan 'perangkat' adalah nama tabel di DB, bukan modelName
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Tambahkan constraint unik agar user tidak punya akses ganda ke perangkat yang sama
    await queryInterface.addConstraint('akses_monitoring', {
      fields: ['user_id', 'perangkat_id'],
      type: 'unique',
      name: 'unique_user_perangkat_access'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('akses_monitoring');
  }
};
