'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Perangkat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Perangkat dimiliki oleh satu user admin
      Perangkat.belongsTo(models.User, {
        foreignKey: 'user_admin_id',
        as: 'admin',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // Perangkat dapat dimonitor oleh banyak user (tapi 1:1 per user)
      Perangkat.hasMany(models.Monitoring, {
        foreignKey: 'perangkat_id',
        as: 'monitorings',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  Perangkat.init({
    kode: DataTypes.STRING,
    user_admin_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Perangkat',
  });

  return Perangkat;
};