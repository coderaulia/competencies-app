import { defineComponent, reactive, ref, computed, toRefs } from "vue";
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

const IMPORT_TEMPLATES: Record<
  string,
  { href: string; title: string; description: string }
> = {
  employments: {
    href: "/import-templates/employments-template.csv",
    title: "Employment CSV Template",
    description:
      "Download, edit in Excel if needed, then upload it back as CSV.",
  },
  "parent-employments": {
    href: "/import-templates/parent-employments-template.csv",
    title: "Reporting Line CSV Template",
    description:
      "Use this to sync employment-parent relationships by WSR code.",
  },
};

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
        emit("update:disableImport", value);
      },
    });

    const { state } = useUploadManager(onStarted, onFinished, onUpdated);

    expose({
      state,
    });

    const uploadHandler = computed(
      () =>
        import.meta.env.VITE_BACKEND_BASE_URL +
        config.action.path +
        (config.action.resource || "")
    );
    const template = computed(() => {
      const resourceKey = String(config.action.resource || "").trim();
      return IMPORT_TEMPLATES[resourceKey] || null;
    });

    return {
      uploadRefs,
      state,
      uploadHandler,
      label,
      isDisabled_,
      template,
    };
  },
  render() {
    const { uploadRefs, state, uploadHandler, template } = this;
    const token = useAuthStore().access_token;

    return (
      <div class={["w-full"]}>
        <div class={["mt-2 flex flex-col gap-2"]}>
          <span class={["font-semibold text-gray-500 text-md"]}>
            {this.label || "Import data"}
          </span>
          {template ? (
            <div class={["rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"]}>
              <div class={["font-semibold"]}>{template.title}</div>
              <div class={["mt-1 text-emerald-700"]}>{template.description}</div>
              <a
                href={template.href}
                download
                class={["mt-3 inline-flex rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"]}
              >
                Download Template
              </a>
            </div>
          ) : (
            ""
          )}
        </div>

        <div class={["mt-8 flex flex-row w-full"]}>
          <NUpload
            ref="uploadRefs"
            action={uploadHandler}
            directoryDnd={true}
            defaultUpload={false}
            accept=".csv,text/csv"
            onBeforeUpload={() => {}}
            onError={({ file, event }) => {}}
            onFinish={({ file, event }) => {}}
            headers={{
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
                Click or drag a CSV file to this area to import data
              </NText>
              <NP>
                Use the provided CSV template. You can edit it in Excel, then
                save and upload it as CSV.
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
          {state.supportsRealtimeProgress && state.showProggress && (
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
