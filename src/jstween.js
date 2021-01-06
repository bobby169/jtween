export const JT = {}

JT.Linear = {
  None (k) {
    return k
  }
}
// --------------------------------------------------------------------辅助方法
function each (obj, callback) {
  if (obj.length && obj.length > 0) {
    for (let i = 0; i < obj.length; i++) {
      callback.call(obj[i], i, obj[i])
    }
  } else {
    callback.call(obj, 0, obj)
  }
}

//  WebkitTransform 转 -webkit-transform
function hyphenize (str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

//  webkitTransform 转 WebkitTransform
function firstUper (str) {
  return str.replace(/\b(\w)|\s(\w)/g, function (m) {
    return m.toUpperCase()
  })
}

function fixed (n) {
  return Math.round(n * 1000) / 1000
}

// --------------------------------------------------------------------time fix
Date.now = (Date.now || function () {
  return new Date().getTime()
})

const nowOffset = Date.now()

JT.now = function () {
  return Date.now() - nowOffset
}

// --------------------------------------------------------------------prefix
const prefix = (function () {
  const _d = document.createElement('div')
  const _prefixes = ['Webkit', 'Moz', 'Ms', 'O']

  for (const i in _prefixes) {
    if ((_prefixes[i] + 'Transform') in _d.style) return _prefixes[i]
  }
}())

function browserPrefix (str) {
  return prefix + (str ? firstUper(str) : '')
}

const requestFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60)
  }

// --------------------------------------------------------------------dom style相关方法
function getElement (el) {
  if (!el) throw new Error("el is undefined, can't tween!!!")

  if (typeof (el) === 'string') {
    return document.querySelectorAll(el)
  } else {
    return el
  }
}

const keywords = [
  'ease', 'delay', 'yoyo', 'repeat', 'repeatDelay',
  'onStart', 'onStartScope', 'onStartParams',
  'onRepeat', 'onRepeatScope', 'onRepeatParams',
  'onEnd', 'onEndScope', 'onEndParams',
  'onUpdate', 'onUpdateScope', 'onUpdateParams',
  'interpolation', 'isReverse', 'timeScale', 'isFrom', 'isPlaying'
]

const specialProps = ['rotation', 'scale', 'autoAlpha']

function checkPropName (el, name, isDom) {
  for (let i = 0, l = keywords.length; i < l; i++) {
    if (name === keywords[i]) return undefined
  }

  if (isDom) {
    for (let i = 0, l = specialProps.length; i < l; i++) {
      if (name === specialProps[i]) return name
    }

    if (el._jt_obj[name] !== undefined) return name

    if (el.style[name] !== undefined) return name

    name = browserPrefix(name)
    if (el.style[name] !== undefined) return name
  } else {
    if (typeof (el[name]) === 'string' || typeof (el[name]) === 'number') return name
  }

  return undefined
}

function checkValue (o1, o2) {
  let o = {}
  if (Array.isArray(o2)) {
    o.num = [o1.num]
    for (let i = 0, l = o2.length; i < l; i++) {
      const _o = calcValue(o1, o2[i])
      o.num.push(_o.num)
      o.unit = _o.unit
    }
  } else {
    o = calcValue(o1, o2)
  }
  return o
}

function calcValue (o1, o2) {
  const _o2 = regValue(o2)

  if (o1.unit === 'rem' && _o2.unit !== 'rem') {
    checkRem()
    o1.num = fixed(o1.num * remUnit)
    o1.unit = 'px'
  } else if (o1.unit !== 'rem' && _o2.unit === 'rem') {
    checkRem()
    o1.num = fixed(o1.num / remUnit)
    o1.unit = 'rem'
  }

  let _value
  switch (_o2.ext) {
    case '+=':
      _value = o1.num + _o2.num
      break
    case '-=':
      _value = o1.num - _o2.num
      break
    default:
      _value = _o2.num
      break
  }
  return { num: _value, unit: _o2.unit }
}

function checkJtobj (el) {
  if (el._jt_obj === undefined) {
    el._jt_obj = {
      x: 0,
      y: 0,
      z: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      skewX: 0,
      skewY: 0
    }
  }
}

function regValue (value) {
  const _r = /(\+=|-=|)(-|)(\d+\.\d+|\d+)(e[+-]?[0-9]{0,2}|)(rem|px|%|)/i
  const _a = _r.exec(value)
  if (_a) return { num: fixed(_a[2] + _a[3] + _a[4]), unit: _a[5], ext: _a[1] }
  else return { num: 0, unit: 'px', ext: '' }
}

function checkString (value) {
  return /(,| |jpeg|jpg|png|gif|-3d)/g.test(value) || !/\d/g.test(value)
}

function getProp (el, name) {
  switch (name) {
    case 'x':
    case 'y':
    case 'z':
    case 'rotationX':
    case 'rotationY':
    case 'rotationZ':
    case 'scaleX':
    case 'scaleY':
    case 'scaleZ':
    case 'skewX':
    case 'skewY':
      return el._jt_obj[name]
    case 'rotation':
      return el._jt_obj['rotationZ']
    case 'scale':
      return el._jt_obj['scaleX']
    case 'autoAlpha':
      return getStyle(el, 'opacity')
    default:
      return getStyle(el, name)
  }
}

function getStyle (el, name) {
  if (el.style[name]) {
    return el.style[name]
  } else {
    const _p = hyphenize(name)
    const _s = window.getComputedStyle(el, null)
    return _s[_p] || _s.getPropertyValue(_p)
  }
}

const cssNumber = {
  'column-count': 1,
  'columns': 1,
  'font-weight': 1,
  'line-height': 1,
  'opacity': 1,
  'z-index': 1,
  'zoom': 1
}

function setProp (el, name, value, unit) {
  switch (name) {
    case 'x':
    case 'y':
    case 'z':
      el._jt_obj[name] = value + (unit || 'px')
      return true
    case 'rotationX':
    case 'rotationY':
    case 'rotationZ':
    case 'skewX':
    case 'skewY':
      el._jt_obj[name] = value % 360 + 'deg'
      return true
    case 'scaleX':
    case 'scaleY':
    case 'scaleZ':
      el._jt_obj[name] = value
      return true
    case 'rotation':
      el._jt_obj['rotationZ'] = value % 360 + 'deg'
      return true
    case 'scale':
      el._jt_obj['scaleX'] = value
      el._jt_obj['scaleY'] = value
      return true
    case 'autoAlpha':
      setStyle(el, 'opacity', value)
      setStyle(el, 'display', value > 0 ? 'block' : 'none')
      return false
    default:
      if (unit !== undefined) value = !cssNumber[hyphenize(name)] ? value + (unit || 'px') : value + unit
      setStyle(el, name, value)
      return false
  }
}

function setStyle (el, name, value) {
  el.style[name] = value
}

function checkDom (obj) {
  return typeof (obj) === 'object' && obj.nodeType === 1
}

function updateTransform (obj) {
  let _t = ''
  if (obj._jt_obj.x || obj._jt_obj.y || obj._jt_obj.z) _t += 'translate3d(' + obj._jt_obj.x + ',' + obj._jt_obj.y + ',' + obj._jt_obj.z + ') '
  if (obj._jt_obj.rotationX) _t += 'rotateX(' + obj._jt_obj.rotationX + ') '
  if (obj._jt_obj.rotationY) _t += 'rotateY(' + obj._jt_obj.rotationY + ') '
  if (obj._jt_obj.rotationZ) _t += 'rotateZ(' + obj._jt_obj.rotationZ + ') '
  if (obj._jt_obj.scaleX !== 1 || obj._jt_obj.scaleY !== 1 || obj._jt_obj.scaleZ !== 1) _t += 'scale3d(' + obj._jt_obj.scaleX + ', ' + obj._jt_obj.scaleY + ', ' + obj._jt_obj.scaleZ + ') '
  if (obj._jt_obj.skewX || obj._jt_obj.skewY) _t += 'skew(' + obj._jt_obj.skewX + ',' + obj._jt_obj.skewY + ') '
  obj.style[browserPrefix('transform')] = _t
}

// --------------------------------------------------------------------计算1rem单位值
let body, tempDiv, remUnit

function checkRem () {
  if (!tempDiv) {
    tempDiv = document.createElement('div')
    tempDiv.style.cssText = 'border:0 solid; position:absolute; line-height:0px;'
  }
  if (!body) {
    body = document.getElementsByTagName('body')[0]
  }

  body.appendChild(tempDiv)
  tempDiv.style.borderLeftWidth = '1rem'
  remUnit = parseFloat(tempDiv.offsetWidth)
  body.removeChild(tempDiv)
}

// --------------------------------------------------------------------全局update
const tweens = []
let tempTweens = []
let isUpdating = false
let lastTime = 0

function globalUpdate () {
  let _len = tweens.length
  if (_len === 0) {
    isUpdating = false
    return
  }

  const _now = JT.now()
  let _step = _now - lastTime
  lastTime = _now
  if (_step > 500) _step = 33

  tempTweens = tweens.slice(0)
  for (let i = 0; i < _len; i++) {
    const _tween = tempTweens[i]
    if (_tween && _tween.isPlaying && !_tween._update(_step)) _tween.pause()
  }

  requestFrame(globalUpdate)
}

class Tween {
  constructor (el, time, fromVars, toVars, isDom) {
    this.initialize(el, time, fromVars, toVars, isDom)
  }

  initialize (el, time, fromVars, toVars, isDom) {
    this.fromVars = fromVars
    this.curVars = {}
    this.toVars = toVars
    this.el = el
    this.duration = Math.max(time, 0) * 1000
    this.ease = toVars.ease || JT.Linear.None
    this.delay = Math.max(toVars.delay || 0, 0) * 1000
    this.yoyo = toVars.yoyo || false
    this.repeat = toVars.repeat || 0
    this.repeatDelay = Math.max(toVars.repeatDelay || 0, 0) * 1000
    this.onStart = toVars.onStart || null
    this.onStartScope = toVars.onStartScope || this
    this.onStartParams = toVars.onStartParams || []
    this.onRepeat = toVars.onRepeat || null
    this.onRepeatScope = toVars.onRepeatScope || this
    this.onRepeatParams = toVars.onRepeatParams || []
    this.onEnd = toVars.onEnd || null
    this.onEndScope = toVars.onEndScope || this
    this.onEndParams = toVars.onEndParams || []
    this.onUpdate = toVars.onUpdate || null
    this.onUpdateScope = toVars.onUpdateScope || this
    this.onUpdateParams = toVars.onUpdateParams || []
    this.isPlaying = false
    this.interpolation = toVars.interpolation || null
    this.isReverse = toVars.isReverse || false
    this.timeScale = toVars.timeScale || 1

    this.isFrom = toVars.isFrom || false
    this.isInited = false
    this.isSeek = false
    this.isKeep = false
    this.isYoReverse = false
    this.isDom = isDom

    this.repeat = this.repeat < 0 ? 999999999999 : Math.floor(this.repeat)
    this.curRepeat = 0

    this.elapsed = null

    this.startTime = this.delay
    this.endTime = this.startTime + this.repeatDelay * this.repeat + this.duration * (this.repeat + 1)
    this.curTime = null
    this.lastTime = null

    if (toVars.isPlaying !== false) this.play()
  }

  _update (time) {
    this.isKeep = false

    time = (this.isReverse ? -1 : 1) * time * this.timeScale
    const _lastTime = this.curTime
    const _curTime = Math.min(this.endTime, Math.max(0, _lastTime + time))

    if (_curTime === this.curTime) return true

    this.lastTime = _lastTime
    this.curTime = _curTime

    const _repeat = Math.min(this.repeat, Math.max(0, Math.floor((this.curTime - this.startTime) / (this.duration + this.repeatDelay))))
    let _isRepeat = false
    if (_repeat !== this.curRepeat) {
      this.curRepeat = _repeat
      if (this.yoyo) this.isYoReverse = this.curRepeat % 2 !== 0
      _isRepeat = true
    }

    if (this.isFrom) {
      initData(this)
      this._updateProp()
    }

    if (this.lastTime < this.startTime && this.curTime < this.startTime) return true

    if (!this.isFrom) {
      initData(this)
      this._updateProp()
    }

    if (this.lastTime < this.curTime) {
      if (this.lastTime <= this.startTime && this.curTime > this.startTime) {
        if (!this.isSeek && this.onStart) this.onStart.apply(this.onStartScope, this.onStartParams)
      }

      if (_isRepeat && !this.isSeek && this.onRepeat) this.onRepeat.apply(this.onRepeatScope, this.onRepeatParams)

      if (this.lastTime < this.endTime && this.curTime >= this.endTime) {
        if (!this.isSeek && this.onEnd) this.onEnd.apply(this.onEndScope, this.onEndParams)
        return this.isKeep
      }
    } else {
      if (this.lastTime >= this.endTime && this.curTime < this.endTime) {
        if (!this.isSeek && this.onEnd) this.onEnd.apply(this.onEndScope, this.onEndParams)
      }

      if (_isRepeat && !this.isSeek && this.onRepeat) this.onRepeat.apply(this.onRepeatScope, this.onRepeatParams)

      if (this.lastTime > this.startTime && this.curTime <= this.startTime) {
        if (!this.isSeek && this.onStart) this.onStart.apply(this.onStartScope, this.onStartParams)
        return this.isKeep
      }
    }

    return true
  }

  _updateProp () {
    let _elapsed = Math.min(1, Math.max(0, (this.curTime === this.endTime ? this.duration : (this.curTime - this.startTime) % (this.duration + this.repeatDelay)) / this.duration))

    if (this.isYoReverse) _elapsed = 1 - _elapsed

    if (_elapsed === this.elapsed) return
    this.elapsed = _elapsed

    const _radio = this.ease(_elapsed)

    let _trans = false

    for (let prop in this.fromVars) {
      const _start = this.fromVars[prop]
      const _end = this.toVars[prop]

      let _n
      if (Array.isArray(_end.num)) {
        _n = this.interpolation(_end.num, _radio)
      } else {
        _n = _start.num + (_end.num - _start.num) * _radio
      }

      _n = fixed(_n)
      this.curVars[prop] = { num: _n, unit: _end.unit }

      if (this.isDom) {
        if (setProp(this.el, prop, _n, _end.unit)) _trans = true
      } else {
        this.el[prop] = _n + (_end.unit || 0)
      }
    }

    if (_trans) updateTransform(this.el)

    if (!this.isSeek && this.onUpdate) this.onUpdate.apply(this.onUpdateScope, this.onUpdateParams)
  }

  _addSelf () {
    tweens.push(this)

    if (!isUpdating) {
      lastTime = JT.now()
      isUpdating = true
    }
  }

  _removeSelf () {
    const i = tweens.indexOf(this)
    if (i !== -1) tweens.splice(i, 1)
  }

  play (time) {
    this.isReverse = false

    if (time !== undefined) this.seek(time, true)

    if (this.curTime === this.endTime) return (this.isKeep = false)
    else this.isKeep = true

    if (this.isPlaying) return
    this.isPlaying = true
    this._addSelf()
  }

  pause () {
    this.isKeep = false

    if (!this.isPlaying) return
    this.isPlaying = false
    this._removeSelf()
  }

  stop () {
    this.pause()
    this.seek(0, true)
  }

  reverse (time) {
    this.isReverse = true

    if (time !== undefined) this.seek(time, true)

    if (this.curTime === 0) return (this.isKeep = false)
    else this.isKeep = true

    if (this.isPlaying) return
    this.isPlaying = true
    this._addSelf()
  }

  seek (time, isSeek) {
    const _time = Math.max(0, Math.min(this.endTime, time * 1000))
    if (this.curTime === _time) return

    this.isSeek = isSeek || false
    this._update((this.isReverse ? -1 : 1) * (_time - this.curTime))
    this.isSeek = false
  }

  setTimeScale (scale) {
    this.timeScale = scale
  }

  kill (toEnd) {
    this.pause()
    if (toEnd) this.seek(this.endTime)
    this.duration = null
    this.curTime = this.lastTime = this.startTime = this.endTime = null
    this.el = this.onStart = this.onRepeat = this.onEnd = this.onUpdate = null
  }
}

// --------------------------------------------------------------------tween 全局方法
function initData (obj) {
  if (obj.isInited) return
  obj.isInited = true

  for (let i in obj.fromVars) {
    const _o = regValue(obj.isDom ? getProp(obj.el, i) : obj.el[i])
    obj.fromVars[i] = obj.fromVars[i] === null ? _o : checkValue(_o, obj.fromVars[i])
    obj.toVars[i] = obj.toVars[i] === null ? _o : checkValue(obj.fromVars[i], obj.toVars[i])
  }
}

function createTween (type, el, time, fromVars, toVars) {
  if (typeof time !== 'number') throw new Error('The second parameter must be a number!')

  checkBezier(toVars)

  const _el = getElement(el)
  const _tweens = []

  each(_el, function (index, obj) {
    const _fromVars = {}
    const _toVars = {}
    const _isDom = checkDom(obj)
    let _vars
    switch (type) {
      case 'fromTo':
        _vars = toVars
        _vars.isFrom = true
        break
      case 'from':
        _vars = fromVars
        _vars.isFrom = true
        break
      case 'to':
        _vars = toVars
        _vars.isFrom = false
        break
    }

    if (_isDom) checkJtobj(obj)

    for (const i in _vars) {
      const _name = checkPropName(obj, i, _isDom)
      if (_name) {
        switch (type) {
          case 'fromTo':
            _fromVars[_name] = fromVars[i]
            _toVars[_name] = toVars[i]
            break
          case 'from':
            _fromVars[_name] = fromVars[i]
            _toVars[_name] = null
            break
          case 'to':
            _fromVars[_name] = null
            _toVars[_name] = toVars[i]
            break
        }
      } else {
        _toVars[i] = _vars[i]
      }
    }

    _tweens.push(new Tween(obj, time, _fromVars, _toVars, _isDom))
  })

  if (_tweens.length === 0) return null
  else if (_tweens.length === 1) return _tweens[0]
  else return _tweens
}

Object.assign(JT, {
  get (el, param) {
    let _el = getElement(el)
    if (_el.length !== undefined) {
      _el = _el[0]
    }
    const _isDom = checkDom(_el)
    if (_isDom) {
      checkJtobj(_el)
      const _name = checkPropName(_el, param, _isDom)
      if (_name) return getProp(_el, _name)
      else return null
    } else {
      return _el[param]
    }
  },

  set (el, params) {
    const _el = getElement(el)
    each(_el, function (index, obj) {
      const _isDom = checkDom(obj)
      if (_isDom) {
        checkJtobj(obj)
        let _trans = false
        for (const i in params) {
          const _name = checkPropName(obj, i, _isDom)
          if (_name) {
            if (checkString(params[i])) {
              if (setProp(obj, _name, params[i])) _trans = true
            } else {
              const _o = checkValue(regValue(getProp(obj, _name)), params[i])
              if (setProp(obj, _name, _o.num, _o.unit)) _trans = true
            }
          }
        }
        if (_trans) updateTransform(obj)
      } else {
        for (const i in params) {
          const _o = checkValue(regValue(obj[i]), params[i])
          obj[i] = _o.num + (_o.unit || 0)
        }
      }
    })
  },

  fromTo (el, time, fromVars, toVars) {
    return (time || toVars.delay) ? createTween('fromTo', el, time, fromVars, toVars) : this.set(el, toVars)
  },

  from (el, time, fromVars) {
    return (time || fromVars.delay) ? createTween('from', el, time, fromVars, {}) : this.set(el, fromVars)
  },

  to (el, time, toVars) {
    return (time || toVars.delay) ? createTween('to', el, time, {}, toVars) : this.set(el, toVars)
  },

  kill (el, toEnd) {
    const _el = getElement(el)
    each(_el, function (index, obj) {
      const _len = tweens.length
      for (let i = _len - 1; i >= 0; i--) {
        const _tween = tweens[i]
        if (_tween.el === obj) {
          _tween.kill(toEnd)
        }
      }
    })
  },

  killAll (toEnd) {
    const _len = tweens.length
    for (let i = _len - 1; i >= 0; i--) {
      const _tween = tweens[i]
      _tween.kill(toEnd)
    }
  },

  play (el, time) {
    actionProxy(el, 'play', time)
  },

  playAll (time) {
    actionProxyAll('play', time)
  },

  pause (el) {
    actionProxy(el, 'pause')
  },

  pauseAll () {
    actionProxyAll('pause')
  },

  stop (el) {
    actionProxy(el, 'stop')
  },

  stopAll () {
    actionProxyAll('stop')
  },

  reverse (el, time) {
    actionProxy(el, 'reverse', time)
  },

  reverseAll (time) {
    actionProxyAll('reverse', time)
  },

  seek (el, time) {
    actionProxy(el, 'seek', time)
  },

  seekAll (time) {
    actionProxyAll('seek', time)
  },

  setTimeScale (el, scale) {
    actionProxy(el, 'setTimeScale', scale)
  },

  setTimeScaleAll (scale) {
    actionProxyAll('setTimeScale', scale)
  },

  isTweening (el) {
    let _el = getElement(el)
    _el = _el[0] || _el
    const _len = tweens.length
    for (let i = _len - 1; i >= 0; i--) {
      const _tween = tweens[i]
      if (_tween.el === _el) return true
    }
    return false
  },

  call (time, callback, params, isPlaying) {
    return time ? new Tween({}, Math.max(0, time), {}, {
      onEnd: callback,
      onEndParams: params,
      isPlaying: isPlaying
    }, false) : callback.apply(callback, params)
  }

})

function actionProxy (el, action, params) {
  const _el = getElement(el)
  const _len = tweens.length
  each(_el, function (index, obj) {
    for (let i = _len - 1; i >= 0; i--) {
      const _tween = tweens[i]
      if (_tween.el === obj) {
        _tween[action](params)
      }
    }
  })
}

function actionProxyAll (action, params) {
  const _len = tweens.length
  for (let i = _len - 1; i >= 0; i--) {
    const _tween = tweens[i]
    _tween[action](params)
  }
}

// --------------------------------------------------------------------bezier
Object.assign(JT, {
  path (obj) {
    checkBezier(obj)
    const _ease = obj.ease || JT.Linear.None
    const _step = obj.step || 1

    let _radio; const _arr = []
    for (let i = 0; i <= _step; i++) {
      _radio = _ease(i / _step)
      const _o = {}
      for (const j in obj) {
        if (Array.isArray(obj[j])) {
          _o[j] = obj.interpolation(obj[j], _radio)
        }
      }
      _arr.push(_o)
    }
    return _arr
  }
})

function checkBezier (obj) {
  if (obj.bezier) {
    sortBezier(obj, obj.bezier)
    obj.interpolation = Bezier
    delete obj.bezier
  }
  if (obj.through) {
    sortBezier(obj, obj.through)
    obj.interpolation = Through
    delete obj.through
  }
  if (obj.linear) {
    sortBezier(obj, obj.linear)
    obj.interpolation = Linear
    delete obj.linear
  }
}

function sortBezier (el, arr) {
  for (let i = 0, l = arr.length; i < l; i++) {
    for (const j in arr[i]) {
      if (i === 0) {
        el[j] = [arr[i][j]]
      } else {
        el[j].push(arr[i][j])
      }
    }
  }
}

function Linear (v, k) {
  const m = v.length - 1; const f = m * k; const i = Math.floor(f); const fn = Utils.Linear
  if (k < 0) return fn(v[0], v[1], f)
  if (k > 1) return fn(v[m], v[m - 1], m - f)
  return fn(v[i], v[i + 1 > m ? m : i + 1], f - i)
}

function Bezier (v, k) {
  let b = 0; const n = v.length - 1; const pw = Math.pow; const bn = Utils.Bernstein; let i
  for (i = 0; i <= n; i++) {
    b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i)
  }
  return b
}

function Through (v, k) {
  const m = v.length - 1; let f = m * k; let i = Math.floor(f); const fn = Utils.Through
  if (v[0] === v[m]) {
    if (k < 0) i = Math.floor(f = m * (1 + k))
    return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i)
  } else {
    if (k < 0) return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0])
    if (k > 1) return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m])
    return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i)
  }
}

const Utils = {
  Linear (p0, p1, t) {
    return (p1 - p0) * t + p0
  },

  Bernstein (n, i) {
    const fc = this.Factorial
    return fc(n) / fc(i) / fc(n - i)
  },

  Factorial: (function () {
    let a = [1]
    return function (n) {
      let s = 1; let i
      if (a[n]) return a[n]
      for (i = n; i > 1; i--) s *= i
      return (a[n] = s)
    }
  })(),

  Through (p0, p1, p2, p3, t) {
    const v0 = (p2 - p0) * 0.5; const v1 = (p3 - p1) * 0.5; const t2 = t * t; const t3 = t * t2
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1
  }
}
