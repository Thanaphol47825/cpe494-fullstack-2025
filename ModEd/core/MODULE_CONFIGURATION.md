# Module Configuration Convention

This project now uses a decentralized approach for module configuration. Each module should contain its own `modules-config.json` file that defines the module's properties.

## Module Configuration File Format

Each module should have a `modules-config.json` file in its root directory with the following structure:

```json
{
    "label": "Module Name",
    "className": "ModuleApplicationClassName",
    "script": "/module-path/static/js/ModuleApplication.js",
    "baseRoute": "/module-route"
}
```

## Convention

1. **File Location**: Place `modules-config.json` in the root directory of each module
2. **File Name**: Must be `modules-config.json` or end with `-modules-config.json`
3. **Auto-Discovery**: The `ModEdApplication` automatically discovers and loads all module configurations at runtime

## Example Modules

Currently configured modules:
- `/admin/modules-config.json` - Admin Module
- `/authorization/modules-config.json` - Authorization Module  
- `/common/modules-config.json` - Common Module
- `/curriculum/modules-config.json` - Curriculum Module
- `/curriculum/internship-modules-config.json` - Internship Module (special case)
- `/eval/modules-config.json` - Eval Module
- `/hr/modules-config.json` - HR Module
- `/project/modules-config.json` - Project Module
- `/recruit/modules-config.json` - Recruit Module

## Implementation

The `DiscoverModules()` method in `ModEdApplication` walks through the project directory and automatically finds all `modules-config.json` files, excluding the `/core/` and `/data/` directories.