export const strawberryPattern = [
  null, '#5E9376', '#7FB29A', null, null, '#7FB29A', '#5E9376', null,
  null, null, '#D04F3F', '#D04F3F', '#D04F3F', '#D04F3F', null, null,
  null, '#D04F3F', '#F06A5B', '#D04F3F', '#D04F3F', '#F06A5B', '#D04F3F', null,
  '#D04F3F', '#D04F3F', '#B83C30', '#D04F3F', '#D04F3F', '#B83C30', '#D04F3F', '#D04F3F',
  null, '#D04F3F', '#D04F3F', '#B83C30', '#B83C30', '#D04F3F', '#D04F3F', null,
  null, null, '#A83828', '#B83C30', '#B83C30', '#A83828', null, null
];

export const flowerPattern = [
  null, null, '#F5C74E', null, '#F5C74E', null, null, null,
  null, '#F5C74E', '#FFE082', '#F5C74E', '#FFE082', '#F5C74E', null, null,
  '#F5C74E', '#FFE082', '#D04F3F', '#D04F3F', '#D04F3F', '#FFE082', '#F5C74E', null,
  null, '#F5C74E', '#D04F3F', '#8CCB8A', '#D04F3F', '#F5C74E', null, null,
  null, null, '#8CCB8A', '#5E9376', '#8CCB8A', null, null, null,
  null, null, null, '#5E9376', null, null, null, null
];

export const mockProjects = [
  {
    id: 'strawberry',
    name: '草莓钥匙扣',
    type: '生成图纸',
    size: '42 x 38',
    palette: 'MARD',
    progress: 78,
    cells: strawberryPattern
  },
  {
    id: 'flower',
    name: '小花挂件',
    type: '画豆图',
    size: '32 x 32',
    palette: 'COCO',
    progress: 100,
    cells: flowerPattern
  }
];
