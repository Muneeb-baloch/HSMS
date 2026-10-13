// lib/utils/uploadQueue.ts
class UploadQueue {
  private queue: Array<() => Promise<void>> = [];
  private concurrentUploads = 3;
  private activeUploads = 0;

  async add(uploadTask: () => Promise<void>) {
    return new Promise<void>((resolve, reject) => {
      const task = async () => {
        try {
          await uploadTask();
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          this.activeUploads--;
          this.processQueue();
        }
      };

      this.queue.push(task);
      this.processQueue();
    });
  }

  private processQueue() {
    while (
      this.activeUploads < this.concurrentUploads &&
      this.queue.length > 0
    ) {
      this.activeUploads++;
      const task = this.queue.shift();
      task?.();
    }
  }
}
