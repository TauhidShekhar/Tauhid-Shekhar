const mongoose = require('mongoose');

// @desc    Export full database backup as JSON
// @route   GET /api/backup/export
// @access  Private/Admin
const exportBackup = async (req, res, next) => {
  try {
    const collections = ['users', 'projects', 'skills', 'experiences', 'educations', 'messages', 'settings', 'seos', 'blogs', 'testimonials', 'certificates', 'achievements', 'galleries', 'resumes'];
    const backupData = {};

    for (const collName of collections) {
      const model = mongoose.model(
        collName.charAt(0).toUpperCase() + collName.slice(1).replace(/s$/, '')
      );
      if (model) {
        backupData[collName] = await model.find({});
      }
    }

    res.setHeader('Content-disposition', `attachment; filename=portfolio_backup_${Date.now()}.json`);
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    next(error);
  }
};

// @desc    Restore database from JSON backup file
// @route   POST /api/backup/restore
// @access  Private/Admin
const restoreBackup = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'JSON backup file is required' });
    }

    const backupData = JSON.parse(req.file.buffer.toString());

    for (const [collName, docs] of Object.entries(backupData)) {
      const modelName = collName.charAt(0).toUpperCase() + collName.slice(1).replace(/s$/, '');
      const model = mongoose.model(modelName);

      if (model && Array.isArray(docs)) {
        // Clear current documents
        await model.deleteMany({});
        // Re-insert backed up docs
        if (docs.length > 0) {
          await model.insertMany(docs);
        }
      }
    }

    res.json({ success: true, message: 'Database backup restored successfully!' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportBackup,
  restoreBackup
};
