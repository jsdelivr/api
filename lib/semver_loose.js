var segments = ['major','minor','patch','tag']

function match(range, ver) {
  range = parse(range)

  if (!ver) {
    return function (ver) {
      ver = parse(ver)
      return compare(range, ver)
    }
  }

  ver = parse(ver)
  return compare(range, ver)

}

function compare(range, ver) {
  return (
    satisfies('major', range, ver) &&
    satisfies('minor', range, ver) &&
    satisfies('patch', range, ver) &&
    range.tag === ver.tag
  )
}

function sort(semverA, semverB) {
  if (typeof semverA === 'string') semverA = parse(semverA)
  if (typeof semverB === 'string') semverB = parse(semverB)

  var ret = (semverA.major || 0) - (semverB.major || 0)
  if (ret) return ret;

  ret = (semverA.minor || 0) - (semverB.minor || 0)
  if (ret) return ret;

  ret = (semverA.patch || 0) - (semverB.patch || 0)
  return ret
}

function satisfies(segment, range, ver) {
  return range[segment] === ver[segment]
      || range[segment] === undefined
      || (segments[range.gte] === segment && ver[segment] > range[segment])
}

function parse(ver) {
  var vals = (ver||'').toString().split(/\.|-/)

  return {
    major: parseIntOrDefault(vals[0]),
    minor: parseIntOrDefault(vals[1]),
    patch: parseIntOrDefault(vals[2]),
    tag: vals[3],
    gte: indexOf(vals, function (segment) {
      return segment[segment.length - 1] === '+'
    })
  }
}

function parseIntOrDefault (val) {
  var i = parseInt(val)
  return isNaN(i) ? undefined : i
}

function indexOf(array, predicate) {
  for (var i = 0, length = array.length; i < length; i++) {
    if (predicate(array[i])) { return i }
  }
  return -1;
}

module.exports.match = match
module.exports.parse = parse
module.exports.sort = sort
module.exports.compare = compare