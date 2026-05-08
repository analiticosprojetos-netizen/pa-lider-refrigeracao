const settingsService = require('./settings.service');

const getSettings = async (req, res, next) => {
  try {
    const data = await settingsService.getSettings();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const data = await settingsService.updateSettings(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
