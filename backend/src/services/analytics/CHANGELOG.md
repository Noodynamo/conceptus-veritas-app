# Analytics Schema and Configuration Changelog

All notable changes to the analytics tracking schema and configuration will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-07-01

### Added

- Initial version of the analytics tracking system
- Basic schema validation framework
- User-related event schemas: `ph_user-signup`, `ph_user-login`, `ph_user-logout`
- Content-related event schemas: `ph_content-view`, `ph_content-interaction`
- Navigation-related event schemas: `ph_navigation-screen-view`, `ph_navigation-search`
- System-related event schemas: `ph_system-error`
- Event categories: USER, CONTENT, NAVIGATION, INTERACTION, SYSTEM, PERFORMANCE
- JSON schema for `user_interaction_event-v1`

### Guidelines for Updating

When updating analytics schemas or configurations:

1. Increment the version number in `analytics.constants.ts` following semantic versioning:

   - MAJOR: Breaking changes that require updates to downstream systems
   - MINOR: Non-breaking additions to schemas or new events
   - PATCH: Bug fixes or changes that don't affect schema structure

2. Document changes in this changelog under a new version heading:

   - Added: New features or schemas
   - Changed: Changes to existing functionality
   - Deprecated: Features that will be removed in upcoming releases
   - Removed: Features that were removed
   - Fixed: Bug fixes
   - Security: Security-related changes

3. Update the schema registry with new schema versions

4. Add migration scripts for breaking changes
