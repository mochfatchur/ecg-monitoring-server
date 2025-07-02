'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class AksesMonitoring extends Model {
        static associate(models) {
            // Relasi ke User
            AksesMonitoring.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            });

            // Relasi ke Perangkat
            AksesMonitoring.belongsTo(models.Perangkat, {
                foreignKey: 'perangkat_id',
                as: 'perangkat',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            });
        }
    }

    AksesMonitoring.init({
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        perangkat_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'AksesMonitoring',
        tableName: 'akses_monitoring',
        freezeTableName: true
    });

    return AksesMonitoring;
};
