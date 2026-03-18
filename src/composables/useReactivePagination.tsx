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
export const createEmptyPaginationMeta = (
  perPage = defaultPageSizeOptions[1]?.value ?? 10
): PaginationMeta => ({
  current_page: 1,
  from: 0,
  to: 0,
  last_page: 1,
  links: [],
  per_page: perPage,
  total: 0,
});
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
  const paginationMeta = ref<PaginationMeta>(createEmptyPaginationMeta());
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
      const normalizedMeta = {
        ...createEmptyPaginationMeta(reactivePaginationProps.pageSize),
        ...(meta || {}),
      };
      paginationMeta.value = normalizedMeta;
      reactivePaginationProps.page = normalizedMeta.current_page ?? 1;
      reactivePaginationProps.pageSize =
        normalizedMeta.per_page ?? reactivePaginationProps.pageSize;
      reactivePaginationProps.itemCount = normalizedMeta.total ?? 0;
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
