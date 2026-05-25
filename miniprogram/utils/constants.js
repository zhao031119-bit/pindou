const DEFAULT_PALETTE_ID = 'mard';

const STORAGE_KEYS = {
  UPLOAD_DRAFT: 'upload_pattern_draft_v1',
  DRAW_DRAFT: 'draw_pattern_draft_v1',
  CURRENT_PROJECT: 'current_pattern_project_v1',
  PROJECT_CHECKS: 'bead_project_checks_v1'
};

const CM_TO_CSS_PX = 37.8;

const MAX_GENERATE_CELLS = 18000;
const MAX_DIMENSION = 180;

const PALETTE_ORDER = [
  'mard',
  'panpan',
  'common',
  'coco',
  'manman',
  'mixiaowo',
  'artkal197',
  'xiaowu',
  'huangdoudou',
  'artkal418'
];

const BEAD_SIZE_OPTIONS = [
  { id: '5mm', label: '5mm 中豆', cmPerBead: 0.5, board: { width: 29, height: 29 } },
  { id: '2.6mm', label: '2.6mm 小豆', cmPerBead: 0.26, board: { width: 50, height: 50 } }
];

const SIZE_PRESETS = [
  { id: 'tiny16', label: '16 x 16', width: 16, height: 16, beadSize: '5mm' },
  { id: 'tiny20', label: '20 x 20', width: 20, height: 20, beadSize: '5mm' },
  { id: 'board1', label: '29 x 29', width: 29, height: 29, beadSize: '5mm' },
  { id: 'board2', label: '58 x 58', width: 58, height: 58, beadSize: '5mm' },
  { id: 'board3', label: '87 x 87', width: 87, height: 87, beadSize: '5mm' },
  { id: 'board4', label: '116 x 116', width: 116, height: 116, beadSize: '5mm' },
  { id: 'mini1', label: '50 x 50', width: 50, height: 50, beadSize: '2.6mm' },
  { id: 'mini2', label: '100 x 100', width: 100, height: 100, beadSize: '2.6mm' }
];

const DRAW_SIZE_PRESETS = [
  { id: 'draw16', label: '16 x 16', width: 16, height: 16 },
  { id: 'draw29', label: '29 x 29', width: 29, height: 29 },
  { id: 'draw50', label: '50 x 50', width: 50, height: 50 },
  { id: 'draw100', label: '100 x 100', width: 100, height: 100 }
];

module.exports = {
  DEFAULT_PALETTE_ID,
  STORAGE_KEYS,
  CM_TO_CSS_PX,
  MAX_GENERATE_CELLS,
  MAX_DIMENSION,
  PALETTE_ORDER,
  BEAD_SIZE_OPTIONS,
  SIZE_PRESETS,
  DRAW_SIZE_PRESETS
};
