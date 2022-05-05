import * as options from '../options';
import { CloudEvent, CloudFunction } from '../core';
/** Options that can be set on an Eventarc trigger. */
export interface EventarcTriggerOptions extends options.EventHandlerOptions {
    /**
     * Type of the event.
     */
    eventType: string;
    /**
     * ID of the channel. Can be either:
     *   * fully qualified channel resource name:
     *     `projects/{project}/locations/{location}/channels/{channel-id}`
     *   * partial resource name with location and channel ID, in which case
     *     the runtime project ID of the function will be used:
     *     `locations/{location}/channels/{channel-id}`
     *   * partial channel ID, in which case the runtime project ID of the
     *     function and `us-central1` as location will be used:
     *     `{channel-id}`
     *
     * If not specified, the default Firebase channel will be used:
     * `projects/{project}/locations/us-central1/channels/firebase`
     */
    channel?: string;
    /**
     * Eventarc event exact match filter.
     */
    filters?: Record<string, string>;
}
export declare type CloudEventHandler = (event: CloudEvent<any>) => any | Promise<any>;
/** Handle an Eventarc event published on the default channel. */
export declare function onCustomEventPublished<T = any>(eventType: string, handler: CloudEventHandler): CloudFunction<CloudEvent<T>>;
export declare function onCustomEventPublished<T = any>(opts: EventarcTriggerOptions, handler: CloudEventHandler): CloudFunction<CloudEvent<T>>;
