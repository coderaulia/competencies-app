import type { DataTableColumns } from "naive-ui";
import {
  Eye24Regular,
  Drafts24Regular,
  DeleteDismiss24Regular,
} from "@vicons/fluent";
import { ArrowUndoOutline } from "@vicons/ionicons5";
import { NIcon, NSpace, NTag } from "naive-ui";
import { RouterLink, useRoute } from "vue-router";
import { formatDistance } from "date-fns";
import {
  computed,
  defineComponent,
  ref,
  toRef,
  defineEmits,
  type PropType,
  type Ref,
  watch,
  inject,
} from "vue";
import DatatableDeleteModal from "@/components/Datatable/DatatableDeleteModal";
import { toRefs } from "@vueuse/core";
import type DatatableServerSide from "@/components/Datatable/DatatableServerSide";
import { render } from "naive-ui/es/_utils";
import useBasicNotification from "@/composables/notifications/useBasicNotification";
import useApiService from "@/composables/useApiService";
import usePageLoader from "@/composables/usePageLoader";
export type BuildInDatatableKeys = {
  id: number | string | null | undefined;
  created_at: number | string | null | undefined;
  updated_at: number | string | null | undefined;
  action: any;
};
export function ColumnCreator<T>(arr: T[]): T[] {
  const padLeft = DefaultDataTableColumns().slice(0, 2);
  const padRight = DefaultDataTableColumns().slice(2);
  // @ts-ignore
  return [...padLeft, ...arr, ...padRight];
}
export const DefaultDataTableColumns =
  (): DataTableColumns<BuildInDatatableKeys> => {
    return [
      { type: "selection" },
      {
        title: "Entity ID",
        key: "id",
        minWidth: 75,
        maxWidth: 150,
      },
      {
        title: "DATE CREATED",
        key: "created_at",
        minWidth: 200,
        maxWidth: 300,
        width: 200,
        render(rowData, rowIndex) {
          return <RenderTimeStampColumn date={rowData.created_at as string} />;
        },
      },
      {
        title: "LAST UPDATE",
        key: "updated_at",
        minWidth: 200,
        maxWidth: 300,
        width: 200,
        render(rowData, rowIndex) {
          return <RenderTimeStampColumn date={rowData.updated_at as string} />;
        },
      },
      {
        title: "ACTION",
        key: "action",
        width: 180,
        render(rowData, rowIndex) {
          const showDeleteModal = ref(false);
          const { fullPath } = useRoute();
          const router = fullPath.split("/").pop()?.toString();
          return (
            <div class={["flex w-full justify-start text-xl px-4 space-x-4"]}>
              {/* <RouterLink to={`${router}/${rowData.id}`}>
                <NIcon size={24}>
                  <Eye24Regular />
                </NIcon>
              </RouterLink> */}

              <RenderEditIconAction
                dataId={rowData.id as number}
                href={router} // url path not remote resource path, remote resource is already injecteed
              />

              <RenderDeleteIconAction
                id={rowData.id as string | number}
                href={router}
              />

              {/* <a
                key={rowData.id as number}
                class={["cursor-pointer"]}
                href={`${router}/${rowData.id}/delete`}
                onClick={(e: MouseEvent) => {
                  e.preventDefault();
                  showDeleteModal.value = true;
                }}
              >
                <NIcon size={24}>
                  <DeleteDismiss24Regular />
                </NIcon>
              </a>

              <DatatableDeleteModal
                key={rowData.id as number}
                itemID={rowData.id as any}
                v-model:show={showDeleteModal}
                onCancelModalEvent={(id) =>
                  console.log(`canceled delete id ${id.value}`)
                }
                onConfirmModalEvent={(id) =>
                  console.log(`canceled delete id ${id.value}`)
                }
              /> */}
            </div>
          );
        },
      },
    ];
  };

export const RenderEditIconAction = defineComponent({
  name: "RenderEditIconAction",
  props: {
    dataId: [String, Number],
    href: [String],
  },
  setup(props) {
    const { dataId, href } = toRefs(props);
    return {
      dataId,
      href,
    };
  },
  render() {
    return (
      <a
        key={this.dataId}
        class={["cursor-pointer"]}
        href={`${this.href}/${this.dataId}/edit`}
        onClick={(e: MouseEvent) => {
          e.preventDefault();
          // @ts-ignore
          const RootDataTableComponentRefs: InstanceType<
            typeof DatatableServerSide
          > =
            this.$parent?.$parent?.$parent?.$parent?.$parent?.$parent?.$parent
              ?.$parent;
          RootDataTableComponentRefs?.$emit("triggerUpdate", this.dataId);
        }}
      >
        <NIcon size={24}>
          <Drafts24Regular />
        </NIcon>
      </a>
    );
  },
});
export const RenderDeleteIconAction = defineComponent({
  name: "RenderDeleteIconOption",
  props: {
    id: [String, Number],
    href: [String],
  },
  setup(props, ctx) {
    const { id, href } = toRefs(props);
    const showModal = ref<Boolean>(false);
    const toogleModal = () => {
      showModal.value = !showModal.value;
    };
    const notification = useBasicNotification();
    const backend = inject<Ref<string>>("backend");
    const { loadingStart, loadingFinish, loadingError } = usePageLoader();
    const handleDeleteProcess = async (id: Ref<string | number>) => {
      const url = "/" + (backend?.value as string) + "/" + id.value;
      const { data, statusCode, isFetching, isFinished } = await useApiService(
        url
      )
        .delete()
        .json();
      if (isFetching.value) {
        loadingStart();
      }
      if (isFinished.value) {
        loadingFinish();
      }
      if (statusCode.value === 200) {
        loadingFinish();
        notification.notify(
          "success",
          "Success",
          "Resource was successfully deleted",
          ""
        );
        toogleModal();
      } else {
        loadingError();
        notification.notify(
          "error",
          "Error",
          "An error occurs while deleting resource",
          ""
        );
        setTimeout(() => {
          loadingFinish();
        }, 3000);
      }
    };

    watch(() => showModal.value, () => undefined);
    return {
      id,
      href,
      showModal,
      toogleModal,
      notification,
      handleDeleteProcess,
    };
  },
  render() {
    const {
      id,
      href,
      showModal,
      toogleModal,
      notification,
      handleDeleteProcess,
    } = this;
    return (
      <div>
        <a
          key={id as number}
          class={["cursor-pointer"]}
          href={`${href}/${id}/delete`}
          onClick={(e: MouseEvent) => {
            e.preventDefault();
            toogleModal();
          }}
        >
          <NIcon size={24}>
            <DeleteDismiss24Regular />
          </NIcon>
        </a>

        <DatatableDeleteModal
          key={id}
          itemID={id as string | number}
          v-model:show={showModal}
          onCancelModalEvent={(id) => {
            toogleModal();
            notification.notify(
              "info",
              "Cancelled",
              "Your data is still save",
              ""
            );
          }}
          onConfirmModalEvent={(id) => {
            handleDeleteProcess(id);
            // @ts-ignore
            const RootDataTableComponentRefs: InstanceType<
              typeof DatatableServerSide
            > =
              this.$parent?.$parent?.$parent?.$parent?.$parent?.$parent?.$parent
                ?.$parent;
            RootDataTableComponentRefs.reload();
          }}
        />
      </div>
    );
  },
});
export const RenderTimeStampColumn = defineComponent({
  name: "RenderUpdateAtColumn",
  props: {
    date: [String, Number],
  },
  setup(props, ctx) {
    const column = toRef(props, "date");

    const formatedDate = computed(() => {
      return formatDistance(
        new Date(column.value as unknown as string),
        Date.now()
      );
    });

    return {
      formatedDate,
    };
  },
  render() {
    const { formatedDate } = this;
    return (
      <div>
        <NSpace class={["flex justify-between"]}>
          <NIcon>
            <ArrowUndoOutline />
          </NIcon>
          <NTag size="small">{formatedDate + " ago"}</NTag>
        </NSpace>
      </div>
    );
  },
});

export const RenderBooleanColumn = defineComponent({
  props: {},
  setup(props, ctx) {
    return {};
  },
  render() {
    return <div></div>;
  },
});
