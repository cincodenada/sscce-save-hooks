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
        this.set('dividend', this.a/this.b)
      }
    },
    b: {
      type: DataTypes.INTEGER,
      set: function(value, field) {
        this.setDataValue(field, value)
        this.set('product', this.product)
        this.set('dividend', this.a/this.b)
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
    },
    dividend: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  });
  // Sum - using hooks
  Pair.beforeSave(function(instance, options) {
    instance.set('sum', instance.a+instance.b)
  })

  await sequelize.sync();

  const pair = Pair.build({ a: 3, b: 2 });
  console.log('Sum before save:', pair.sum);
  console.log('Product before save:', pair.product);
  console.log('Dividend before save:', pair.dividend);
  await pair.save()
  const result = await Pair.findOne();
  expect(result.sum).to.equal(5);
  expect(result.product).to.equal(6);
  expect(result.dividend).to.equal(1.5);
};
