/**
 * Describes the scheduling contract UI components and their logical parent within a host application.
 * Usage: Components should create an adapter to their scheduler of choice and provide it to the NovaSchedulingProvider.
 * This interface out of the box is designed to work with the priorities of the Prioritized Task Scheduling API:
 *   https://developer.mozilla.org/en-US/docs/Web/API/Prioritized_Task_Scheduling_API#task_priorities
 * A scheduler implementation should be able to handle sending tasks to the browser's scheduler, or to a custom scheduler, and then cancelling those tasks as needed.
 */
export interface NovaScheduling {
  /**
   * Schedule a job to be run at some point in the future.
   * @param job The job to be run.
   * @param meta The metadata associated with the job.
   * @returns A job identifier which can be used to cancel the job.
   */
  schedule(job: IJob<any>, meta: IJobMetaData): number;
  /**
   * Cancel a job which has been scheduled.
   * @param jobId The identifier of the job to be cancelled.
   * @returns void
   */
  cancel(jobId: number): void;
}

type IJob<TResult> = (() => Promise<TResult>) | (() => TResult);

export interface IJobMetaData {
  /**
   * The requested priority of the job.
   */
  priority: JobPriority;
  /**
   * The identifier of the type of job. Note that this is not globally
   * unique amongst all instances of a job type.
   */
  id: string;
  /**
   * The identifier of the type of code which scheduled the job. Note that this is
   * not globally unique amongst all instances of calling code.
   */
  scheduledById: string;
}

export type JobPriority = "background" | "user-visible" | "user-blocking";
