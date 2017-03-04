
const Gulp = require("gulp")
const Clean = require("gulp-clean")
const GulpTypescript = require("gulp-typescript")
const Merge = require("merge2")
const Typedoc = require("gulp-typedoc")

let TsProject = GulpTypescript.createProject("tsconfig.json")

Gulp.task("compile", () => {
    let res = Gulp.src("src/**/*.ts")
        .pipe(TsProject());
    return Merge([
        res.js.pipe(Gulp.dest("src")),
        res.dts.pipe(Gulp.dest("types"))
    ])
})

Gulp.task("doc-clean",() => {
  return Gulp.src('docs', {read: false})
        .pipe(Clean())
})

Gulp.task("doc",["doc-clean"],() => {
  return Gulp.src("src/**/*.ts")
    .pipe(Typedoc({
      module: "commonjs",
      target: "es6",
      tsconfig: "tsconfig.json",
      includeDeclarations: true,
      out: "./docs",
      version: true,
      excludePrivate: true,
      excludeExternals: true,
      name: "api-aweber",
      theme: "node_modules/typedoc-md-theme/bin"
    }))
})

Gulp.task("default", ["compile"])
