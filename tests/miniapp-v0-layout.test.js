const assert = require('assert');
const fs = require('fs');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function includesAll(source, file, needles) {
  for (const needle of needles) {
    assert.ok(source.includes(needle), `${file} should include ${needle}`);
  }
}

function excludesAll(source, file, needles) {
  for (const needle of needles) {
    assert.ok(!source.includes(needle), `${file} should not include legacy ${needle}`);
  }
}

const sizeWxml = read('pages/size/size.wxml');
includesAll(sizeWxml, 'pages/size/size.wxml', [
  'step-indicator',
  'size-hero',
  'size-inputs',
  'recommend-row',
  'preview-board',
  'generatePattern'
]);
excludesAll(sizeWxml, 'pages/size/size.wxml', [
  'beadSizes',
  'size-option-card',
  'ratio-toggle',
  'toggleKeepRatio',
  'estimate-mini'
]);

const uploadWxml = read('pages/upload/upload.wxml');
includesAll(uploadWxml, 'pages/upload/upload.wxml', [
  'step-indicator',
  'crop-stage',
  'photo-surface',
  'floating-chip',
  'goSize'
]);
excludesAll(uploadWxml, 'pages/upload/upload.wxml', [
  'crop-hint-card',
  'crop-size-pill'
]);

const resultWxml = read('pages/result/result.wxml');
includesAll(resultWxml, 'pages/result/result.wxml', [
  'step-indicator',
  'result-preview',
  'palette-row',
  'saveLongImage',
  'saveToProjects'
]);
excludesAll(resultWxml, 'pages/result/result.wxml', [
  'view-mode',
  'save-menu',
  'board-card'
]);

const appWxss = read('app.wxss');
includesAll(appWxss, 'app.wxss', [
  '.loading-pixels',
  '.loading-grid',
  '@keyframes loadingHop'
]);

const sizeWxmlAfter = read('pages/size/size.wxml');
includesAll(sizeWxmlAfter, 'pages/size/size.wxml', [
  'loading-pixels',
  'loading-grid'
]);

const sizeWxss = read('pages/size/size.wxss');
assert.ok(
  /\.recommend\s*\{[^}]*display:\s*(grid|flex)/s.test(sizeWxss),
  'pages/size/size.wxss should give preset buttons an explicit internal layout'
);
assert.ok(
  /\.recommend\s*\{[^}]*min-height:\s*\d+rpx/s.test(sizeWxss),
  'pages/size/size.wxss should give preset buttons a stable min-height'
);
assert.ok(
  /\.recommend-title,\s*\.recommend-size\s*\{[^}]*overflow:\s*hidden/s.test(sizeWxss),
  'pages/size/size.wxss should keep preset text inside each button'
);

const extractWxml = read('pages/extract/extract.wxml');
includesAll(extractWxml, 'pages/extract/extract.wxml', [
  'upload-body',
  'crop-stage',
  'photo-surface',
  'chooseImage',
  'loading-pixels'
]);
excludesAll(extractWxml, 'pages/extract/extract.wxml', [
  'placeholder-art'
]);
assert.ok(
  /class="[^"]*photo-surface[^"]*"[^>]*bindtap="chooseImage"/.test(extractWxml),
  'pages/extract/extract.wxml should let the main upload surface trigger chooseImage'
);

const drawWxml = read('pages/draw/draw.wxml');
includesAll(drawWxml, 'pages/draw/draw.wxml', [
  'floating-chip',
  'tool-dock',
  'tool-icon',
  'color-dock',
  'clearCanvas'
]);
excludesAll(drawWxml, 'pages/draw/draw.wxml', [
  'action-dock',
  '{{tool}}'
]);

console.log('miniapp-v0-layout.test.js passed');
