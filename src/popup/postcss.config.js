const tailwindcss = require("tailwindcss");
const purgecss = require("@fullhuman/postcss-purgecss");
const postcss = require("postcss");
const combineSelectors = require("postcss-combine-duplicated-selectors");

module.exports = {
  plugins: [
    tailwindcss("./tailwind.config.js"),
    require("autoprefixer"),
    require("cssnano")({
      preset: [
        "default",
        {
          discardComments: {
            removeAll: true,
          },
        },
      ],
    }),
    process.env.NODE_ENV === "production" &&
      purgecss({
        content: ["./src/**/*.tsx", "./src/**/*.ts", "./public/index.html"],
        css: ["./src/assets/css/index.css"],
        extensions: ["ts", "tsx"],
        defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
      }),
    postcss([combineSelectors({ removeDuplicatedProperties: true })]),
    require("postcss-merge-longhand"),
  ],
};
