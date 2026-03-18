import { NCard, NModal } from "naive-ui";
import {
  defineComponent,
  toRef,
  type PropType,
  computed,
  type Ref,
  inject,
} from "vue";
export type ModalSize = "small" | "medium" | "large" | "huge" | undefined;
export default defineComponent({
  name: "DatatableDeleteModal",
  props: {
    show: {
      // type: Object as PropType<Ref<Boolean>>,
      type: [Boolean],
      default: false,
      required: true,
    },
    size: {
      validator(value: string | unknown) {
        return ["small", "medium", "large", "huge", undefined].includes(
          value as string
        );
      },
    },
    title: {
      type: String,
    },
    itemID: {
      type: [String, Number],
      required: true,
    },
  },
  emits: ["cancelModalEvent", "confirmModalEvent", "confirmModalEvent"],
  setup(props, { emit }) {
    const itemID = toRef(props, "itemID");
    const showModal = toRef(props, "show");
    const modalSize = toRef(props, "size");
    const modalTitle = toRef(props, "title");

    const onCancel = (id: number | string | any) => {
      emit("cancelModalEvent", itemID);
      showModal.value = false;
    };
    const onConfirm = (id: number | string | any) => {
      emit("confirmModalEvent", itemID);
      showModal.value = false;
    };

    const showState = computed(() => showModal.value);
    const resource = inject("backend");

    return {
      itemID,
      showModal,
      modalSize,
      modalTitle,
      onCancel,
      onConfirm,
      showState,
      resource,
    };
  },
  render() {
    const {
      itemID,
      showModal,
      modalSize,
      modalTitle,
      onCancel,
      onConfirm,
      showState,
      resource,
    } = this;
    return (
      <NModal
        show={showState as boolean}
        size={modalSize as ModalSize}
        role={"dialog"}
        aria-modal={true}
      >
        <NCard
          style={"width: 600px"}
          bordered={false}
          size={"huge"}
          role={"dialog"}
          aria-modal={true}
          segmented={{
            content: true,
          }}
        >
          {{
            default: () => (
              <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      class="h-6 w-6 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 10.5v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.88c-.866-1.501-3.032-1.501-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      class="text-lg font-medium leading-6 text-gray-900"
                      id="modal-title"
                    >{`Delete ${resource}`}</h3>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">{`Are you sure you want to delete ${resource} ? All of your data will be permanently removed. This action cannot be undone.`}</p>
                    </div>
                  </div>
                </div>
              </div>
            ),
            action: () => (
              <div class={["bg-red-900"]}>
                <div class={["bg-gray-50 sm:flex sm:flex-row-reverse sm:px-6"]}>
                  <button
                    onClick={() => onConfirm(itemID)}
                    class={[
                      "inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm",
                    ]}
                  >
                    Confirmed
                  </button>
                  <button
                    onClick={() => onCancel(itemID)}
                    class={[
                      "mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm",
                    ]}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ),
          }}
        </NCard>
      </NModal>
    );
  },
});
