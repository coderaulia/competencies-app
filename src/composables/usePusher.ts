import { getCurrentInstance } from "vue";
import type Pusher from "pusher-js/types/src/core/pusher";
import type { Channel } from "pusher-js";
export type PusherListener = {
  eventName: string;
  eventCallback: Function;
};

export type PusherConnectionEvent =
  | "initialized"
  | "connecting"
  | "connected"
  | "unavailable"
  | "failed"
  | "disconnected";
export default function usePusher() {
  const app = getCurrentInstance();

  const pusher: Pusher = app?.appContext.config.globalProperties.$pusher;

  /**
   * Pusher instance.
   * @date 25/1/2023 - 21.34.38
   *
   * @param {string} channelName
   * @returns {*}
   */
  const channel = (channelName: string) => {
    return pusher.subscribe(channelName);
  };

  /**
   * Listening to channel events
   * @date 25/1/2023 - 21.34.56
   *
   * @param {Channel} channel
   * @param {PusherListener[]} listeners
   */
  const listenToChannel = (channel: Channel, listeners: PusherListener[]) => {
    listeners.forEach(({ eventName, eventCallback }) => {
      channel.bind(eventName, eventCallback);
    });
  };

  /**
   * Unsubscribe this channel
   * @date 25/1/2023 - 21.35.25
   *
   * @param {Channel} channel
   */
  const unsubscribeChannel = (channel: Channel) => {
    channel.unsubscribe();
  };

  return {
    pusher,
    channel,
    listenToChannel,
    unsubscribeChannel,
  };
}
