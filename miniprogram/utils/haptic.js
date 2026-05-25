function tap() {
  if (wx.vibrateShort) {
    try {
      wx.vibrateShort({ type: 'light' });
    } catch (error) {}
  }
}

function success() {
  if (wx.vibrateShort) {
    try {
      wx.vibrateShort({ type: 'medium' });
    } catch (error) {}
  }
}

function warning() {
  if (wx.vibrateShort) {
    try {
      wx.vibrateShort({ type: 'heavy' });
    } catch (error) {}
  }
}

module.exports = { tap, success, warning };
