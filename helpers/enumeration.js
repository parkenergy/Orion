/* Declaration
----------------------------------------------------------------------------- */
var PartEnumerationHelper = function () {}

/* Functions
----------------------------------------------------------------------------- */
PartEnumerationHelper.prototype.smartPartNumber = function (obj) {
  var self = this;
  var system = (obj.system).toString();
  var subsystem = self.subsystemConcatenateNumber(obj).toString();
  var component = ('000' + obj.component).substr(-3);
  var revision = (obj.revision).toString();
  return (system + subsystem + "." + component + "." + revision);
};

PartEnumerationHelper.prototype.subsystemConcatenateNumber = function (obj) {
  var subsystem = (obj.subsystem).toString();
  var engine = (obj.engine).toString();
  var compressor = (obj.compressor).toString();
  var concatString = subsystem + engine + compressor;
  var concatNumber = parseInt(concatString);
  return concatNumber;
};

PartEnumerationHelper.prototype.subsystemConcatenateName = function (obj) {
  var self = this;
  if (obj.system === 4) {
    return self.subsystemName(obj) + " " + self.engineName(obj);
  } else if (this.system === 5) {
    return self.subsystemName(obj) + " " + self.compressorName(obj);
  } else {
    return self.subsystemName(obj);
  }
};

PartEnumerationHelper.prototype.concatenateName = function (obj) {
  var self = this;
  return self.systemName(obj) + " " + self.subsystemConcatenateName(obj);
};

PartEnumerationHelper.prototype.systemNames = function () {
  return [ "Structural", "Vessel", "Piping", "Driver", "Compression",
            "Electrical", "Cooling", "Emissions"];
};

PartEnumerationHelper.prototype.systemName = function (obj) {
  var self = this;
  return self.systemNames()[obj.system-1];
};

PartEnumerationHelper.prototype.subsystemNames = function (obj) {
  var subsystemNames = [];

  switch (obj.system) {

  case 1: // Structural
    subsystemNames = ["Skid", "Motor Mount", "Compressor Mount", "Hardware"];
    break;

  case 2: // Vessel
    subsystemNames = ["Discharge Vessel","Suction Vessel","Fuel Scrubber"];
    break;

  case 3: // Piping
    subsystemNames = ["Control Valves", "Ball Valves", "Fuel Tree Piping",
                      "Make Up", "Bypass", "High Discharge Bypass",
                      "Instrument Supply", "Inlet Gas"];
    break;

  case 4: // Driver
    subsystemNames = ["Valve Train", "Ignition", "Cooling", "Air Intake",
                      "Starting", "Lubrication", "Fuel System", "Engine Block",
                      "Electric Motor"];
    break;

  case 5: // Compression
    subsystemNames = ["Coupling", "Compressor Frame", "Lubrication",
                      "Driver Connection"];
    break;

  case 6: // Electrical
    subsystemNames = ["Battery", "Panel", "Wiring/Conduit", "Communications"];
    break;

  case 7: // Cooling
    subsystemNames = ["Gas Cooler", "Jacket Water Cooler"];
    break;

  case 8: // Emissions
    subsystemNames = ["Inlet", "Exhaust", "Controller"];
    break;

  }

  return subsystemNames;

};

PartEnumerationHelper.prototype.subsystemName = function (obj) {
  var self = this;
  return self.subsystemNames(obj)[obj.subsystem - 1];
};

PartEnumerationHelper.prototype.engineNames = function () {
  return ["Universal", "1.6L", "4.3L", "5.7L", "8.0L", "8.1L", "8.8L", "Electric"];
};

PartEnumerationHelper.prototype.engineName = function (obj) {
  var self = this;
  return self.engineNames()[obj.engine];
};

PartEnumerationHelper.prototype.compressorNames = function () {
  return ["Universal", "350 LP", "350 HP", "98", "175", "350 LP/HP"];
};

PartEnumerationHelper.prototype.compressorName = function (obj) {
  var self = this;
  return self.compressorNames()[obj.compressor];
};

/* Exports
----------------------------------------------------------------------------- */
module.exports = PartEnumerationHelper;
