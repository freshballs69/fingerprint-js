const FONT_LIST = [
  'Arial',
  'Arial Black',
  'Arial Narrow',
  'Bookman Old Style',
  'Century',
  'Century Gothic',
  'Comic Sans MS',
  'Courier',
  'Courier New',
  'Georgia',
  'Helvetica',
  'Impact',
  'Lucida Console',
  'Lucida Sans Unicode',
  'Microsoft Sans Serif',
  'Palatino Linotype',
  'Tahoma',
  'Times',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'Wingdings',
];

const BASE_FONTS = ['monospace', 'sans-serif', 'serif'];
const TEST_STRING = 'mmmmmmmmmmlli';
const TEST_SIZE = '72px';

export function getAvailableFonts(): string[] {
  const available: string[] = [];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return available;

  const getWidth = (fontFamily: string): number => {
    ctx.font = `${TEST_SIZE} ${fontFamily}`;
    return ctx.measureText(TEST_STRING).width;
  };

  const baseWidths: { [key: string]: number } = {};
  for (const baseFont of BASE_FONTS) {
    baseWidths[baseFont] = getWidth(baseFont);
  }

  for (const font of FONT_LIST) {
    let detected = false;

    for (const baseFont of BASE_FONTS) {
      const testWidth = getWidth(`"${font}", ${baseFont}`);
      if (testWidth !== baseWidths[baseFont]) {
        detected = true;
        break;
      }
    }

    if (detected) {
      available.push(font);
    }
  }

  return available;
}
