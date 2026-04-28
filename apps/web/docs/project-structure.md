# Project structure

The folder structure follows the following pattern.

```
web/
├── docs/                          # Project documentation
│
├── public/                        # Static assets served directly by the server
│   ├── favicon.ico
│   └── assets/
│
├── src/
│   ├── main.tsx                   # Application entry point
│   ├── App.tsx                    # Root component (providers + routing)
│   │
│   ├── core/                      # Application core (framework-level concerns)
│   │   ├── config/                # Environment config, constants, feature flags
│   │   ├── providers/             # Global providers (Theme, i18n, Auth, etc.)
│   │   └── router/                # Route definitions and guards
│   │
│   ├── api/                       # API layer (backend communication)
│   │   ├── client.ts              # Base HTTP client (fetch/axios, interceptors)
│   │   ├── auth/
│   │   │   ├── auth.api.ts        # Auth endpoints
│   │   │   └── auth.types.ts      # Request/response types
│   │   ├── users/
│   │   │   ├── users.api.ts
│   │   │   └── users.types.ts
│   │   └── media/
│   │       ├── media.api.ts
│   │       └── media.types.ts
│   │
│   ├── features/                  # Domain-driven feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   └── media/
│   │
│   ├── shared/                    # Shared/reusable code across features
│   │   ├── components/            # Generic UI components (Button, Modal, etc.)
│   │   ├── hooks/                 # Reusable hooks (useDebounce, useLocalStorage)
│   │   ├── utils/                 # Pure utility functions (formatting, validation)
│   │   ├── layouts/               # App layouts (Header, Sidebar, etc.)
│   │   ├── pages/                 # Global pages (NotFound, Error pages)
│   │   ├── icons/                 # Icon set / wrappers
│   │   └── types/                 # Shared TypeScript types
│   │
│   ├── locales/                   # Internationalization files
│   │   ├── en.json
│   │   └── es.json
│   │
│   └── styles/                    # Global styles (Tailwind layers)
│
├── .env.example
├── tsconfig.json
├── vite.config.ts
├── package.json
└── ...
```

And features:

```
src/features/awesome-feature
│
├── api         # exported API request declarations and api hooks related to a specific feature
├── assets      # assets folder can contain all the static files for a specific feature
├── components  # components scoped to a specific feature
├── hooks       # hooks scoped to a specific feature
├── stores      # state stores for a specific feature
├── types       # typescript types used within the feature
└── utils       # utility functions for a specific feature
```
