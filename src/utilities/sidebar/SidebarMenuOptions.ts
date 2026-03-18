import type { MenuOption } from "naive-ui";
import * as IonIcon4 from "@vicons/ionicons4";
import useIconRenderer from "@/composables/useIconRenderer";
import { RouterLink, type RouterLinkProps } from "vue-router";
import { computed, h, onMounted, ref, render, watch } from "vue";
import { DataTreemap20Regular, KeyReset20Filled } from "@vicons/fluent";
import { useAuthStore } from "@/stores/auth";
export type RoleType =
  | "superadmin"
  | "admin"
  | "employyee"
  | "verivicator"
  | "accessor";
export type CustomSidebarMenuOptions = MenuOption & {
  required: {
    roles: string[];
    permissions: string[];
  };
};
const minimalMode = import.meta.env.VITE_MINIMAL_MODE !== "false";
export const SidebarMenuOptions: CustomSidebarMenuOptions[] = [
  {
    label: () =>
      h(RouterLink, { to: { name: "Home" } }, { default: () => "Dashboard" }),
    key: "home",
    icon: useIconRenderer(IonIcon4.IosHome),
    show: false,
    required: {
      roles: ["superadmin", "administrator", "employee"],
      permissions: [],
    },
  },
  {
    label: "Record Analytics",
    key: "Analytics",
    icon: useIconRenderer(IonIcon4.IosAnalytics),
    show: false,
    required: {
      roles: ["superadmin"],
      permissions: [],
    },
    children: [
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "EmployeAssessmentAnalytics" } },
            { default: () => "Employee Records" }
          ),
        key: "summaries-assessment-records",
        show: false,
        required: {
          roles: ["superadmin"],
          permissions: [],
        },
      },
      {
        label: "Departments",
        key: "summaries-departments-records",
        show: false,
        required: {
          roles: ["superadmin"],
          permissions: [],
        },
        children: [
          {
            label: () =>
              h(
                RouterLink,
                { to: { name: "DepartmentGroupChildrens" } },
                { default: () => "Data Visualization" }
              ),
          },
        ],
      },
    ],
  },
  {
    label: "Resources Management",
    key: "resources-management",
    icon: useIconRenderer(IonIcon4.IosApps),
    show: false,
    required: {
      roles: ["superadmin"],
      permissions: [],
    },
    children: [
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "User" } },
            { default: () => "Master Users" }
          ),
        key: "user",
        show: false,
        required: {
          roles: ["superadmin"],
          permissions: [],
        },
      },
      // {
      //   label: () =>
      //     h(
      //       RouterLink,
      //       { to: { name: "Profile" } },
      //       { default: () => "Master Profiles" }
      //     ),
      //   key: "master-profiles",
      //   show: false,
      //   required: {
      //     roles: ["superadmin"],
      //     permissions: [],
      //   },
      // },
      // {
      //   label: () =>
      //     h(
      //       RouterLink,
      //       { to: { name: "Directorat" } },
      //       { default: () => "Master Directorats" }
      //     ),
      //   key: "master-directorats",
      //   show: false,
      //   required: {
      //     roles: ["superadmin"],
      //     permissions: [],
      //   },
      // },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "Employment" } },
            { default: () => "Master Employees" }
          ),
        key: "master-employees",
        show: false,
        required: {
          roles: ["superadmin"],
          permissions: [],
        },
      },
      // {
      //   label: () =>
      //     h(
      //       RouterLink,
      //       { to: { name: "Company" } },
      //       { default: () => "Master Companies" }
      //     ),
      //   key: "master-companies",
      //   show: false,
      //   required: {
      //     roles: ["superadmin"],
      //     permissions: [],
      //   },
      // },
      // {
      //   label: () =>
      //     h(
      //       RouterLink,
      //       { to: { name: "PersonelArea" } },
      //       { default: () => "Master Personel Areas" }
      //     ),
      //   key: "master-personel-areas",
      //   show: false,
      //   required: {
      //     roles: ["superadmin"],
      //     permissions: [],
      //   },
      // },
      // {
      //   label: () =>
      //     h(
      //       RouterLink,
      //       { to: { name: "PersonelSubArea" } },
      //       { default: () => "Master Personel Sub Areas" }
      //     ),
      //   key: "master-personel-sub-areas",
      //   show: false,
      //   required: {
      //     roles: ["superadmin"],
      //     permissions: [],
      //   },
      // },
      // {
      //   label: () =>
      //     h(
      //       RouterLink,
      //       { to: { name: "Plant" } },
      //       { default: () => "Master Plants" }
      //     ),
      //   key: "master-plants",
      //   show: false,
      //   required: {
      //     roles: ["superadmin"],
      //     permissions: [],
      //   },
      // },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "Position" } },
            { default: () => "Master Positions" }
          ),
        key: "master-positions",
        show: false,
        required: {
          roles: ["superadmin"],
          permissions: [],
        },
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "Competency" } },
            { default: () => "Master Competencies" }
          ),
        key: "competencies",
        show: false,
        required: {
          roles: ["superadmin"],
          permissions: [],
        },
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "CompetencyLevel" } },
            { default: () => "Master Competency Levels" }
          ),
        key: "competency-levels",
        show: false,
        required: {
          roles: ["superadmin"],
          permissions: [],
        },
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "Training" } },
            { default: () => "Master Trainings" }
          ),
        key: "trainings",
        show: false,
        required: {
          roles: ["superadmin"],
          permissions: [],
        },
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "AssessmentSchedule" } },
            { default: () => "Schedule of Assessment Management" }
          ),
        key: "assessment-schedule",
        show: false,
        required: {
          roles: ["superadmin"],
          permissions: [],
        },
      },
    ],
  },
  {
    label: "Matrixes Mappings",
    key: "matrixes-mappings",
    icon: useIconRenderer(DataTreemap20Regular),
    show: false,
    required: {
      roles: ["superadmin"],
      permissions: [],
    },
    children: [
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "MatrixesRequirementScores" } },
            { default: () => "Requirement Score Matrixes" }
          ),
        key: "requirement-score-matrixes",
        show: false,
        required: {
          roles: ["superadmin"],
          permissions: [],
        },
      },
    ],
  },
  {
    label: "Authorization & Policy",
    key: "authorization",
    icon: useIconRenderer(KeyReset20Filled),
    show: false,
    required: {
      roles: ["superadmin"],
      permissions: [],
    },
    children: [
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "Role" } },
            { default: () => "Manage Roles" }
          ),
        key: "roles",
        show: false,
        required: {
          roles: ["superadmin"],
          permissions: [],
        },
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "Permission" } },
            { default: () => "Manage Permission & Policies" }
          ),
        key: "permissions",
        show: false,
        required: {
          roles: ["superadmin"],
          permissions: [],
        },
      },
    ],
  },
  {
    label: "My Employment Data",
    key: "my-employment-data",
    icon: useIconRenderer(KeyReset20Filled),
    show: false,
    required: {
      roles: ["employee"],
      permissions: [],
    },
    children: [
      // {
      //   // label: "My Profiles",
      //   label: () =>
      //     h(
      //       RouterLink,
      //       { to: { name: "MyProfile" } },
      //       { default: () => "My Profile" }
      //     ),
      //   key: "my-profile",
      //   show: false,
      //   required: {
      //     roles: ["superadmin","employee"],
      //     permissions: [],
      //   },
      // },
      // {
      //   // label: "My Employment Detail",
      //   label: () =>
      //     h(
      //       RouterLink,
      //       { to: { name: "MyEmploymentDetail" } },
      //       { default: () => "My Employment Detail" }
      //     ),
      //   key: "my-employment-detail",
      //   show: false,
      //   required: {
      //     roles: ["superadmin","employee"],
      //     permissions: [],
      //   },
      // },
      // {
      //   // label: "My Employment Hierarchies",
      //   label: () =>
      //     h(
      //       RouterLink,
      //       { to: { name: "MyEmploymentHierarchies" } },
      //       { default: () => "My Employment Hierarchies" }
      //     ),
      //   key: "my-employment-hierarchies",
      //   show: false,
      //   required: {
      //     roles: ["superadmin","employee"],
      //     permissions: [],
      //   },
      // },
      {
        // label: "My Self Assessment Records",
        label: () =>
          h(
            RouterLink,
            { to: { name: "MySelfAssessmentRecords" } },
            { default: () => "My Self Assessment Records" }
          ),
        key: "my-self-assessment-records",
        show: false,
        required: {
          roles: ["superadmin", "employee"],
          permissions: [],
        },
      },
      {
        // label: "My Subordinate Records",
        label: () =>
          h(
            RouterLink,
            { to: { name: "MySubordinatesRecords" } },
            { default: () => "My Sub Ordinates Records" }
          ),
        key: "my-sub-ordinates-records",
        show: false,
        required: {
          roles: ["superadmin", "employee"],
          permissions: [],
        },
      },
    ],
  },
  {
    label: "E-library",
    key: "e-library",
    icon: useIconRenderer(IonIcon4.IosClipboard),
    show: false,
    required: {
      roles: ["superadmin", "administrator", "employee"],
      permissions: [],
    },
    children: [
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "BucketManagement" } },
            { default: () => "Buckets" }
          ),
        key: "buckets",
        show: false,
        required: {
          roles: ["superadmin", "administrator"],
          permissions: [],
        },
      },
      // {
      //   label: () => h(RouterLink, {to: { name : "FileStorageManagement"}}, {default : () => "File Storage Management"}),
      //   key: "file-storage",
      //   show: false,
      //   required: {
      //     roles: ["superadmin", "administrator", "employee"],
      //     permissions: [],
      //   }
      // },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "Publication" } },
            { default: () => "Upload Form" }
          ),
        key: "e-publication-uppload-form",
        show: false,
        required: {
          roles: ["employee"],
          permissions: [],
        },
      },
      {
        label: () => h(RouterLink, {
          to: {
            name: "SuperadminPublicationManagement"
          }
        }, {
          default: () => "Publication Approvement" // show only for superadmin user, instead showing all menus
        }),
        key: "e-publication-approval",
        show: false,
        required: {
          roles: ["superadmin"],
          permission: []
        }
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: { name: "UploadListPublication" } },
            { default: () => "Upload Lists" }
          ),
        key: "e-publication-list",
        show: false,
        required: {
          roles: ["employee"],
          permissions: [],
        },
      },
    ],
  },
];

if (minimalMode) {
  SidebarMenuOptions.splice(1);
}
