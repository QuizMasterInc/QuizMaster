import * as options from '../options';
import { HttpsFunction } from './https';
import { AuthData, RateLimits, Request, RetryConfig } from '../../common/providers/tasks';
export { AuthData, RateLimits, Request, RetryConfig as RetryPolicy };
export interface TaskQueueOptions extends options.GlobalOptions {
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
export interface TaskQueueFunction<T = any> extends HttpsFunction {
    run(data: Request<T>): void | Promise<void>;
}
/** Handle a request sent to a Cloud Tasks queue. */
export declare function onTaskDispatched<Args = any>(handler: (request: Request<Args>) => void | Promise<void>): TaskQueueFunction<Args>;
/** Handle a request sent to a Cloud Tasks queue. */
export declare function onTaskDispatched<Args = any>(options: TaskQueueOptions, handler: (request: Request<Args>) => void | Promise<void>): TaskQueueFunction<Args>;
