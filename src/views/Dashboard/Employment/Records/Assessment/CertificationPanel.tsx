import useBasicNotification from "@/composables/notifications/useBasicNotification";
import useApiService from "@/composables/useApiService";
import type { CertificationResource } from "@/models/Certification";
import {
  defineComponent,
  type PropType,
  reactive,
  ref,
  toRefs,
} from "vue";
import { NEmpty, NInput, NSelect, NSpin, NTable } from "naive-ui";

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Expired", value: "expired" },
  { label: "Revoked", value: "revoked" },
];

export default defineComponent({
  name: "EmploymentCertificationPanel",
  props: {
    employmentId: {
      type: Number,
      required: true,
    },
    certifications: {
      type: Array as PropType<CertificationResource[]>,
      default: () => [],
    },
  },
  emits: ["submit"],
  setup(props, { emit }) {
    const { employmentId, certifications } = toRefs(props);
    const notification = useBasicNotification();
    const isSubmitting = ref(false);
    const deletingId = ref<number | null>(null);
    const formData = reactive({
      certification_name: "",
      certification_status: "active",
      certification_description: "",
    });

    function resetForm() {
      formData.certification_name = "";
      formData.certification_status = "active";
      formData.certification_description = "";
    }

    async function handleCreate() {
      if (isSubmitting.value) {
        return;
      }

      isSubmitting.value = true;

      try {
        const { data, statusCode, error } = await useApiService("/certifications")
          .post({
            ...formData,
            employment_id: employmentId.value,
          })
          .json();

        if (statusCode.value === 201) {
          notification.notify(
            "success",
            "Certification",
            "Certification created.",
            ""
          );
          resetForm();
          emit("submit");
          return;
        }

        notification.notify(
          "error",
          `Error ${statusCode.value}`,
          data.value?.error?.message ?? "Unable to create certification.",
          String(error.value || "")
        );
      } finally {
        isSubmitting.value = false;
      }
    }

    async function handleDelete(id: number) {
      if (deletingId.value !== null) {
        return;
      }

      deletingId.value = id;

      try {
        const { data, statusCode, error } = await useApiService(
          `/certifications/${id}`
        )
          .delete()
          .json();

        if (statusCode.value === 200) {
          notification.notify(
            "success",
            "Certification",
            data.value?.message ?? "Certification deleted.",
            ""
          );
          emit("submit");
          return;
        }

        notification.notify(
          "error",
          `Error ${statusCode.value}`,
          data.value?.error?.message ?? "Unable to delete certification.",
          String(error.value || "")
        );
      } finally {
        deletingId.value = null;
      }
    }

    return {
      certifications,
      deletingId,
      formData,
      handleCreate,
      handleDelete,
      isSubmitting,
      statusOptions,
    };
  },
  render() {
    return (
      <div class={["flex flex-col gap-y-6"]}>
        <NSpin show={this.isSubmitting || this.deletingId !== null}>
          <div class={["grid gap-4 md:grid-cols-2"]}>
            <label class={["flex flex-col gap-y-2 text-sm font-medium text-slate-700"]}>
              Certification name
              <NInput
                value={this.formData.certification_name}
                onUpdateValue={(value) => {
                  this.formData.certification_name = value;
                }}
                placeholder="Example: Safety Passport"
              />
            </label>

            <label class={["flex flex-col gap-y-2 text-sm font-medium text-slate-700"]}>
              Status
              <NSelect
                value={this.formData.certification_status}
                options={this.statusOptions}
                onUpdateValue={(value) => {
                  this.formData.certification_status = String(value || "active");
                }}
              />
            </label>
          </div>

          <label class={["flex flex-col gap-y-2 text-sm font-medium text-slate-700"]}>
            Description
            <NInput
              type="textarea"
              value={this.formData.certification_description}
              onUpdateValue={(value) => {
                this.formData.certification_description = value;
              }}
              placeholder="Optional notes, issuer, or renewal information"
            />
          </label>

          <div class={["flex justify-end"]}>
            <button
              type="button"
              disabled={this.isSubmitting}
              onClick={() => {
                this.handleCreate();
              }}
              class={[
                "inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition",
                this.isSubmitting ? "cursor-wait opacity-70" : "hover:bg-emerald-700",
              ]}
            >
              {this.isSubmitting ? "Saving..." : "Add certification"}
            </button>
          </div>

          {this.certifications.length ? (
            <NTable striped>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {this.certifications.map((certification) => (
                  <tr key={certification.id}>
                    <td>{certification.certification_name}</td>
                    <td>{certification.certification_status ?? "-"}</td>
                    <td>{certification.certification_description ?? "-"}</td>
                    <td>
                      {certification.created_at
                        ? new Date(certification.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <button
                        type="button"
                        disabled={this.deletingId === certification.id}
                        onClick={() => {
                          this.handleDelete(certification.id);
                        }}
                        class={[
                          "rounded-md border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition",
                          this.deletingId === certification.id
                            ? "cursor-wait opacity-70"
                            : "hover:bg-rose-50",
                        ]}
                      >
                        {this.deletingId === certification.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </NTable>
          ) : (
            <NEmpty description="No certifications recorded for this employee." />
          )}
        </NSpin>
      </div>
    );
  },
});
