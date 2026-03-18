//somePlugin

import Pusher from "pusher-js";
import type { Plugin } from "vue";
export type PusherAppKey = string;
export type PusherAppCluster = string;
export const key: PusherAppKey = import.meta.env.VITE_PUSHER_APP_KEY;
export const Cluster: PusherAppKey = import.meta.env.VITE_PUSHER_APP_CLUSTER;
export const PusherVue: Plugin = {
  install(app, ...options) {
    if (!key || !Cluster) {
      return;
    }
    app.config.globalProperties.$pusher = new Pusher(key, {
      cluster: Cluster,
    });
  },
};
