# Original Backend Schema Context

This file captures the domain schema inferred from the original Laravel migration set in:

`C:\Users\Administrator\Downloads\backend-app-main\backend-app-main\database\migrations`

and the original Laravel model layer in:

`C:\Users\Administrator\Downloads\backend-app-main\backend-app-main\app\Models`

Use this as the working memory for future mock-backend and API-contract work.

## Source-of-truth summary

The original backend was not a simple CRUD app. It modeled:

- authentication and audit metadata on `users`
- Spatie permission/role authorization
- employee identity via `profiles`
- employee placement via `employments`
- competency matrices for positions
- training recommendations and assessment records
- later organizational overlays on employments

The frontend models already reflect most of this shape, even where the current mock backend is still simplified.

## Model layer notes

The migrations describe table shape, but the Eloquent models clarify which relations and computed fields the frontend likely relied on.

### Identity graph

- `User`
  - uses Spatie roles/permissions and Passport token traits
  - `hasOne(Profile::class)`
  - fillable includes login telemetry fields already present in the migrations
- `Profile`
  - `belongsTo(User::class)`
  - `hasOne(Employment::class)`
- `Role`
  - extends Spatie `Role`
  - exposes `users()` and `permissions()`
- `Permission`
  - extends Spatie `Permission`
  - exposes `users()` and `roles()`

### Employment graph

- `Employment`
  - `belongsTo`:
    - `profile`
    - `position`
    - `directorat`
    - `company`
    - `personelArea`
    - `personelSubArea`
    - `plantArea`
    - `department`
    - `organization`
    - `organizationFunction`
  - self-hierarchy helpers:
    - `parent()`
    - `children()`
    - `descendants()`
    - `scopeRoots()`
  - workflow relations:
    - `hasMany(Assessment::class, 'employment_id')`
    - `hasMany(PeriodicalGeneralAssessment::class, 'employment_id')`
  - appends computed field `appliedAssessmentLogs`
    - this is derived from linked `periodical_general_assessments` and the referenced `assessment_schedules`

Important mismatch:

- `Employment` fillable fields include `department_function_id`
- the actual relation and migration use `organization_function_id`

For API compatibility, `organization_function_id` should be treated as canonical. The mock backend may optionally accept the old alias, but should not emit it as the main field.

### Competency graph

- `Position`
  - `belongsToMany(CompetencyLevel::class)` as `levels()`
  - `belongsToMany(Competency::class, 'requirement_scores')` as `competencyByLevel()`
  - the `competencyByLevel` relation carries pivot fields:
    - `competency_level_id`
    - `minimum_score`
  - the pivot is aliased as `minimumScoreByLevel`
  - exposes query scopes:
    - `hasCompetencyThroughLevels`
    - `doesntHaveCompetencyThroughLevels`
  - `hasMany(Employment::class)`
- `Competency`
  - `belongsToMany(CompetencyLevel::class)` as `levels()`
  - `belongsToMany(Position::class, 'requirement_scores')` as `positionBylevel()`
  - the pivot is also aliased as `minimumScoreByLevel`
  - `hasMany(Training::class)`
- `CompetencyLevel`
  - `belongsToMany(Position::class)`
  - `belongsToMany(Competency::class)`
- `RequirementScore`
  - `belongsTo(position)`
  - `belongsTo(competency)`
  - `belongsTo(level)`
  - exposes `scopeMatrixes()` to eager load `level`, `competency`, and `position`
- `Training`
  - `belongsTo(Competency::class)`

### Assessment graph

- `Assessment`
  - `belongsTo(employment)`
  - `belongsTo(position)`
  - `belongsTo(competency)`
  - `belongsTo(competencyLevel)`
  - `belongsTo(training)`
  - `belongsTo(assessmentSchedule)`
- `AssessmentSchedule`
  - casts start/end dates to datetimes
  - casts `assessment_schedule_is_active` to boolean
  - `hasMany(Assessment::class)`
  - `hasMany(PeriodicalGeneralAssessment::class)`
- `PeriodicalGeneralAssessment`
  - `belongsTo(employment)`
  - `belongsTo(assessmentSchedule)`

### Reference models

- `Company`, `Directorat`, `PersonelArea`, `PersonelSubArea`, `PlantArea`, and `Department` all expose `hasMany(Employment::class)`
- `Organization` and `OrganizationFunction` are simple guarded models in the original backend and do not add special logic
- `Certification` is effectively a placeholder in the original model layer

## Core domain tables

### Identity and access

- `users`
  - standard auth fields: `name`, `email`, `password`, `email_verified_at`, `remember_token`
  - login telemetry: `is_logged_in`, `last_logged_in_at`, `last_logged_in_host`, `last_logged_in_port`, `last_logged_in_user_agent`, `last_logged_in_device`, `last_logged_in_browser`, `last_logged_in_platform`
  - audit strings: `created_by`, `updated_by`, `registered_by`, `verified_by`, `registered_at`
- `profiles`
  - one profile per user
  - fields: `profile_fullname`, `profile_gender`, `profile_place_of_birth`, `profile_date_of_birth`, `profile_marital_status`, `profile_nationality`, `profile_religion`
  - FK: `user_id`
- permissions/roles via Spatie tables
  - `permissions`
  - `roles`
  - `model_has_permissions`
  - `model_has_roles`
  - `role_has_permissions`

### Employment and organization

- `employments`
  - dates: `employment_hiring_date`, `employment_end_date`
  - descriptors: `employment_group_type_name`, `employment_group_age`, `employment_status`, `employment_position_status`, `employment_wsr`
  - self hierarchy: `parent_employment_id`
  - FKs:
    - `profile_id`
    - `position_id`
    - `company_id`
    - `directorat_id`
    - `personel_area_id`
    - `personel_sub_area_id`
    - `plant_area_id`
- later migration adds to `employments`
  - `organization_id`
  - `department_id`
  - `organization_function_id`

### Master/reference data

- `positions`
  - `position_name`
- `competencies`
  - `competency_name`
- `competency_levels`
  - `competency_level_title`
  - `competency_level_name`
  - `competency_level_description`
- `companies`
  - `company_name`
- `directorats`
  - `directorat_name`
- `personel_areas`
  - `personel_area_text`
  - `personel_area_code`
- `personel_sub_areas`
  - `personel_sub_area_text`
  - `personel_sub_area_code`
  - note: migration does not actually add a FK back to `personel_areas`
- `plant_areas`
  - `plant_area_name`
- `organizations`
  - `organization_name`
- `departments`
  - `department_name`
- `organization_functions`
  - `organization_function_name`

### Competency matrix

- `requirement_scores`
  - `minimum_score`
  - FKs: `position_id`, `competency_id`, `competency_level_id`

There are also several pivot/bridge tables:

- `competency_level_position`
  - `position_id`, `competency_level_id`
- `competency_competency_level`
  - `competency_id`, `competency_level_id`
- `competency_to_competency_level`
  - only `id` and timestamps in migration, likely abandoned or placeholder
- `competency_requirement_score`
  - only `id` and timestamps in migration, likely abandoned or placeholder

For current frontend behavior, `requirement_scores` is the important table. The extra pivots look like alternate earlier designs.

### Learning and assessment

- `trainings`
  - `training_job_competency_function`
  - `training_job_course_function`
  - `training_title`
  - `training_level`
  - `training_target_group`
  - `training_notes`
  - `training_delivery_method`
  - `training_program_duration`
  - `training_day_duration`
  - `training_hours_duration`
  - `training_objective`
  - `training_content`
  - `training_competency_level_stack_key`
  - FK: `competency_id`
- `certifications`
  - only `id` and timestamps in migration, currently just a placeholder
- `assessments`
  - `assessment_score`
  - `gap_score`
  - `minimum_score`
  - `parent_employment_id`
  - `idp_exposure_experience`
  - `idp_status`
  - FKs:
    - `employment_id`
    - `position_id`
    - `competency_id`
    - `competency_level_id`
    - `training_id`
    - later `assessment_schedule_id`
- `assessment_schedules`
  - `assessment_schedule_title`
  - `assessment_schedule_description`
  - `assessment_schedule_year_period`
  - `assessment_schedule_phase_period`
  - `assessment_schedule_start_date`
  - `assessment_schedule_end_date`
  - `assessment_schedule_is_active`
- `periodical_general_assessments`
  - `parameters_name`
  - `parameters_value`
  - `status`
  - FKs: `employment_id`, `assessment_schedule_id`

## Non-domain infrastructure tables

These are Laravel/runtime concerns, not application domain:

- `sessions`
- `password_resets`
- `failed_jobs`
- `jobs`
- `personal_access_tokens`
- `cache`
- `cache_locks`
- `websockets_statistics_entries`

There is also a duplicate cache migration in the source set:

- `2012_10_12_000000_create_cache_table.php`
- `2023_05_29_042728_create_cache_table.php`

That looks like framework-version drift, not business logic.

## Important interpretation notes for the frontend

### 1. `assessments` is effectively the frontend's assessment-record resource

The frontend type is named `AssessmentRecordResource`, but the original DB table is `assessments`.

Implication:

- current mock backend naming `assessment_records` is conceptually correct for the UI
- when matching the original backend more closely, `assessment_records` should still map back to `assessments`

### 2. Employment is the center of the domain

The real business graph is:

`user -> profile -> employment -> position`

with organization, reporting hierarchy, assessments, and analytics all attached to `employment`.

### 3. Requirement scores drive competency expectations

The most important competency relationship for the UI is:

`position + competency + competency_level + minimum_score`

That is represented directly by `requirement_scores`.

### 4. May 2023 expanded employments beyond the earlier directorat/company model

Later schema adds:

- `organization_id`
- `department_id`
- `organization_function_id`

Implication:

- the original backend evolved toward a more explicit org-structure model
- current frontend models do not yet expose these fields strongly, but future API parity may need them

### 5. Employment responses likely carried computed schedule context

Because `Employment` appends `appliedAssessmentLogs`, API responses may have included derived schedule history even when the frontend did not request it explicitly.

Implication:

- mock employment payloads should eventually expose `appliedAssessmentLogs`
- the value should be derived from `periodical_general_assessments` and `assessment_schedules`, not stored separately

### 6. Position-to-competency matching is requirement-score backed

The model layer makes it clear that `Position::competencyByLevel()` and `Competency::positionBylevel()` are both backed by `requirement_scores`.

Implication:

- do not invent a separate primary API surface for `competency_level_position` or `competency_competency_level`
- keep `requirement_scores` as the main source of truth for matrix screens

## Dataset blueprint for future mock data

To keep the mock backend aligned with the original schema, seed data should always form complete chains:

### Minimal identity chain

- 1 superadmin user
- 1 profile linked to that user
- 1 root employment linked to that profile

### Minimal reporting tree

- 1 manager employment under root
- 2 employee employments under manager or root

### Minimal competency matrix

- 3 to 5 positions
- 4 to 8 competencies
- 3 competency levels
- requirement scores linking positions to competencies and levels

### Minimal learning graph

- 1 to 3 trainings per important competency

### Minimal assessment graph

- at least 2 assessment schedules
- assessment rows for some employments
- periodical general assessments for IDP-like summary rows

### Minimal organizational overlay

- 2 companies
- 2 directorats
- 2 personel areas
- 2 personel sub areas
- 2 plant areas
- optional organizations/departments/organization functions for later parity

## Current mock-backend gaps against the original schema

These original-schema elements are not fully represented yet in the current mock backend:

- `organizations`, `departments`, `organization_functions`
- `certifications`
- a direct representation of Spatie pivot tables
- any real persistence for sessions/tokens/cache/jobs
- some of the legacy bridge tables around competency levels
- computed `employment.appliedAssessmentLogs`
- compatibility handling for `organization_function_id` versus the legacy `department_function_id` naming mismatch

## Recommended implementation order from this schema

1. Keep `users`, `profiles`, `roles`, `permissions`, and `employments` as the first-class identity graph.
2. Keep `requirement_scores` as the primary source for position-competency expectations.
3. Treat `assessments` plus `assessment_schedules` plus `periodical_general_assessments` as one workflow group.
4. Preserve `employment` hierarchy and computed assessment-log behavior when expanding API parity.
5. Add `organizations`, `departments`, and `organization_functions` after the current identity and matrix flows are stable.
6. Ignore pure infrastructure tables unless a frontend feature directly depends on them.

## How to use this file

When adding or refactoring mock API behavior:

- prefer this document over memory
- align field names with these migrations first
- only simplify when the frontend clearly does not consume the full schema
- update this file when a newly discovered backend assumption matters for API parity
