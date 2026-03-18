import type { NotificationType } from "naive-ui";
import { computed, reactive, ref, type Ref } from "vue";
import useBasicNotification from "./notifications/useBasicNotification";
import useApiService from "./useApiService";
import usePageLoader from "./usePageLoader";
export type HttpErrorResponse = {
  message: string;
  meta: string[] | number[];
};
/**
 * Composable function to prepare and handle POST or Update forrm using modal style.
 *
 * @author ElhakimDev99 abdulehakim68@gmail.com
 * @date 12/6/2022 - 14:58:25
 *
 * @export
 * @param {string} basepath the path of api or remote servers that to be used for precessing this form
 * @returns {{ showFormModal: any; openModal: () => void; closeModal: () => void; }}
 */
export default function useFormModalProcessor(basepath: string) {
  /**
   * State of modal binding.
   * @date 12/6/2022 - 15:14:21
   *
   * @type {Ref<boolean>}
   */
  const showFormModal: Ref<boolean> = ref<boolean>(false);

  /**
   * State of spinner
   * @date 12/7/2022 - 19:10:51
   *
   * @type {Ref<boolean>}
   */
  const showSpinner: Ref<boolean> = ref<boolean>(false);

  /**
   * Helper function for opening modal.
   * @date 12/6/2022 - 15:14:57
   */
  const openModal: () => void = () => {
    showFormModal.value = true;
  };

  /**
   * Helper function for close the modal.
   * @date 12/6/2022 - 15:15:16
   */
  const closeModal: () => void = () => {
    showFormModal.value = false;
  };

  /**
   * Helper function for opening modal.
   * @date 12/6/2022 - 15:14:57
   */
  const startSpinner: () => void = () => {
    showSpinner.value = true;
  };

  /**
   * Helper function for close the modal.
   * @date 12/6/2022 - 15:15:16
   */
  const stopSpinner: () => void = () => {
    showSpinner.value = false;
  };

  const formElement = reactive({
    title: ref<string>(""),
  });

  /**
   * Form processor state bindings.
   * @date 12/6/2022 - 15:15:46
   *
   * @type {*}
   */
  const formAction = reactive({
    method: ref<"POST" | "PUT" | "PATCH">("POST"),
    endpoint: ref<string>("/" + basepath),
  });

  /**
   * Hook method for setup post action.
   * @date 12/6/2022 - 15:16:05
   */
  const setupPostAction = (): void => {
    formAction.method = "POST";
    formAction.endpoint = "/" + basepath;
    formElement.title = `Creating new ${basepath} resource`;
    openModal();
  };

  /**
   * Hook method for setup and populate before form is rendered.
   * @date 12/6/2022 - 15:11:03
   *
   * @param {number} id The id is represnet id of current resource.
   * @param {*} response The response from server that to be used to pre-populated from.
   * @param {() => void} setupDependencies The setup hooks for setup dependencies, ie: setup model bindings to the form data.
   */
  const setupUpdateAction = (
    id: number,
    response: any,
    setupDependencies: () => void
  ): void => {
    setupDependencies();
    formAction.method = "PATCH";
    formAction.endpoint = "/" + basepath + "/" + id;
    formElement.title = `Update ${basepath} resource id: [${id}]`;
    openModal();
  };

  /**
   * Notification handler instance.
   * @date 12/7/2022 - 06:09:59
   *
   * @type {*}
   */
  const notificationHandler = useBasicNotification();

  /**
   * get the notification type based on the response status code dynamically
   * @date 12/7/2022 - 06:10:14
   *
   * @param {number} code
   * @returns {(NotificationType | undefined)}
   */
  const getNotificationType = (code: number): NotificationType | undefined => {
    switch (code) {
      case 200:
        return "success";
        break;
      case 422:
        return "warning";
        break;
      case 500:
        return "error";
        break;
    }
  };

  /**
   * Error state
   * @date 12/7/2022 - 06:10:49
   *
   * @type {*}
   */
  const error = reactive<HttpErrorResponse>({
    message: "",
    meta: [],
  });

  /**
   * Error Response getters and setters
   * @date 12/7/2022 - 06:11:00
   *
   * @type {*}
   */
  const ErrorResponse = computed({
    get: () => error,
    set: (value) => {
      error.message = value.message;
      error.meta = value.meta;
    },
  });

  const { loadingStart, loadingFinish, loadingError } = usePageLoader();

  const processPostRequest = async (
    request: any,
    onSuccess: () => void,
    onError: () => void
  ) => {
    startSpinner();
    const { data, statusCode, isFetching, isFinished } = await useApiService(
      formAction.endpoint
    )
      .post(request)
      .json();

    if (isFetching.value) {
      startSpinner();
      loadingStart();
    }

    if (isFinished.value) {
      stopSpinner();
      loadingFinish();
    }

    if (statusCode.value === 201) {
      stopSpinner();
      loadingFinish();
      notificationHandler.notify("success", "Success", "Success", "");
      onSuccess();
      closeModal();
    }

    if (statusCode.value === 422) {
      loadingError();
      ErrorResponse.value = data.value.error;
      notificationHandler.notify(
        "error",
        ErrorResponse.value.message,
        JSON.stringify(error.meta, null, 2),
        ""
      );

      onError();
      setTimeout(() => {
        stopSpinner();
        loadingFinish();
      }, 3000);
    }

    if (statusCode.value === 500) {
      loadingError();
      ErrorResponse.value = data.value.error;
      notificationHandler.notify(
        "error",
        ErrorResponse.value.message,
        JSON.stringify(error.meta, null, 2),
        ""
      );
      onError();

      setTimeout(() => {
        stopSpinner();
        loadingFinish();
      }, 3000);
    }
  };

  /**
   * Processing request that use PATCH method.
   * @date 12/7/2022 - 16:55:51
   *
   * @async
   * @param {*} request
   * @param {() => void} onSuccess
   * @param {() => void} onError
   * @returns {void, onError: () => void) => any}
   */
  const processPatchRequest = async (
    request: any,
    onSuccess: () => void,
    onError: () => void
  ) => {
    startSpinner();
    const { data, statusCode, isFetching, isFinished } = await useApiService(
      formAction.endpoint
    )
      .patch(request)
      .json();

    if (isFetching.value) {
      loadingStart();
    }

    if (isFinished.value) {
      stopSpinner();
      loadingFinish();
    }

    if (statusCode.value === 200) {
      stopSpinner();
      loadingFinish();
      notificationHandler.notify("success", "Success", "Success", "");
      onSuccess();
      closeModal();
    }

    if (statusCode.value === 422) {
      loadingError();
      ErrorResponse.value = data.value.error;
      notificationHandler.notify(
        "error",
        ErrorResponse.value.message,
        JSON.stringify(error.meta, null, 2),
        ""
      );

      onError();
      setTimeout(() => {
        stopSpinner();
        loadingFinish();
      }, 3000);
    }
    if (statusCode.value === 500) {
      loadingError();
      ErrorResponse.value = data.value.error;
      notificationHandler.notify(
        "error",
        ErrorResponse.value.message,
        JSON.stringify(error.meta, null, 2),
        ""
      );

      onError();
      setTimeout(() => {
        stopSpinner();
        loadingFinish();
      }, 3000);
    }
  };

  const flushFormData = (object: Object, setValue: any = null) => {
    for (const [key, value] of Object.entries(object)) {
      // @ts-ignore
      object[key] = setValue;
    }
  };

  return {
    showFormModal,
    showSpinner,
    startSpinner,
    stopSpinner,
    openModal,
    closeModal,
    formAction,
    setupPostAction,
    setupUpdateAction,
    processPostRequest,
    processPatchRequest,
    flushFormData,
    formElement,
    loadingStart,
    loadingFinish,
    loadingError,
  };
}
