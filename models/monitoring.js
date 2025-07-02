'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Monitoring extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Monitoring dilakukan oleh satu user non-admin
      Monitoring.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // Monitoring terhadap satu perangkat
      Monitoring.belongsTo(models.Perangkat, {
        foreignKey: 'perangkat_id',
        as: 'perangkat'
      });
    }
  }
  Monitoring.init({
    user_id: DataTypes.INTEGER,
    perangkat_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Monitoring',
  });
  return Monitoring;
};