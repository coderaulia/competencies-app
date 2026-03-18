import useApiService from "@/composables/useApiService";
import usePageLoader from "@/composables/usePageLoader";
import type { BucketResource } from "@/models/Bucket";
import type { PublicationResource } from "@/models/Publication";
import {
  NCard,
  NCol,
  NEmpty,
  NGrid,
  NGridItem,
  NRow,
  NStatistic,
} from "naive-ui";
import {
  defineComponent,
  onMounted,
  onBeforeMount,
  computed,
  ref,
  type PropType,
  toRef,
  toRefs,
} from "vue";
import { useRoute, useRouter } from "vue-router";
export type Bucket = BucketResource & {
  id: number;
  created_at: string;
  updated_at: string;
};

export const RenderPublicationItem = defineComponent({
  name: "RenderPublicationItem",
  props: {
    publication: {
      type: Object as PropType<PublicationResource>,
      required: true,
    },
  },
  setup(props) {
    const { publication } = toRefs(props);
    const route = useRoute();
    const router = useRouter();
    const onClickHandler = (e: Event|MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      router.push({
        name: "UploadedPublicationDetail",
        query:{
          // @ts-ignore
          pub_id: publication.value?.id,
        }
      })
    }
    return {
      publicationItem: publication,
      onClickHandler
    };
  },
  render() {
    const { publicationItem, onClickHandler } = this;
    return (
      <NCard
        title={publicationItem.publication_title}
        v-slots={{
          default: () => {
            return (
              <div class={["flex flex-row justify-between"]}>
                <span
                  class={["p-2 border rounded-lg text-white font-semibold"]}
                >
                  {publicationItem.publication_is_verified
                    ? "verified"
                    : "not-verified"}
                </span>
              </div>
            );
          },
          cover: () => {
            return (
              <img
                onClick={(e) => onClickHandler(e)}
                class={["p-3 cursor-pointer"]}
                title={publicationItem.publication_title}
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/1200px-PDF_file_icon.svg.png"
              />
            );
          },
        }}
      />
    );
  },
});

export const RenderPublications = defineComponent({
  name: "RenderPublications",
  props: {
    publications: {
      type: Array as PropType<Array<PublicationResource>>,
      required: true,
    },
  },
  setup(props) {
    const { publications } = toRefs(props);
    return {
      publicationItems: computed(() => publications.value),
    };
  },
  render() {
    return (
      <div class={["grid grid-cols-4 gap-6 py-4 w-full px-1"]}>
        {this.publicationItems &&
          this.publicationItems.map((publication) => {
            return <RenderPublicationItem publication={publication} />;
          })}
      </div>
    );
  },
});

export default defineComponent({
  name: "FileStorageBucket",
  setup() {
    const { loadingStart, loadingFinish } = usePageLoader();

    onBeforeMount(() => {
      loadingStart();
    });
    onMounted(() => {
      setTimeout(() => {
        loadingFinish();
      }, 500);
    });

    const route = useRoute();

    const bucket_ = ref<Bucket | null>(null);

    async function fetchBucketDetail() {
      const { data, statusCode } = await useApiService(
        "/utilities/uploads/libraries/publication-bucket-lists/" +
          route.query.id
      )
        .get()
        .json();
      if (statusCode.value === 200) {
        bucket_.value = data.value.result;
      }
    }

    onBeforeMount(async () => {
      await fetchBucketDetail();
    });

    return {
      route,
      bucket: bucket_,
    };
  },
  render() {
    const { bucket } = this;
    return (
      <div class={["flex flex-col px-6 gap-y-3"]}>
        <NRow class={["px-1"]}>
          <NCard>
            <NCol span={12}>
              <NStatistic label="Bucket Name" value={bucket?.bucket_name} />
            </NCol>
            <NCol span={12}>
              <NStatistic
                label="Bucket Description"
                value={bucket?.bucket_description}
              />
            </NCol>
            <NCol span={12}>
              <NStatistic
                label="Type/Category"
                value={bucket?.bucket_category?.bucket_category_name}
              />
            </NCol>
            <NCol span={12}>
              <NStatistic
                label="Publication Counts"
                value={bucket?.publications?.length}
              />
            </NCol>
          </NCard>
        </NRow>

        {bucket?.publications && bucket?.publications.length !== 0 ? (
          <RenderPublications publications={bucket?.publications} />
        ) : (
          <NRow class={["px-1"]}>
            <NCard>
              <NEmpty description="The publications is empty" />
            </NCard>
          </NRow>
        )}
      </div>
    );
  },
});
