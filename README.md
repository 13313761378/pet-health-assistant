# Pet Project

uni-app + Vue 3 + Vite H5 project, organized for development on multiple computers with Git.

## Structure

```text
pet-project/
├── frontend/   # uni-app frontend
├── backend/    # reserved
├── docker/     # reserved
├── .gitignore
└── README.md
```

## Frontend

```powershell
cd frontend
npm install
npm run dev:h5
```

The dev server prints the local URL, usually `http://localhost:5173/`.

## Build

```powershell
cd frontend
npm run build:h5
```

微信小程序构建：

```powershell
cd frontend
npm run build:mp-weixin
```

构建产物位于 `frontend/dist/build/mp-weixin`，可直接导入微信开发者工具。

## Frontend source of truth

The production frontend is the uni-app application under `frontend/pages` and
`frontend/components`. Shared prototype state lives in `frontend/common/store.js`.

The former single-file visual prototype is retained as
`frontend/legacy-prototype.html` for comparison only. It is not the application
entry and should not receive new product features.
