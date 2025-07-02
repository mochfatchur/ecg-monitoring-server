'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Perangkat extends Model {
    static associate(models) {
      // Perangkat dimiliki oleh satu user admin
      Perangkat.belongsTo(models.User, {
        foreignKey: 'user_admin_id',
        as: 'admin',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // Perangkat bisa diakses oleh banyak user melalui akses_monitoring
      Perangkat.belongsToMany(models.User, {
        through: models.AksesMonitoring,
        foreignKey: 'perangkat_id',
        otherKey: 'user_id',
        as: 'aksesUsers'
      });
    }
  }

  Perangkat.init({
    kode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    user_admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Perangkat',
    tableName: 'perangkat',
    freezeTableName: true
  });

  return Perangkat;
};
