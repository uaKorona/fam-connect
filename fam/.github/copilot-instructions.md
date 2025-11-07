# Copilot Instructions for Fam Project

## Project Overview

This is an **Angular 20** application with **Server-Side Rendering (SSR)** built on **Nx workspace** using **Vite** for build tooling. The app uses standalone components and the latest Angular features including hydration with event replay.
The backend is powered by an **Express** server integrated with the Angular SSR engine.
The app uses:

- **Tailwind CSS** for styling
- **Vitest** for unit testing with Angular testing utilities
- **Playwright** for end-to-end testing with automatic dev server startup

## Architecture Patterns

### Application Structure

- **Entry Points**: `src/main.ts` (client), `src/main.server.ts` (SSR), `src/server.ts` (Express server)
- **Root Component**: `src/app/app.ts` - uses standalone component architecture with `App` class
- **Configuration**: Dual config pattern with `app.config.ts` (client) and `app.config.server.ts` (SSR merge)
- **Routing**: Currently empty `appRoutes` in `app.routes.ts` - ready for feature expansion

### SSR Implementation

- **Express Server**: `src/server.ts` uses `AngularNodeAppEngine` with static file serving
- **API Pattern**: Express middleware for `/api/**` routes (currently commented template)
- **Hydration**: Uses `provideClientHydration(withEventReplay())` for optimal user experience

### Build & Development Setup

- **Nx Configuration**: `nx.json` defines build targets, caching, and plugin setup
- **Build Outputs**: `dist/fam/browser` (client) and `dist/fam/server` (SSR)
- **Development**: Angular dev-server with proxy support via `serve` target

## Development Workflows

### Key Commands

```bash
# Development server with SSR
npx nx serve fam

# Production build (creates both client and SSR bundles)
npx nx build fam

# Run tests (Vitest with Angular testing utilities)
npx nx test fam

# E2E tests (Playwright)
npx nx e2e fam-e2e

# Lint (ESLint with Angular-specific rules)
npx nx lint fam
```

### Testing Strategy

- **Unit Tests**: Vitest with `@analogjs/vitest-angular` for Angular-specific setup
- **Test Setup**: `src/test-setup.ts` configures Angular TestBed with Zone.js support
- **E2E Tests**: Playwright with automatic dev server startup (`webServer` config)
- **Component Testing**: Uses TestBed with standalone component imports

## Key Conventions

### TypeScript Configuration

- **Strict Mode**: `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers` enabled
- **Module Resolution**: Uses `"bundler"` resolution with `"preserve"` modules for Vite compatibility
- **Build Targets**: Separate `tsconfig.app.json` and `tsconfig.spec.json` via project references

### Component Patterns

- **Standalone Components**: All components use `imports` array instead of NgModules
- **Selector Prefix**: Components use `app-` prefix (enforced by ESLint)
- **File Structure**: Component logic in `.ts`, template in `.html`, styles in `.css`

### Nx Workspace Features

- **Target Defaults**: Automatic caching for builds, tests, and linting
- **Named Inputs**: `production` input excludes test files and dev configs
- **Plugin Integration**: Uses `@nx/playwright/plugin` and `@nx/eslint/plugin`

## Integration Points

### Vite Integration

- **Plugin Stack**: `@analogjs/vite-plugin-angular`, `nxViteTsPaths`, `nxCopyAssetsPlugin`
- **Test Configuration**: Vitest with jsdom environment and coverage via V8
- **Asset Handling**: Markdown files copied via `nxCopyAssetsPlugin(['*.md'])`

### Angular SSR Specifics

- **Bootstrap Pattern**: Dual bootstrap functions for client/server contexts
- **Route Configuration**: Separate `serverRoutes` for SSR-specific routing
- **Error Handling**: `provideBrowserGlobalErrorListeners()` for client-side error tracking

## When Adding Features

1. **New Routes**: Add to `appRoutes` in `app.routes.ts` and corresponding server routes if needed
2. **API Endpoints**: Implement in `src/server.ts` Express middleware before the Angular handler
3. **Components**: Create standalone components with proper `app-` prefix selector
4. **Tests**: Follow existing patterns - component tests with TestBed, E2E with Playwright page objects
5. **Builds**: Leverage Nx caching - new projects should define proper `inputs` and `dependsOn`
