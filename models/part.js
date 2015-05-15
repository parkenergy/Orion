var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var PartSchema = new mongoose.Schema({

  description:    { type: String },
  componentName:  { type: String },
  system:         { type: Number },
  subsystem:      { type: Number },
  engine:         { type: Number },
  compressor:     { type: Number },
  component:      { type: Number },
  revision:       { type: Number },

  vendors: [{
    vendor: { type: DataTypes.ObjectId, ref: 'Vendor', index: true },
    vendorPartNumber:       { type: String },
    vendorPartCost:         { type: Number},
    vendorPartDescription:  { type: String }
  }]

});

PartSchema.virtual('smartPartNumber').get(function () {
  return this.name.first + ' ' + this.name.last;
});

PartSchema.virtual


      smartPartNumber: function () {
        return enumerationHelper.smartPartNumber(this);
      },

      systemName: function () {
        return enumerationHelper.systemName(this);
      },

      subsystemName: function () {
        return enumerationHelper.subsystemName(this);
      },

      engineName: function () {
        return enumerationHelper.engineName(this);
      },

      compressorName: function () {
        return enumerationHelper.compressorName(this);
      },

      subsystemConcatenateNumber: function () {
        return enumerationHelper.subsystemConcatenateNumber(this);
      },

      subsystemConcatenateName: function () {
        return enumerationHelper.subsystemConcatenateName(this);
      },

      concatenateName: function () {
        return enumerationHelper.concatenateName(this);
      }

module.exports = mongoose.model('Parts', PartSchema);









    id:  {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },

    //migrated itemCode to vendorPartNumber on 20140821
    vendorPartNumber: {
      type: DataTypes.STRING
    },

    description: {
      type: DataTypes.STRING
    },

    //migrated component name on 20140821
    componentName: {
      type: DataTypes.STRING
    },

    system: {
      type: DataTypes.INTEGER
    },

    subsystem: {
      type: DataTypes.INTEGER
    },

    //migrated engine on 20140821
    engine: {
      type: DataTypes.INTEGER
    },

    // migrated compressor on 20140821
    compressor: {
      type: DataTypes.INTEGER
    },

    component: {
      type: DataTypes.INTEGER
    },

    revision: {
      type:DataTypes.INTEGER
    },

    quantity: {
      type: DataTypes.INTEGER
    },

    cost: {
      type: DataTypes.FLOAT
    },
