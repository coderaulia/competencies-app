import useApiService from "@/composables/useApiService";
import type { BucketCollections } from "@/models/Bucket";
import { Archive24Regular } from "@vicons/fluent";
import {
  NAvatar,
  NButton,
  NCard,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NP,
  NSelect,
  NText,
  NUpload,
  NUploadDragger,
  type SelectRenderLabel,
  type UploadCustomRequestOptions,
  type UploadFileInfo,
  type UploadInst,
} from "naive-ui";
import { useRouter } from "vue-router";
import {
  defineComponent,
  ref,
  computed,
  reactive,
  onBeforeMount,
  watch,
} from "vue";
import useBasicNotification from "@/composables/notifications/useBasicNotification";
export type PublicationCategory = {
  publication_category_name: string;
};
export type PublicationCategoryCollections = PublicationCategory[] | [];
export default defineComponent({
  name: "FormUploadPublication",
  setup() {
    const publicationFormRefs = ref<InstanceType<typeof NForm> | null>(null);
    const buckets_ = ref<BucketCollections | []>([]);
    const models_ = ref({
      publication_title: null,
      publication_slug: null,
      publication_description: null,
      bucket_id: null,
      publication_category_id: null,
    });
    const fileListLengthRefs = ref(0);
    const files = ref([]);
    const uploadedDocumentRefs = ref<UploadInst | null>(null);
    const publicationCategories_ = ref<PublicationCategoryCollections>([]);
    const actionURL = computed(
      () =>
        import.meta.env.VITE_BACKEND_BASE_URL + "/utilities/uploads/libraries"
    );
    const router = useRouter();
    const notification = useBasicNotification()

    async function fetchBuckets() {
      const { data, statusCode } = await useApiService("/buckets").get().json();
      if (statusCode.value === 200) {
        buckets_.value = [...data.value.data];
      }
    }

    async function fetchPublicationCategories() {
      const { data, statusCode, error } = await useApiService(
        actionURL.value + "/publication-categories"
      )
        .get()
        .json();
      if (statusCode.value === 200) {
        publicationCategories_.value = [...data.value.result];
      } else {
        // notification.notify("error", "Upload Err", "An error occured", error.value);
      }
    }

    function slugConverter(str: any) {
      return str
        ?.replace(/[`~!@#$%^&*()_\-+=\[\]{};:'"\\|\/,.<>?\s]/g, " ")
        .toLowerCase()
        .replace(/^\s+|\s+$/gm, "")
        .replace(/\s+/g, "-");
    }

    const renderLabel: SelectRenderLabel = (option) => {
      return (
        <div class={["flex items-center justify-center py-3 gap-x-3"]}>
          <NAvatar
            src="https://cdn1.iconfinder.com/data/icons/essentials-41/32/17_Folder-1024.png"
            round
            size={"small"}
          />
          <div class={["flex flexx-row w-full justify-between mr-6"]}>
            <div class={["text-base"]}>{option.label}</div>
            <div class={["text-base"]}>{option.type}</div>
          </div>
        </div>
      );
    };

    const fileUploadRequest = ({
      file,
      data,
      headers,
      withCredentials,
      action,
      onFinish,
      onError,
      onProgress,
    }: UploadCustomRequestOptions) => {
      const formData = new FormData();

      if (data) {
        Object.keys(data).forEach((key) => {
          formData.append(
            key,
            data[key as keyof UploadCustomRequestOptions["data"]]
          );
        });
      }

      formData.append("document", file.file as File);

      try {
        useApiService(action as string)
          .post(formData)
          .json()
          .then(({ data, statusCode }) => {
            if (statusCode.value === 200) {
              notification.notify("success", "Upload Success", "Your Document Has beeen uploaded succcessfully", "");
              router.push({
                name: "UploadListPublication",
              });
            }
          });
      } catch (error) {
        notification.notify("error", "Upload Err", "An error occured", "");
      }
    };

    function onSubmitUploadhandler(e: Event) {
      e.preventDefault();
      uploadedDocumentRefs.value?.submit();
    }

    onBeforeMount(async () => {
      Promise.all([fetchBuckets(), fetchPublicationCategories()]);
    });

    watch(
      () => models_.value.publication_title,
      (nVal) => {
        models_.value.publication_slug = slugConverter(
          nVal as unknown as string
        );
      },
      {
        deep: true,
      }
    );

    return {
      files,
      model: models_,
      publicationFormRefs,
      uploadedDocumentRefs,
      fileListLengthRefs,
      renderLabel,
      actionURL,
      fileUploadRequest,
      onSubmitUploadhandler,
      bucketOptions: computed(() => {
        return buckets_.value
          .map((bucket) => {
            return {
              // @ts-ignore
              id: bucket.id,
              name: bucket.bucket_name,
              type: bucket.bucket_category?.bucket_category_name,
            };
          })
          .map((option) => {
            return {
              label: option.name,
              value: option.id,
              type: option.type,
            };
          });
      }),
      publicationCategoryOptions: computed(() => {
        return publicationCategories_.value
          .map((category) => {
            return {
              // @ts-ignore
              id: category.id,
              name: category.publication_category_name,
            };
          })
          .map((option) => {
            return {
              label: option.name,
              value: option.id,
            };
          });
      }),
    };
  },
  render() {
    const {
      model,
      bucketOptions,
      publicationCategoryOptions,
      renderLabel,
      actionURL,
      fileUploadRequest,
      onSubmitUploadhandler,
    } = this;
    return (
      <div class={["flex flex-col w-full space-y-6"]}>
        <div class={["flex flex-col w-full"]}>
          <NCard>
            <NForm ref="publicationFormRefs">
              <NFormItem label="Title">
                <NInput
                  v-model:value={model.publication_title}
                  type="text"
                  placeholder="Enter title"
                  clearable
                />
              </NFormItem>
              {/* <NFormItem label="Slug">
                <NInput v-model:value={model.publication_slug} type="text" disabled placeholder="This is will be generated"/>
              </NFormItem> */}
              <NFormItem label="Description">
                <NInput
                  v-model:value={model.publication_description}
                  type="textarea"
                  placeholder="Enter Description"
                  clearable
                />
              </NFormItem>
              <NFormItem label="Publication Type (Please select bucket type)">
                <NSelect
                  options={bucketOptions}
                  v-model:value={model.bucket_id}
                  clearable
                />
              </NFormItem>
              <NFormItem label="Categories (Used to foldering)">
                <NSelect
                  options={publicationCategoryOptions}
                  v-model:value={model.publication_category_id}
                  clearable
                />
              </NFormItem>
              <NFormItem label="Please upload your documents">
                <NUpload
                  ref="uploadedDocumentRefs"
                  multiple={false}
                  directoryDnd
                  action={actionURL}
                  customRequest={fileUploadRequest}
                  defaultUpload={false}
                  // @ts-ignore
                  data={model}
                >
                  <NUploadDragger>
                    <div class={["mb-[12px]"]}>
                      <NIcon size={48} depth={3}>
                        <Archive24Regular />
                      </NIcon>
                    </div>
                    <NText
                      v-slots={{
                        default: () =>
                          "Click or drag a file to this area to upload",
                      }}
                    />
                    <NP
                      v-slots={{
                        default: () =>
                          "Strictly prohibit from uploading sensitive information. For example, your bank card PIN or your credit card expiry date.",
                      }}
                    />
                  </NUploadDragger>
                </NUpload>
              </NFormItem>
              <div class={["flex flex-row w-full"]}>
                <NButton
                  class={["flex flex-row ml-3"]}
                  onClick={onSubmitUploadhandler}
                >
                  Submit
                </NButton>
                <NButton class={["flex flex-row ml-3"]}>Cancel</NButton>
              </div>
            </NForm>
          </NCard>
        </div>
      </div>
    );
  },
});
