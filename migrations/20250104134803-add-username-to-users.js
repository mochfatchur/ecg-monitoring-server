'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Menambahkan kolom `username` ke tabel `Users`
    await queryInterface.addColumn('Users', 'username', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true, // Untuk memastikan setiap username bersifat unik
    });
  },

  async down (queryInterface, Sequelize) {
    // Menghapus kolom `username` jika migrasi dibatalkan
    await queryInterface.removeColumn('Users', 'username');
  }
};
