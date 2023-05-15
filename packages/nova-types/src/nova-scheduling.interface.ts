export interface NovaScheduling {
  schedule(job: IJob<any>, meta: IJobMetaData): number;
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
   * unique amongst all instance of a job type.
   */
  id: string;
  /**
   * The identifier of the type of code which scheduled the job. Not that this is
   * not globally unique amongst all instances of calling code.
   */
  scheduledById: string;
}

export type JobPriority = "background" | "user-visible" | "user-blocking";
