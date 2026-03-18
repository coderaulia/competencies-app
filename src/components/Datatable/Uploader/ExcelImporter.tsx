import { defineComponent, reactive, ref, computed, watch } from "vue";
import {
  NUpload,
  NUploadDragger,
  NSpin,
  NProgress,
  NP,
  NText,
  NIcon,
  type UploadInst,
} from "naive-ui";
import {
  ArchiveOutline as ArchiveIcon,
  NuclearOutline,
} from "@vicons/ionicons5";
import { useAuthStore } from "@/stores/auth";
import useUploadManager, { type UploadConfig } from "./useUploadManager";
import { toRefs } from "@vueuse/core";
export default defineComponent({
  name: "ExcelImporter",
  props: {
    path: String,
    label: String,
    disableImport: Boolean,
  },
  emits: [
    "onProgessStarted",
    "onProgessUpdated",
    "onProgessFinished",
    "update:disableImport",
    "update:path",
  ],
  setup(props, { emit, expose }) {
    const { path, label, disableImport } = toRefs(props);

    const uploadRefs = ref<UploadInst | null>(null);

    const config: UploadConfig = reactive({
      action: {
        path: "/utilities/importers/",
        resource: computed({
          get: () => path.value,
          set: (value) => {
            emit("update:path", value);
          },
        }),
      },
    });

    const onStarted = () => undefined;
    const onUpdated = () => undefined;
    const onFinished = () => undefined;

    const isDisabled_ = computed({
      get: () => disableImport.value,
      set: (value) => {
        // disableImport.value = value,
        emit("update:disableImport", value);
      },
    });
    watch(() => path.value, () => undefined);

    const { state } = useUploadManager(onStarted, onFinished, onUpdated);

    expose({
      state,
    });

    const uploadHandler = computed(
      () =>
        import.meta.env.VITE_BACKEND_BASE_URL +
        config.action.path +
        config.action.resource
    );

    watch(() => uploadHandler.value, () => undefined);

    // const handler = reactive({
    //   endpoint: import.meta.env.VITE_BACKEND_BASE_URL + config.action.path + config.action.resource
    // })

    return {
      uploadRefs,
      state,
      // handler,
      uploadHandler,
      label,
      disableImport,
      isDisabled_,
    };
  },
  render() {
    const { uploadRefs, state, disableImport, uploadHandler } = this;
    return (
      <div class={["w-full"]}>
        <div class={["mt-2"]}>
          <span class={["font-semibold text-gray-500 text-md"]}>
            {this.label}
          </span>
        </div>

        <div class={["mt-8 flex flex-row w-full"]}>
          <NUpload
            ref="uploadRefs"
            action={uploadHandler}
            directoryDnd={true}
            defaultUpload={false}
            onBeforeUpload={() => {}}
            onError={({ file, event }) => {}}
            onFinish={({ file, event }) => {}}
            headers={{
              Accept: "application/json",
              Authorization:
                "Bearer " + useAuthStore().$state.authorization?.access_token,
            }}
            method={"POST"}
            name={"xlsx_doc"}
          >
            <NUploadDragger>
              <div>
                <NIcon size="48" depth="3">
                  <ArchiveIcon />
                </NIcon>
              </div>
              <NText class={["text-xl"]}>
                Click or drag a file to this area to importing data
              </NText>
              <NP>
                Please upload using supported document (XLSX Format), instead it
                will be ignored.
              </NP>
            </NUploadDragger>
          </NUpload>
        </div>

        <div
          class={[
            "mt-8 flex flex-row justify-between items-center align-middle",
          ]}
        >
          <button
            class={[
              "inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none sm:w-auto sm:text-sm disabled:cursor-not-allowed disabled:bg-opacity-50 disabled:hover:bg-green-600 disabled:hover:bg-opacity-50",
            ]}
            onClick={(e) => {
              uploadRefs?.submit();
            }}
            disabled={this.isDisabled_}
          >
            Import Now
          </button>
        </div>
        <div class={["w-full mt-8"]}>
          {state.showProggress && (
            <NProgress
              type="line"
              status="success"
              v-model:percentage={state.proggress}
              processing
              showIndicator={true}
              indicatorPlacement={"inside"}
            />
          )}
        </div>
      </div>
    );
  },
});
