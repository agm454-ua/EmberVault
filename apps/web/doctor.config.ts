import { defineConfig } from "react-doctor/api";

export default defineConfig({
    ignore: {
        rules: ["react-doctor/no-danger"],
        files: ["src/generated/**"],
        overrides: [
            {
                files: ["src/**/*"],
                rules: [
                    "react-doctor/no-danger",
                    "react-doctor/forbid-component-props"
                ],
            },
        ],
    },
    rules: {
        "react-doctor/no-array-index-as-key": "error",
    },
    categories: {
        Maintainability: "warn",
    },
    deadCode: false,
    diff: false
});