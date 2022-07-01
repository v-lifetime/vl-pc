function ymdhms() {
  const d = new Date()
  return d
}

function getDOM(str) {
  return document.querySelector(str) || document.getElementById(str)
}

export { ymdhms, getDOM }
