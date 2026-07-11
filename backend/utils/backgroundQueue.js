const EventEmitter = require('events');

class BackgroundQueue extends EventEmitter {
  constructor(concurrency = 3) {
    super();
    this.concurrency = concurrency;
    this.queue = [];
    this.active = 0;
    this.results = new Map();
  }

  /**
   * Pushes a new task to the worker queue.
   * @param {string} taskName - Label for the task
   * @param {Function} taskFn - The actual async function to execute
   * @param {Object} args - Arguments to pass to the function
   * @param {number} maxRetries - Maximum retry attempts
   */
  push(taskName, taskFn, args = {}, maxRetries = 3) {
    const taskId = `${taskName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const job = {
      id: taskId,
      name: taskName,
      fn: taskFn,
      args,
      attempts: 0,
      maxRetries,
      status: 'pending',
      created: new Date()
    };
    
    this.queue.push(job);
    this.emit('queued', job);
    this.processNext();
    return taskId;
  }

  async processNext() {
    if (this.active >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    this.active += 1;
    job.status = 'active';
    job.started = new Date();
    this.emit('started', job);

    try {
      // Execute the task
      const result = await job.fn(job.args);
      job.status = 'completed';
      job.completed = new Date();
      job.result = result;
      this.results.set(job.id, { status: 'completed', result, completed: job.completed });
      this.emit('completed', job);
    } catch (error) {
      job.attempts += 1;
      console.error(`Background task ${job.name} (Job: ${job.id}) failed on attempt ${job.attempts}:`, error.message);
      
      if (job.attempts < job.maxRetries) {
        job.status = 'retrying';
        // Exponential backoff: 2s, 4s, 8s...
        const delay = Math.pow(2, job.attempts) * 1000;
        setTimeout(() => {
          this.queue.push(job);
          this.processNext();
        }, delay);
        this.emit('retrying', job);
      } else {
        job.status = 'failed';
        job.completed = new Date();
        job.error = error.message;
        this.results.set(job.id, { status: 'failed', error: error.message, completed: job.completed });
        this.emit('failed', job);
      }
    } finally {
      this.active -= 1;
      this.processNext();
    }
  }

  getJobStatus(taskId) {
    return this.results.get(taskId) || { status: 'unknown' };
  }

  getStats() {
    return {
      pending: this.queue.length,
      active: this.active,
      concurrency: this.concurrency,
      totalProcessed: this.results.size
    };
  }
}

// Singleton background worker instance
const backgroundQueue = new BackgroundQueue(3);

module.exports = backgroundQueue;
