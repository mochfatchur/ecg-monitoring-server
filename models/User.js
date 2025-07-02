'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Jika user adalah admin → punya banyak perangkat
      User.hasMany(models.Perangkat, {
        foreignKey: 'user_admin_id',
        as: 'perangkatDidaftarkan'
      });

      // Jika user adalah non-admin → hanya memonitor satu perangkat
      User.hasOne(models.Monitoring, {
        foreignKey: 'user_id',
        as: 'monitoring'
      });
    }
  }
  User.init({
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};