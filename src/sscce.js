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

// Your SSCCE goes inside this function.
module.exports = async function() {
  const sequelize = createSequelizeInstance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      timestamps: false // For less clutter in the SSCCE
    }
  });

  const Pair = sequelize.define('Pair', {
    a: {
      type: DataTypes.INTEGER,
      set: function(value, field) {
        this.setDataValue(field, value)
        this.set('product', this.product)
      }
    },
    b: {
      type: DataTypes.INTEGER,
      set: function(value, field) {
        this.setDataValue(field, value)
        this.set('product', this.product)
      }
    },
    sum: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    product: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      get() {
        return this.a * this.b
      }
    }
  });
  // Sum - using hooks
  Pair.beforeSave(function(instance, options) {
    instance.set('sum', instance.a+instance.b)
  })

  await sequelize.sync();

  log(await Pair.create({ a: 2, b: 3 }));
  const result = await Pair.findOne();
  expect(result.sum).to.equal(5);
  expect(result.product).to.equal(6);
};
