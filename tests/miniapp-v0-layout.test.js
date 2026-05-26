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
  'result-empty',
  'empty-illust',
  'empty-cta',
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
  '.loading-board',
  '.loading-cell',
  '.loading-scan',
  '.empty-illust',
  '@keyframes loadingHop'
]);
assert.ok(
  /\.loading-grid\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*\d+rpx\)/s.test(appWxss),
  'app.wxss should render loading pixels as a compact board instead of a long strip'
);
assert.ok(
  /\.loading-board\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1/s.test(appWxss),
  'app.wxss should make the generated-pattern loader look like a square pattern preview'
);

const sizeWxmlAfter = read('pages/size/size.wxml');
includesAll(sizeWxmlAfter, 'pages/size/size.wxml', [
  'loading-pixels',
  'loading-board',
  'loading-grid',
  'loading-cell',
  'loading-scan'
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
  /\.size-body\s*\{[^}]*gap:\s*(?:[3-9]\d|\d{3,})rpx/s.test(sizeWxss),
  'pages/size/size.wxss should keep the size page from feeling too compressed'
);
assert.ok(
  /\.recommend-row\s*\{[^}]*gap:\s*(?:2[4-9]|[3-9]\d|\d{3,})rpx/s.test(sizeWxss),
  'pages/size/size.wxss should leave clear space between preset cards'
);
assert.ok(
  /\.recommend\s*\{[^}]*min-height:\s*(?:13[2-9]|1[4-9]\d|[2-9]\d\d)rpx/s.test(sizeWxss),
  'pages/size/size.wxss should make preset cards large enough to read and tap'
);
assert.ok(
  /\.recommend-title,\s*\.recommend-size\s*\{[^}]*overflow:\s*hidden/s.test(sizeWxss),
  'pages/size/size.wxss should keep preset text inside each button'
);
assert.ok(
  /\.recommend\.active\s*\{[^}]*rgba\(197,\s*106,\s*76/s.test(sizeWxss),
  'pages/size/size.wxss should use the clay selected state from the v0 preset cards'
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

const pickWxml = read('pages/pick/pick.wxml');
includesAll(pickWxml, 'pages/pick/pick.wxml', [
  'loupe-preview',
  'loupe-image',
  'loupe-crosshair',
  'loupe-label'
]);
excludesAll(pickWxml, 'pages/pick/pick.wxml', [
  'floating-chip',
  'loupe-dot'
]);

const pickJs = read('pages/pick/pick.js');
includesAll(pickJs, 'pages/pick/pick.js', [
  'loupeImageStyle',
  'makeLoupeImageStyle',
  'showLoupe'
]);

const drawWxml = read('pages/draw/draw.wxml');
includesAll(drawWxml, 'pages/draw/draw.wxml', [
  'floating-chip',
  'tool-panel',
  'tool-dock',
  'tool-icon',
  'tool-label',
  'tool-actions',
  '{{item.label}}',
  '>撤销<',
  '>重做<',
  '>清空<',
  'color-dock',
  'clearCanvas'
]);
excludesAll(drawWxml, 'pages/draw/draw.wxml', [
  'action-dock',
  '{{tool}}'
]);

const drawWxss = read('pages/draw/draw.wxss');
assert.ok(
  /\.tool-dock\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/s.test(drawWxss),
  'pages/draw/draw.wxss should keep the five drawing tools in a stable grid'
);
assert.ok(
  /\.tool-actions\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s.test(drawWxss),
  'pages/draw/draw.wxss should separate undo/redo/clear into a stable action grid'
);
assert.ok(
  /\.tool-label\s*\{[^}]*font-size:\s*\d+rpx/s.test(drawWxss),
  'pages/draw/draw.wxss should show readable labels on tool buttons'
);

console.log('miniapp-v0-layout.test.js passed');
