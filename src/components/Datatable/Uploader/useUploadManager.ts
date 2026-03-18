import useBasicNotification from "@/composables/notifications/useBasicNotification";
import usePusher from "@/composables/usePusher";
import { watchDebounced } from "@vueuse/core";
import type { Channel } from "pusher-js";
import {
  computed,
  onBeforeMount,
  onMounted,
  onUnmounted,
  reactive,
  watch,
} from "vue";

export type UploadManagerReturn = {
  state: {
    currentRowIndex: number;
    totalRows: number;
    proggress: number;
    showProggress: boolean;
    broadcaster: Channel | null;
    supportsRealtimeProgress: boolean;
  };
};
export type UploadConfigAction = {
  path: string;
  resource: string | undefined;
};
export type UploadConfig = {
  action: UploadConfigAction;
};
export type onProgressStarted = Function;
export type onProgressFinished = Function;
export type onProgressUpdated = Function;
export default function useUploadManager(
  // config: UploadConfig,
  onProgressStarted?: onProgressStarted,
  onProgressFinished?: onProgressFinished,
  onProgressUpdated?: onProgressUpdated
): UploadManagerReturn {
  const { channel, listenToChannel, unsubscribeChannel } = usePusher();

  // const handler = reactive({
  //   endpoint: import.meta.env.VITE_BACKEND_BASE_URL + config.action.path + config.action.resource
  // })

  const state = reactive({
    currentRowIndex: 0,
    totalRows: 0,
    proggress: 0,
    showProggress: false,
    broadcaster: channel("laravel-system-importer") as Channel | null,
    supportsRealtimeProgress: Boolean(pusher),
  });

  const notificator = useBasicNotification();

  onBeforeMount(() => {
    state.broadcaster?.bind(
      "pusher:subscription_succeeded",
      () => undefined
    );
  });

  onMounted(() => {
    if (!state.broadcaster) {
      return;
    }

    listenToChannel(state.broadcaster as Channel, [
      {
        eventName: "import.event.started",
        eventCallback: (data: any) => {
          state.totalRows = parseInt(Object.values(data.rows)[0] as string);
          notificator.notify(
            "info",
            "Imort State",
            "Importing total : " +
              state.totalRows +
              " From Excel Has Been Started",
            ""
          );
          state.showProggress = true;
          // @ts-ignore
          onProgressStarted(arguments);
        },
      },
      {
        eventName: "import.progress.updated",
        eventCallback: (data: any) => {
          state.currentRowIndex = data.row;
          state.proggress = computed(() => {
            return Math.ceil((state.currentRowIndex / state.totalRows) * 100);
          }).value;
          // @ts-ignore
          onProgressUpdated(arguments);
        },
      },
      {
        eventName: "import.event.finished",
        eventCallback: (data: any) => {
          unsubscribeChannel(state.broadcaster as Channel);
          notificator.notify(
            "success",
            "Import State",
            "Importing total : " +
              state.totalRows +
              " From Excel Done Succesfully",
            ""
          );
          setTimeout(() => {
            state.showProggress = false;
          }, 3000);
          // @ts-ignore
          onProgressFinished(arguments);
        },
      },
    ]);
  });

  onUnmounted(() => {
    unsubscribeChannel(state.broadcaster);
  });

  return {
    // @ts-ignore
    state,
  };
}
