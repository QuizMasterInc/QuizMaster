import * as express from 'express';
import { Request } from '../common/providers/https';
import { ManifestEndpoint, ManifestRequiredAPI } from '../runtime/manifest';
import { TaskContext, RateLimits, RetryConfig } from '../common/providers/tasks';
export { 
/** @hidden */
RetryConfig as RetryPolicy, 
/** @hidden */
RateLimits, 
/** @hidden */
TaskContext, };
/**
 * Configurations for Task Queue Functions.
 * @hidden
 */
export interface TaskQueueOptions {
    retryConfig?: RetryConfig;
    rateLimits?: RateLimits;
    /**
     * Who can enqueue tasks for this function.
     * If left unspecified, only service accounts which have
     * roles/cloudtasks.enqueuer and roles/cloudfunctions.invoker
     * will have permissions.
     */
    invoker?: 'private' | string | string[];
}
/** @hidden */
export interface TaskQueueFunction {
    (req: Request, res: express.Response): Promise<void>;
    __trigger: unknown;
    __endpoint: ManifestEndpoint;
    __requiredAPIs?: ManifestRequiredAPI[];
    run(data: any, context: TaskContext): void | Promise<void>;
}
/** @hidden */
export declare class TaskQueueBuilder {
    private readonly tqOpts?;
    private readonly depOpts?;
    onDispatch(handler: (data: any, context: TaskContext) => void | Promise<void>): TaskQueueFunction;
}
/**
 * Declares a function that can handle tasks enqueued using the Firebase Admin SDK.
 * @param options Configuration for the Task Queue that feeds into this function.
 * @hidden
 */
export declare function taskQueue(options?: TaskQueueOptions): TaskQueueBuilder;
