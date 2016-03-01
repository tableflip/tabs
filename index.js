module.exports = (opts) => {
  var Builder = {
    build: require('./build'),
    deploy: require('./deploy')
  }

  return Builder
}
