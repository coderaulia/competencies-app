import {
  type NotificationReactive,
  useNotification,
  type NotificationType,
  NTag,
} from "naive-ui";
import { h, ref, type VNodeChild } from "vue";

/**
 * basic cutom notification from `naive-ui`
 *
 * @see https://www.naiveui.com/en-US/os-theme/components/notification for detailed procedure to cusstomize
 *
 * @date 12/1/2022 - 10:55:11
 * @author ElhakimDev99
 *
 * @returns {({ notificationRef: any; notify(type: any, title: string | (() => any), description: string | (() => any), content: string | (() => any)): void; })}
 */
const useBasicNotification = () => {
  let notification: ReturnType<typeof useNotification> | null = null;

  try {
    notification = useNotification();
  } catch {
    notification = null;
  }

  const notificationRef = ref<NotificationReactive | null>(null);
  return {
    notificationRef,
    notify(
      type: NotificationType,
      title: string | (() => VNodeChild) | undefined,
      description: string | (() => VNodeChild) | undefined,
      content: string | (() => VNodeChild) | undefined
    ) {
      if (!notification) {
        notificationRef.value = null;
        return;
      }

      notificationRef.value = notification.create({
        type,
        title,
        description,
        content,
        duration: 3000,
        onClose: () => {
          notificationRef.value = null;
        },
        meta: () =>
          h(
            NTag,
            { type: type },
            {
              default: () =>
                new Date().toLocaleDateString() +
                " " +
                new Date().toLocaleTimeString(),
            }
          ),
      });
    },
  };
};
export default useBasicNotification;
