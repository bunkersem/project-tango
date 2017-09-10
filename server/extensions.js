

global.Array.prototype.sum = function(func){
    if (this.length == 0) return undefined
    var sum = 0
    this.forEach(x => {
        sum += func(x)
    })
    return sum
}

global.Array.prototype.minNum = function(func){
    if (this.length == 0) return undefined
    var min = Number.MAX_VALUE
    var _num
    this.forEach(x => {
        _num = func(x)
        if (_num < min)
            min = _num
    })
    return min
}

global.Array.prototype.maxNum = function(func){
    if (this.length == 0) return undefined
    var max = Number.MIN_VALUE
    var _num
    this.forEach(x => {
        _num = func(x)
        if (_num > max)
            max = _num
    })
    return max
}

global.Array.prototype.minInt = function(func){
    if (this.length == 0) return undefined
    var min = Number.MAX_SAFE_INTEGER
    var _num
    this.forEach(x => {
        _num = parseInt(func(x))
        if (_num < min)
            min = _num
    })
    return min
}

global.Array.prototype.maxInt = function(func){
    if (this.length == 0) return undefined
    var max = Number.MIN_SAFE_INTEGER
    var _num
    this.forEach(x => {
        _num = parseInt(func(x))
        if (_num > max)
            max = _num
    })
    return max
}

global.String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};