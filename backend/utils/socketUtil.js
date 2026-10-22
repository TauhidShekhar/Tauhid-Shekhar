let ioInstance = null;
const { clearCache } = require('../middleware/cacheMiddleware');

const socketUtil = {
  setIO: (io) => {
    ioInstance = io;
  },
  getIO: () => {
    return ioInstance;
  },
  emitContentUpdate: (model, action, data) => {
    try {
      clearCache();
    } catch (_) {}
    if (ioInstance) {
      ioInstance.emit('content_update', { model, action, data });
    }
  },
  contentSyncPlugin: (schema) => {
    const broadcast = (model, action, doc) => {
      try {
        clearCache();
      } catch (_) {}
      if (ioInstance) {
        ioInstance.emit('content_update', {
          model: model.toLowerCase(),
          action,
          id: doc?._id,
          data: doc
        });
      }
    };

    schema.post('save', function (doc) {
      if (doc && doc.constructor && doc.constructor.modelName) {
        broadcast(doc.constructor.modelName, 'save', doc);
      }
    });

    schema.post('remove', function (doc) {
      if (doc && doc.constructor && doc.constructor.modelName) {
        broadcast(doc.constructor.modelName, 'remove', doc);
      }
    });

    schema.post('findOneAndDelete', function (doc) {
      if (doc && this.model && this.model.modelName) {
        broadcast(this.model.modelName, 'remove', doc);
      }
    });

    schema.post('findOneAndUpdate', function (doc) {
      if (doc && this.model && this.model.modelName) {
        broadcast(this.model.modelName, 'save', doc);
      }
    });
  }
};

module.exports = socketUtil;
