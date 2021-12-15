'use strict';

// Require the necessary things from Sequelize
const { Sequelize, Op, Model, DataTypes } = require('sequelize');

// This function should be used instead of `new Sequelize()`.
// It applies the config for your SSCCE to work on CI.
const createSequelizeInstance = require('./utils/create-sequelize-instance');

// This is an utility logger that should be preferred over `console.log()`.
const log = require('./utils/log');

// You can use sinon and chai assertions directly in your SSCCE if you want.
const sinon = require('sinon');
const { expect } = require('chai');

async function setUpModels(sequelize) {
  const OutUser = sequelize.define('OutUser', {
    name: DataTypes.TEXT,
  }, { underscored: true });
  const OutWallet = sequelize.define('OutWallet', {
    name: DataTypes.TEXT,
  }, { underscored: true });
  OutUser.hasMany(OutWallet)
  OutWallet.belongsTo(OutUser)

  await sequelize.sync();

  return OutUser
}

// Your SSCCE goes inside this function.
module.exports = async function() {
  const sequelize = createSequelizeInstance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      timestamps: false // For less clutter in the SSCCE
    }
  });

  const OutUser = await setUpModels(sequelize)

  OutUser.create({name: 'foo'})
  await OutUser.findOne({where: {}, include: 'OutWallets'})
};
