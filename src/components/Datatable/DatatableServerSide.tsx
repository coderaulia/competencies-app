import useApiService from "@/composables/useApiService";
import {
  ArchiveOutline as ArchiveIcon,
  NuclearOutline,
} from "@vicons/ionicons5";
import useReactivePagination, {
  createEmptyPaginationMeta,
  type PaginationMeta,
} from "@/composables/useReactivePagination";
import { watchDebounced } from "@vueuse/core";
import {
  NDataTable,
  NForm,
  NInput,
  NTag,
  type FormInst,
  type DataTableRowKey,
} from "naive-ui";
import type {
  InternalRowData,
  RowData,
  TableColumns,
} from "naive-ui/es/data-table/src/interface";
import {
  defineComponent,
  reactive,
  ref,
  toRef,
  computed,
  onMounted,
  type ComputedRef,
  type PropType,
  onBeforeUnmount,
} from "vue";
import useBasicNotification from "@/composables/notifications/useBasicNotification";
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
    const notification = useBasicNotification();
    const resource = reactive({
      path: toRef(props, "path"),
      data: [],
      columns: [],
      pagination: createEmptyPaginationMeta(),
    });
    const { reactivePaginationProps } = useReactivePagination(
      resource.path as string
    );
    const { setPaginationMeta } = reactivePaginationProps;
    const formRef = reactive({
      searchKeyword: null,
    });
    const formTemplateRefs = ref<FormInst | null>(null);

    const fetchBaseUrl = ref("");
    const fetchBaseSearchUrl = ref("");

    const buildCollectionUrl = (
      page = reactivePaginationProps.page ?? 1,
      limit = reactivePaginationProps.pageSize ?? createEmptyPaginationMeta().per_page
    ) => `/${resource.path}?page=${page}&limit=${limit}`;

    const buildSearchUrl = (
      limit = reactivePaginationProps.pageSize ?? createEmptyPaginationMeta().per_page
    ) => `/${resource.path}/search?limit=${limit}`;

    const syncRequestUrls = (
      page = reactivePaginationProps.page ?? 1,
      limit = reactivePaginationProps.pageSize ?? createEmptyPaginationMeta().per_page
    ) => {
      fetchBaseUrl.value = buildCollectionUrl(page, limit);
      fetchBaseSearchUrl.value = buildSearchUrl(limit);
    };

    const resetTableState = (pageSize = reactivePaginationProps.pageSize) => {
      const emptyPagination = createEmptyPaginationMeta(pageSize);
      resource.data = [];
      resource.pagination = emptyPagination;
      setPaginationMeta(emptyPagination);
    };

    const handleFetchFailure = (
      statusCode?: number | null,
      message = "Unable to load table data right now."
    ) => {
      resetTableState();
      if (statusCode && statusCode !== 401) {
        notification.notify("error", "Request failed", message, "");
      }
    };

    syncRequestUrls(
      reactivePaginationProps.page,
      reactivePaginationProps.pageSize
    );

    const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
    const rowKey = (row: RowData) => row.id;

    const transformHttpResponse = (payload: RowData | any) => {
      const response = payload?.value ?? payload ?? {};
      const pagination = response.meta || createEmptyPaginationMeta();

      resource.data = Array.isArray(response.data) ? response.data : [];
      resource.pagination = pagination;
      setPaginationMeta(pagination as PaginationMeta);
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
        const { data, statusCode } = await useApiService(fetchBaseUrl).get().json();
        if (statusCode.value === 200) {
          transformHttpResponse(data);
        } else {
          handleFetchFailure(
            statusCode.value,
            data.value?.error?.message || "Unable to load table data right now."
          );
        }
      } catch (error) {
        handleFetchFailure(undefined);
      } finally {
        stopLoadingIndicator();
      }
    };

    const reinitializeAsyncTask = () => initializeAsynchronousData();

    const reload = () => reinitializeAsyncTask();

    const performAsynchronousSearch = async () => {
      const keyword = String(formRef.searchKeyword || "").trim();
      if (!keyword) {
        syncRequestUrls(1, reactivePaginationProps.pageSize);
        await initializeAsynchronousData();
        return;
      }

      startLoadingIndicator();
      try {
        const { data, statusCode } = await useApiService(fetchBaseSearchUrl)
          .post({
            search: {
              value: keyword,
            },
          })
          .json();
        if (statusCode.value === 200) {
          transformHttpResponse(data);
        } else {
          handleFetchFailure(
            statusCode.value,
            data.value?.error?.message || "Unable to search table data right now."
          );
        }
      } catch (error) {
        handleFetchFailure(undefined, "Unable to search table data right now.");
      } finally {
        stopLoadingIndicator();
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
      () => {
        performAsynchronousSearch();
      },
      { debounce: 500, maxWait: 1000 }
    );

    const handlerComponentEvents = {
      onUpdatePage: (page: number, callback?: Function) => {
        syncRequestUrls(page, reactivePaginationProps.pageSize);
        reinitializeAsyncTask();
        if (typeof callback === "function") {
          callback();
        }
      },
      onUpdatePageSize: (pageSizeLimit: number, callback?: Function) => {
        syncRequestUrls(1, pageSizeLimit);
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
