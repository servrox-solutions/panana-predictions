import { Cron } from "croner";

class JobScheduler {
  private scheduledJobs: Map<number, Cron> = new Map();

  addJob(id: number, job: Cron) {
    this.scheduledJobs.set(id, job);
  }

  getJob(id: number): Cron | undefined {
    return this.scheduledJobs.get(id);
  }

  removeJob(id: number) {
    const job = this.scheduledJobs.get(id);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(id);
      console.log(`Job ${id} stopped and removed from the scheduler.`);
    }
  }

  getAllJobs(): Map<number, Cron> {
    return this.scheduledJobs;
  }
}

export const jobScheduler = new JobScheduler();
