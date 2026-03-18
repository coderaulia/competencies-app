import PDFTronReader from "@/components/PDFRenderer/PDFTronReader";
import useApiService from "@/composables/useApiService";
import usePageLoader from "@/composables/usePageLoader";
import type { PublicationResource } from "@/models/Publication";
import { computed, defineComponent, onBeforeMount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

function normalizeUrl(basePath: string, path: string) {
  return `${basePath.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function toBackendOrigin(apiBaseUrl: string) {
  return apiBaseUrl.replace(/\/+$/, "").replace(/\/api$/, "");
}

export default defineComponent({
  name: "UploadedPublicationDetail",
  setup() {
    const { loadingStart, loadingFinish } = usePageLoader();
    const route = useRoute();
    const publication = ref<PublicationResource | null>(null);

    const configuredStorageBasePath = computed(() =>
      String(import.meta.env.VITE_AWS_S3_BUCKET_OBJECT_BASEPATH ?? "").trim()
    );
    const backendOrigin = computed(() =>
      toBackendOrigin(String(import.meta.env.VITE_BACKEND_BASE_URL ?? "").trim())
    );

    const attachedDocument = computed(() => {
      const storage = publication.value?.storages?.[0];
      if (!storage) {
        return null;
      }

      const hashName =
        // @ts-ignore legacy API shape still uses document_hash_name
        storage.document_hash_name ?? storage.document_name ?? "document";

      return {
        fileName: `${hashName}.${storage.document_extension}`,
        path: `${storage.document_path}/${hashName}.${storage.document_extension}`,
        size: storage.document_size,
        extension: storage.document_extension,
      };
    });

    const documentUrl = computed(() => {
      const path = attachedDocument.value?.path;
      if (!path) {
        return "";
      }

      if (/^https?:\/\//i.test(path)) {
        return path;
      }

      if (configuredStorageBasePath.value) {
        return normalizeUrl(configuredStorageBasePath.value, path);
      }

      if (path.startsWith("mock-publications/") && backendOrigin.value) {
        return normalizeUrl(backendOrigin.value, path);
      }

      return "";
    });

    const shouldUseViewer = computed(() => Boolean(documentUrl.value));

    const loadPublication = async (id: unknown) => {
      const { data, statusCode } = await useApiService("/publications/" + id)
        .get()
        .json();

      if (statusCode.value === 200) {
        publication.value = data.value.data;
      }
    };

    onBeforeMount(() => {
      loadingStart();
    });

    onBeforeMount(async () => {
      if (route.query.pub_id) {
        await loadPublication(route.query.pub_id);
      }
    });

    onMounted(() => {
      setTimeout(() => {
        loadingFinish();
      }, 500);
    });

    return {
      attachedDocument,
      configuredStorageBasePath,
      documentUrl,
      publication,
      shouldUseViewer,
    };
  },
  render() {
    const publication = this.publication;
    const document = this.attachedDocument;

    if (!publication) {
      return (
        <div class={["rounded-2xl border border-slate-200 bg-slate-50 p-6"]}>
          <h2 class={["text-lg font-semibold text-slate-900"]}>
            Publication not found
          </h2>
          <p class={["mt-2 text-sm text-slate-600"]}>
            The selected publication could not be loaded from the mock backend.
          </p>
        </div>
      );
    }

    if (this.shouldUseViewer && document) {
      return (
        <div class={["flex flex-col px-1"]}>
          <PDFTronReader path={this.documentUrl} />
        </div>
      );
    }

    return (
      <div class={["space-y-6 px-1"]}>
        <section
          class={[
            "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
          ]}
        >
          <div
            class={[
              "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between",
            ]}
          >
            <div>
              <p
                class={[
                  "text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600",
                ]}
              >
                Mock Preview
              </p>
              <h2 class={["mt-2 text-2xl font-bold text-slate-900"]}>
                {publication.publication_title}
              </h2>
              <p class={["mt-3 max-w-3xl text-sm text-slate-600"]}>
                {publication.publication_description}
              </p>
            </div>

            <div class={["flex flex-wrap gap-2"]}>
              <span
                class={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  publication.publication_is_verified
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700",
                ]}
              >
                {publication.publication_is_verified ? "Verified" : "Pending"}
              </span>
              <span
                class={[
                  "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600",
                ]}
              >
                {publication.publication_category?.publication_category_name ??
                  "Uncategorized"}
              </span>
            </div>
          </div>
        </section>

        <section
          class={[
            "rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6",
          ]}
        >
          <h3 class={["text-lg font-semibold text-slate-900"]}>
            Document preview unavailable
          </h3>
          <p class={["mt-2 text-sm text-slate-600"]}>
            This publication could not be resolved to a readable PDF URL yet.
            In local mode the app can use either the bundled mock document
            endpoint or a configured object storage base path.
          </p>

          <div class={["mt-5 grid gap-4 md:grid-cols-2"]}>
            <div class={["rounded-2xl border border-slate-200 bg-white p-4"]}>
              <div
                class={[
                  "text-xs font-semibold uppercase tracking-[0.24em] text-slate-400",
                ]}
              >
                Bucket
              </div>
              <div class={["mt-2 text-sm font-semibold text-slate-900"]}>
                {publication.bucket?.bucket_name ?? "Unknown bucket"}
              </div>
              <div class={["mt-1 text-sm text-slate-500"]}>
                {publication.bucket?.bucket_description ?? "-"}
              </div>
            </div>

            <div class={["rounded-2xl border border-slate-200 bg-white p-4"]}>
              <div
                class={[
                  "text-xs font-semibold uppercase tracking-[0.24em] text-slate-400",
                ]}
              >
                Attachment
              </div>
              <div class={["mt-2 text-sm font-semibold text-slate-900"]}>
                {document?.fileName ?? "No attachment metadata"}
              </div>
              <div class={["mt-1 text-sm text-slate-500"]}>
                {document?.size ?? "-"}
                {document?.extension
                  ? ` | ${document.extension.toUpperCase()}`
                  : ""}
              </div>
            </div>
          </div>

          <div class={["mt-5 rounded-2xl border border-slate-200 bg-white p-4"]}>
            <div
              class={[
                "text-xs font-semibold uppercase tracking-[0.24em] text-slate-400",
              ]}
            >
              Document Path
            </div>
            <code class={["mt-2 block break-all text-sm text-slate-700"]}>
              {this.documentUrl || document?.path || "No storage path available"}
            </code>
            {!this.configuredStorageBasePath ? (
              <p class={["mt-3 text-sm text-slate-500"]}>
                `VITE_AWS_S3_BUCKET_OBJECT_BASEPATH` is not configured, so the
                component falls back to the local mock document source when
                available.
              </p>
            ) : (
              ""
            )}
          </div>
        </section>
      </div>
    );
  },
});
