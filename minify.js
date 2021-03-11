const fs = require("fs");
const minify = require("@node-minify/core");
const terser = require("@node-minify/terser");
const package = require("./package.json");

let output0 = "cfc.min.js";
let output1 = "script.min.js";
let input0 = "cfc.js";
let input1 = "script.js";

minify({
  compressor: terser,
  input: input0,
  output: output0,
});
minify({
  compressor: terser,
  input: input1,
  output: output1,
});
