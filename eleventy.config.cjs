module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("assets");
  // PDF is copied by the `build:assets` npm script — fast-glob inside
  // Eleventy's passthrough copy treats the `(` `)` in the filename as
  // extglob syntax and silently skips the file.

  eleventyConfig.setServerOptions({ port: 8080 });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
