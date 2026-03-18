import useApiService from "@/composables/useApiService";
import {
  ArchiveOutline as ArchiveIcon,
  NuclearOutline,
} from "@vicons/ionicons5";
import useReactivePagination, {
  type PaginationMeta,
} from "@/composables/useReactivePagination";
import { watchDebounced } from "@vueuse/core";
import {
  NText,
  NIcon,
  NDataTable,
  NForm,
  NInput,
  NTag,
  NUpload,
  NUploadDragger,
  type DataTableRowKey,
  type FormInst,
  NP,
  type UploadInst,
  NSpin,
  NProgress,
} from "naive-ui";
import type {
  InternalRowData,
  RowData,
  TableColumns,
} from "naive-ui/es/data-table/src/interface";
import { rowPropKeys } from "naive-ui/es/legacy-grid/src/Row";
import {
  defineComponent,
  reactive,
  ref,
  toRef,
  computed,
  type Ref,
  type ToRef,
  onMounted,
  type ComputedRef,
  type PropType,
  onBeforeMount,
  watch,
  onBeforeUnmount,
  getCurrentInstance,
} from "vue";
import { useAuthStore } from "@/stores/auth";
import useBasicNotification from "@/composables/notifications/useBasicNotification";
import type Pusher from "pusher-js/types/src/core/pusher";
import usePusher from "@/composables/usePusher";
import type ExcelImporter from "./Uploader/ExcelImporter";
// import Echo from 'laravel-echo';
// import Pusher from 'pusher-js';
// Pusher.log = (message) => window.console.log(message);
// @ts-ignore
// window.Pusher = Pusher;
export type InternalDatatableConfig = {
  path: Ref<string | undefined>;
  data: RowData[];
  columns: InternalRowData[];
  pagination: PaginationMeta | null;
};

export default defineComponent({
  name: "DatatableServerSide",
  props: {
    path: {
      type: String,
      required: true,
    },
    columns: {
      type: Object as PropType<TableColumns<any>>,
    },
  },
  emits: ["triggerUpdate", "updatePaginationPage", "updatePaginationPageSize"],
  setup(props, { emit, expose }) {
    const isLoading = ref<boolean>(false);
    const resource = reactive({
      path: toRef(props, "path"),
      data: [],
      columns: [],
      pagination: null,
    });
    const { reactivePaginationProps } = useReactivePagination(
      resource.path as string
    );
    const { setPaginationMeta, pageSize } = reactivePaginationProps;
    const formRef = reactive({
      searchKeyword: null,
    });
    const formTemplateRefs = ref<FormInst | null>(null);

    const fetchBaseUrl = ref("/" + resource.path + "?limit=" + pageSize);
    const fetchBaseSearchUrl = ref(
      "/" + resource.path + "/search?limit=" + pageSize
    );

    const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
    const rowKey = (row: RowData) => row.id;

    const transformHttpResponse = (data: Ref<RowData | any>) => {
      resource.data = data.value.data;
      resource.pagination = data.value.meta;
      setPaginationMeta(resource.pagination as unknown as PaginationMeta);
    };

    const resetReactiveData = () => {
      (resource.data = []),
        (resource.columns = []),
        (resource.pagination = null);
    };

    const startLoadingIndicator = () => {
      isLoading.value = true;
    };

    const stopLoadingIndicator = () => {
      isLoading.value = false;
    };

    const initializeAsynchronousData = async () => {
      startLoadingIndicator();
      try {
        const { data } = await useApiService(fetchBaseUrl).get().json();
        transformHttpResponse(data);
        stopLoadingIndicator();
      } catch (error) {
        stopLoadingIndicator();
        throw error;
      } finally {
      }
    };

    const reinitializeAsyncTask = () => initializeAsynchronousData();

    const reload = () => reinitializeAsyncTask();

    const performAsynchronousSearch = async () => {
      startLoadingIndicator();
      try {
        const { data } = await useApiService(fetchBaseSearchUrl)
          .post({
            search: {
              value: formRef.searchKeyword,
            },
          })
          .json();
        transformHttpResponse(data);
        stopLoadingIndicator();
      } catch (error) {
        stopLoadingIndicator();
        throw error;
      } finally {
      }
    };

    // const longPoolling = ref<number | null>(null);
    // const latestPoolTime = ref<string | null>(null);

    onMounted(() => {
      initializeAsynchronousData();
    });

    onBeforeUnmount(() => {
      // clearInterval(longPoolling.value as number);
    });

    watchDebounced(
      () => formRef.searchKeyword,
      (o, n) => {
        performAsynchronousSearch();
      },
      { debounce: 500, maxWait: 1000 }
    );

    const handlerComponentEvents = {
      onUpdatePage: (page: number, callback?: Function) => {
        // console.log({
        //   pageSize,
        // });
        fetchBaseUrl.value =
          "/" + resource.path + "?page=" + page + "&limit=" + pageSize;
        reinitializeAsyncTask();
        if (typeof callback === "function") {
          callback();
        }
      },
      onUpdatePageSize: (pageSizeLimit: number, callback?: Function) => {
        // console.log({
        //   pageSizeLimit,
        // });
        fetchBaseUrl.value =
          "/" +
          resource.path +
          "?page=" +
          reactivePaginationProps.page +
          "&limit=" +
          pageSizeLimit;
        // console.log({
        //   pageSize,
        // });
        reinitializeAsyncTask();
        if (typeof callback === "function") {
          callback();
        }
      },
      onUpdateCheckedRowkey: (rowKeys: DataTableRowKey[]) => {
        checkedRowKeysRef.value = rowKeys;
      },
    };

    const defineColumns = toRef(props, "columns");
    const defineResourceData: ComputedRef<RowData[]> = computed(
      () => resource.data
    );
    const getLoadingState = computed(() => isLoading.value);

    expose({
      handlerComponentEvents,
      defineColumns,
      reactivePaginationProps,
      resource,
      formRef,
      formTemplateRefs,
      getLoadingState,
      rowKey,
      reload,
      transformHttpResponse,
      fetchBaseSearchUrl,
      stopLoadingIndicator,
      startLoadingIndicator,
    });

    // emit()

    return {
      handlerComponentEvents,
      defineColumns,
      defineResourceData,
      reactivePaginationProps,
      resource,
      formRef,
      formTemplateRefs,
      getLoadingState,
      rowKey,
      reload,
    };
  },
  render() {
    const {
      handlerComponentEvents,
      defineColumns,
      defineResourceData,
      reactivePaginationProps,
      resource,
      formRef,
      formTemplateRefs,
      getLoadingState,
      rowKey,
    } = this;

    const { onUpdatePage, onUpdatePageSize, onUpdateCheckedRowkey } =
      handlerComponentEvents;

    return (
      <div id={"data-table-custom-server-side-renderer"}>
        <div class={["flex flex-row justify-between mt-8"]}>
          <div class={["text-gray-500 text-ellipsis text-md"]}>
            Showing Total{" "}
            <NTag class={["mx-2 px-2 py-2"]}>
              {(resource.pagination as unknown as PaginationMeta)?.total}
            </NTag>{" "}
            Items
          </div>
          <div class={["text-gray-500 text-ellipsis text-md"]}>
            <NForm ref="formTemplateRefs" model={formRef}>
              <NInput
                v-model:value={formRef.searchKeyword}
                placeholder={"Search ...."}
              />
            </NForm>
          </div>
        </div>

        {this.$slots.importer?.()}

        <div class={["mt-8"]}>
          <NDataTable
            remote
            striped
            loading={getLoadingState}
            size="large"
            data={defineResourceData}
            columns={defineColumns}
            rowKey={rowKey}
            pagination={reactivePaginationProps}
            onUpdateCheckedRowKeys={onUpdateCheckedRowkey}
            onUpdatePage={(page) => {
              onUpdatePage(page);
              this.$emit("updatePaginationPage", page);
            }}
            onUpdatePageSize={(pageSize: number) => {
              onUpdatePageSize(pageSize);
              this.$emit("updatePaginationPage", pageSize);
            }}
          />
        </div>
      </div>
    );
  },
});
