import type { PaginationProps } from "naive-ui";
import { reactive, ref, type Ref } from "vue";
export type PaginationMeta = {
  current_page: number | undefined;
  from: number | undefined;
  to: number | undefined;
  last_page: number | undefined;
  links: any[] | undefined;
  per_page: number | undefined;
  total: number | undefined;
};
export const defaultPageSizeOptions = [
  { label: "5 per page", value: 5 },
  { label: "10 per page", value: 10 },
  { label: "15 per page", value: 15 },
  { label: "20 per page", value: 20 },
  { label: "25 per page", value: 25 },
  { label: "50 per page", value: 50 },
  { label: "75 per page", value: 75 },
  { label: "100 per page", value: 100 },
  { label: "500 per page", value: 500 },
  { label: "750 per page", value: 750 },
  { label: "1000 per page", value: 1000 },
];
export type CustomPaginationProps = PaginationProps & {
  setPaginationMeta: (pagination: PaginationMeta) => void;
  onChangePageCallback: (cb: () => void) => void;
};
export type ReactivePagination = {
  resourceName: Ref<string>;
  paginationMeta: Ref<PaginationMeta>;
  reactivePaginationProps: CustomPaginationProps;
};
export type ReactivePaginationFunction = (
  resource: string
) => ReactivePagination;
const useReactivePagination: ReactivePaginationFunction = (
  resource: string
) => {
  const paginationMeta = ref<PaginationMeta>({
    current_page: 0,
    from: 0,
    to: 0,
    last_page: 0,
    links: [],
    per_page: 10,
    total: 0,
  });
  const resourceName = ref(resource);
  const reactivePaginationProps = reactive<CustomPaginationProps>({
    page: paginationMeta.value.current_page ?? 1,
    pageSize: paginationMeta.value.per_page,
    pageSizes: defaultPageSizeOptions,
    defaultPageSize: defaultPageSizeOptions[0].value,
    showSizePicker: true,
    showQuickJumper: true,
    itemCount: paginationMeta.value.total,
    onChange: (page: number) => {
      reactivePaginationProps.page = page;
    },
    onUpdatePageSize: (pageSize: number) => {
      reactivePaginationProps.pageSize = pageSize;
      reactivePaginationProps.page = 1;
    },
    setPaginationMeta: (meta: PaginationMeta | null) => {
      if (meta !== null) {
        reactivePaginationProps.page = meta.current_page;
        reactivePaginationProps.pageSize = meta.per_page;
        reactivePaginationProps.itemCount = meta.total;
      }
    },
    onChangePageCallback: (cb: () => void) => {
      cb();
    },
  });
  return {
    resourceName,
    reactivePaginationProps,
    paginationMeta,
  };
};
export default useReactivePagination;
