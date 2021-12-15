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

  /* This example demonstrate a few approaches to persisting calculated fields
   * with Sequelize. The approaches are as follows, each calculated field is
   * calculated differently:
   *
   * - sum: Calculate in beforeSave()
   *   This is probably the simplest, but the calculated field will not be
   *   available until after save() is called
   *
   * - exponent: Calculate in getter, set in beforeSave()
   *   This is probably the cleanest option - the value will always be
   *   available via the getter, and it's only set once in the beforeSave()
   *
   * - product: Calculate in a getter, set it in the setters of the fields it depends on 
   *   This is a little duplicative, but still ensures the calculated field
   *   will always be set internally as soon as its dependents are set. There
   *   may be situations where this makes more sense than getter + hooks, but I
   *   don't know of any.
   *
   * - dividend: Calculate only in setters of fields it depends on
   *   This is not recommended because it's very duplicative, it's just here to
   *   demonstrate that the field will always be set even without a getter
   */

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
      get() { return this.a * this.b }
    },
    dividend: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    exponent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      get() { return Math.pow(this.a,this.b) }
    }
  });
  // Sum - using hooks
  Pair.beforeSave(function(instance, options) {
    instance.set('sum', instance.a+instance.b)
    instance.set('exponent', instance.exponent)
    // This is equivalent to the above, and it works, but looks even weirder (and makes some linting mad)
    // instance.exponent = instance.exponent
  })

  await sequelize.sync();

  const pair = Pair.build({ a: 3, b: 2 });
  console.log('Before save', pair.get());
  await pair.save()
  const result = await Pair.findOne();
  expect(result.sum).to.equal(5);
  expect(result.product).to.equal(6);
  expect(result.dividend).to.equal(1.5);
  expect(result.exponent).to.equal(9);
};
