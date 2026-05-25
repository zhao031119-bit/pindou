function chooseOneImage(callback, options) {
  const sourceType = (options && options.sourceType) || ['album', 'camera'];
  if (wx.chooseMedia) {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType,
      success(res) {
        callback(res.tempFiles[0].tempFilePath);
      }
    });
    return;
  }
  wx.chooseImage({
    count: 1,
    sourceType,
    success(res) {
      callback(res.tempFilePaths[0]);
    }
  });
}

module.exports = {
  chooseOneImage
};
