const mongoose = require('mongoose');
const ContentDraft = require('../models/ContentDraft');
const ContentVersion = require('../models/ContentVersion');

const modelsMap = {
  Project: require('../models/Project'),
  Setting: require('../models/Setting'),
  Skill: require('../models/Skill'),
  Experience: require('../models/Experience'),
  Education: require('../models/Education'),
  Certificate: require('../models/Certificate'),
  Achievement: require('../models/Achievement'),
  Testimonial: require('../models/Testimonial'),
  Blog: require('../models/Blog')
};

// Helper: Run atomic transaction with replica-set validation check
const executeAtomicTransaction = async (operation) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await operation(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    // Catch local standalone MongoDB non-replica error (Code 20) and fallback
    if (error.code === 20 || error.message.includes('replica set')) {
      console.warn('MongoDB environment does not support transactions. Falling back to non-transactional execution.');
      return await operation(null);
    }
    throw error;
  } finally {
    session.endSession();
  }
};

// @desc    Get current draft
// @route   GET /api/cms/draft/:model/:id
// @access  Private (Admin/User)
const getDraft = async (req, res, next) => {
  try {
    const { model, id } = req.params;
    if (!modelsMap[model]) {
      return res.status(400).json({ success: false, message: 'Invalid model name' });
    }

    const query = { resourceModel: model };
    if (id && id !== 'new') query.resourceId = id;
    else query.resourceId = null;

    const draft = await ContentDraft.findOne(query).populate('editor', 'fullName username avatar');
    res.json({ success: true, data: draft });
  } catch (error) {
    next(error);
  }
};

// @desc    Save or update a draft
// @route   POST /api/cms/draft/:model/:id
// @access  Private (Admin/User)
const saveDraft = async (req, res, next) => {
  try {
    const { model, id } = req.params;
    const { draftData } = req.body;
    if (!modelsMap[model]) {
      return res.status(400).json({ success: false, message: 'Invalid model name' });
    }
    if (!draftData) {
      return res.status(400).json({ success: false, message: 'Draft data is required' });
    }

    const query = { resourceModel: model };
    if (id && id !== 'new') query.resourceId = id;
    else query.resourceId = null;

    let draft = await ContentDraft.findOne(query);
    if (draft) {
      draft.draftData = draftData;
      draft.editor = req.user.id || req.user._id;
      await draft.save();
    } else {
      draft = await ContentDraft.create({
        resourceModel: model,
        resourceId: (id && id !== 'new') ? id : null,
        draftData,
        editor: req.user.id || req.user._id
      });
    }

    res.json({ success: true, message: 'Draft saved successfully', data: draft });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish a draft
// @route   POST /api/cms/publish/:model/:id
// @access  Private (Admin/User)
const publishDraft = async (req, res, next) => {
  try {
    const { model, id } = req.params;
    const { comment } = req.body;
    const TargetModel = modelsMap[model];
    if (!TargetModel) {
      return res.status(400).json({ success: false, message: 'Invalid model name' });
    }

    const query = { resourceModel: model };
    if (id && id !== 'new') query.resourceId = id;
    else query.resourceId = null;

    const draft = await ContentDraft.findOne(query);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'No draft found to publish' });
    }

    const editorId = req.user.id || req.user._id;

    const result = await executeAtomicTransaction(async (session) => {
      let liveDoc;
      let isNew = false;

      if (model === 'Setting') {
        // Settings collection is a single document configuration
        liveDoc = await TargetModel.findOne({}).session(session);
        if (!liveDoc) {
          liveDoc = new TargetModel(draft.draftData);
          isNew = true;
        } else {
          Object.assign(liveDoc, draft.draftData);
        }
      } else if (id && id !== 'new') {
        // Modifying existing item
        liveDoc = await TargetModel.findById(id).session(session);
        if (!liveDoc) throw new Error('Live document not found to apply draft updates');
        Object.assign(liveDoc, draft.draftData);
      } else {
        // Creating new item
        liveDoc = new TargetModel(draft.draftData);
        isNew = true;
      }

      // Save live document
      await liveDoc.save({ session });

      // Calculate next version number
      const lastVersion = await ContentVersion.findOne({
        resourceModel: model,
        resourceId: liveDoc._id
      })
        .sort({ version: -1 })
        .session(session);
      
      const nextVersion = lastVersion ? lastVersion.version + 1 : 1;

      // Save version revision record
      await ContentVersion.create(
        [
          {
            resourceModel: model,
            resourceId: liveDoc._id,
            version: nextVersion,
            data: draft.draftData,
            editor: editorId,
            comment: comment || `Published version ${nextVersion}`
          }
        ],
        { session }
      );

      // Delete draft document
      await ContentDraft.deleteOne({ _id: draft._id }).session(session);

      return { liveDoc, version: nextVersion };
    });

    // Broadcast publish event to all connected socket.io clients
    const io = req.app.get('io');
    if (io) {
      io.emit('cms_publish', {
        model,
        id: result.liveDoc._id,
        version: result.version,
        data: result.liveDoc
      });
    }

    res.json({
      success: true,
      message: 'Draft published successfully!',
      data: result.liveDoc,
      version: result.version
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get version history
// @route   GET /api/cms/versions/:model/:id
// @access  Private (Admin/User)
const getVersions = async (req, res, next) => {
  try {
    const { model, id } = req.params;
    if (!modelsMap[model]) {
      return res.status(400).json({ success: false, message: 'Invalid model name' });
    }

    const versions = await ContentVersion.find({
      resourceModel: model,
      resourceId: id
    })
      .sort({ version: -1 })
      .populate('editor', 'fullName username avatar');

    res.json({ success: true, count: versions.length, data: versions });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore version
// @route   POST /api/cms/restore/:versionId
// @access  Private (Admin/User)
const restoreVersion = async (req, res, next) => {
  try {
    const { versionId } = req.params;
    const versionRecord = await ContentVersion.findById(versionId);
    if (!versionRecord) {
      return res.status(404).json({ success: false, message: 'Version record not found' });
    }

    const TargetModel = modelsMap[versionRecord.resourceModel];
    if (!TargetModel) {
      return res.status(400).json({ success: false, message: 'Resource model not resolved' });
    }

    const editorId = req.user.id || req.user._id;

    const result = await executeAtomicTransaction(async (session) => {
      // Find live document and revert fields
      const liveDoc = await TargetModel.findById(versionRecord.resourceId).session(session);
      if (!liveDoc) throw new Error('Live document not found to apply restoration');

      // Revert fields to snapshot data
      Object.assign(liveDoc, versionRecord.data);
      await liveDoc.save({ session });

      // Add a new version indicating restoration source
      const lastVersion = await ContentVersion.findOne({
        resourceModel: versionRecord.resourceModel,
        resourceId: versionRecord.resourceId
      })
        .sort({ version: -1 })
        .session(session);
      
      const nextVersion = lastVersion ? lastVersion.version + 1 : 1;

      await ContentVersion.create(
        [
          {
            resourceModel: versionRecord.resourceModel,
            resourceId: versionRecord.resourceId,
            version: nextVersion,
            data: versionRecord.data,
            editor: editorId,
            comment: `Restored back to version ${versionRecord.version}`
          }
        ],
        { session }
      );

      return { liveDoc, version: nextVersion };
    });

    // Broadcast restoration event to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('cms_publish', {
        model: versionRecord.resourceModel,
        id: result.liveDoc._id,
        version: result.version,
        data: result.liveDoc
      });
    }

    res.json({
      success: true,
      message: `Restored successfully to version ${versionRecord.version}!`,
      data: result.liveDoc,
      version: result.version
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDraft,
  saveDraft,
  publishDraft,
  getVersions,
  restoreVersion
};
