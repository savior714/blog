# Vercel Deployment Troubleshooting

## 1. Project misidentified as Next.js
- **Symptom**: `Error: No Next.js version detected` occurs during build.
- **Cause**: Vercel incorrectly identifies the Astro project as Next.js and applies the wrong build preset.
- **Solution**:
    1. **Add `vercel.json`**: Create a `vercel.json` in the project root with the following content (Completed):
       ```json
       { "framework": "astro" }
       ```
    2. **Check Vercel Settings**: Re-verify that the Framework Preset is set to `Astro` in Dashboard Settings > General.
    3. **Redeploy**: Confirm the automatically triggered build after `git push`.

## 2. Git Submodule Sync Failure
- **Symptom**: `Warning: Failed to fetch one or more git submodules` occurs, leading to runtime errors.
- **Cause**: Insufficient permissions or missing configuration for submodules in the Vercel build environment.
- **Solution**:
    - Enable the **Git Submodules** setting in Vercel Settings > Git.
    - For private submodules, verify Deploy Key or GitHub App permissions.
