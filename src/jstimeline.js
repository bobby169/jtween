import { JT } from './jstween'
// --------------------------------------------------------------------辅助方法
function regValue (value) {
  const _r = /(^[a-zA-Z]\w*|)(\+=|-=|)(\d*\.\d*|\d*)/
  const _a = _r.exec(value)
  return { label: _a[1], ext: _a[2], num: parseFloat(_a[3]) }
}

const requestFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60)
  }

// --------------------------------------------------------------------全局update
const timelines = []
let tempTimelines = []
let isUpdating = false
let lastTime = 0

function globalUpdate () {
  const _len = timelines.length
  if (_len === 0) {
    isUpdating = false
    return
  }

  const _now = JT.now()
  let _step = _now - lastTime
  lastTime = _now
  if (_step > 500) _step = 33

  tempTimelines = timelines.slice(0)
  for (let i = 0; i < _len; i++) {
    const _timeline = tempTimelines[i]
    if (_timeline && _timeline.isPlaying && !_timeline._update(_step)) _timeline.pause()
  }

  requestFrame(globalUpdate)
}

class Timeline {
  constructor (vars) {
    this.initialize(vars)
  }
  initialize (vars) {
    vars = vars || {}
    this.duration = 0
    this.delay = Math.max(vars.delay || 0, 0) * 1000
    this.onStart = vars.onStart || null
    this.onStartScope = vars.onStartScope || this
    this.onStartParams = vars.onStartParams || []
    this.onEnd = vars.onEnd || null
    this.onEndScope = vars.onEndScope || this
    this.onEndParams = vars.onEndParams || []
    this.onUpdate = vars.onUpdate || null
    this.onUpdateScope = vars.onUpdateScope || this
    this.onUpdateParams = vars.onUpdateParams || []
    this.isPlaying = false
    this.isReverse = vars.isReverse || false
    this.timeScale = vars.timeScale || 1

    this.isSeek = false
    this.isKeep = false

    this.startTime = this.delay
    this._updateEndTime()
    this.curTime = null
    this.lastTime = null

    this.labels = []
    this.tweens = []
    this.calls = []
  }

  _updateEndTime () {
    this.endTime = this.startTime + this.duration
  }

  _update (time) {
    this.isKeep = false

    time = (this.isReverse ? -1 : 1) * time * this.timeScale
    const _lastTime = this.curTime
    const _curTime = Math.min(this.endTime, Math.max(0, _lastTime + time))

    if (_curTime === this.curTime) return true

    this.lastTime = _lastTime
    this.curTime = _curTime

    this._updateProp()

    if (this.lastTime < this.startTime && this.curTime < this.startTime) return true

    if (this.lastTime < this.curTime) {
      if (this.lastTime <= this.startTime && this.curTime > this.startTime) {
        if (!this.isSeek && this.onStart) this.onStart.apply(this.onStartScope, this.onStartParams)
      }

      if (this.lastTime < this.endTime && this.curTime >= this.endTime) {
        if (!this.isSeek && this.onEnd) this.onEnd.apply(this.onEndScope, this.onEndParams)
        return this.isKeep
      }
    } else {
      if (this.lastTime >= this.endTime && this.curTime < this.endTime) {
        if (!this.isSeek && this.onEnd) this.onEnd.apply(this.onEndScope, this.onEndParams)
      }

      if (this.lastTime > this.startTime && this.curTime <= this.startTime) {
        if (!this.isSeek && this.onStart) this.onStart.apply(this.onStartScope, this.onStartParams)
        return this.isKeep
      }
    }

    return true
  }

  _updateProp () {
    this._checkTween()
    this._checkCall()

    if (!this.isSeek && this.onUpdate) this.onUpdate.apply(this.onUpdateScope, this.onUpdateParams)
  }

  _addSelf () {
    timelines.push(this)

    if (!isUpdating) {
      lastTime = JT.now()
      isUpdating = true
      requestFrame(globalUpdate)
    }
  }

  _removeSelf () {
    const i = timelines.indexOf(this)
    if (i !== -1) timelines.splice(i, 1)
  }

  _parsePosition (position) {
    if (position === undefined) return this.duration

    const _o = regValue(position)
    let _time = 0
    if (_o.label) {
      _time = this.getLabelTime(_o.label)
    } else if (_o.ext) {
      switch (_o.ext) {
        case '+=':
          _time = this.duration + _o.num * 1000
          break
        case '-=':
          _time = this.duration - _o.num * 1000
          break
      }
      this._updateEndTime()
    } else if (_o.num) {
      _time = _o.num * 1000
    }

    return _time
  }

  addCall (call, position) {
    const _time = this._parsePosition(position)
    this.duration = Math.max(this.duration, _time)
    this.calls.push({ time: _time, call: call })
    this._updateEndTime()
  }

  _checkCall () {
    for (let i = 0, _len = this.calls.length; i < _len; i++) {
      const _call = this.calls[i]
      const _lastTime = this.lastTime - this.startTime
      const _curTime = this.curTime - this.startTime
      const _startTime = _call.time
      if (!this.isSeek) {
        if (_lastTime < _curTime) {
          if ((_startTime === 0 && _lastTime === 0 && _curTime > 0) || (_lastTime < _startTime && _curTime >= _startTime)) _call.call()
        } else {
          if ((_lastTime > _startTime && _curTime <= _startTime) || (_startTime === this.endTime && _lastTime === this.endTime && _curTime < this.endTime)) _call.call()
        }
      }
    }
  }

  addTween (tween, position) {
    // tween.pause();
    const _time = this._parsePosition(position)
    this.duration = Math.max(this.duration, _time + tween.endTime)
    this.tweens.push({ time: _time, tween: tween })
    this._updateEndTime()
  }

  _checkTween () {
    for (let i = 0, _len = this.tweens.length; i < _len; i++) {
      const _tween = this.tweens[i]
      const _lastTime = this.lastTime - this.startTime
      const _curTime = this.curTime - this.startTime
      const _startTime = _tween.time
      if (_tween.tween.curTime !== null || _lastTime >= _startTime || _curTime >= _startTime) {
        _tween.tween.seek((_curTime - _startTime) / 1000, this.isSeek)
      }
    }
  }

  fromTo (el, time, fromVars, toVars, position) {
    toVars.isPlaying = false
    this.addTween(JT.fromTo(el, time, fromVars, toVars), position)
    return this
  }

  from (el, time, fromVars, position) {
    fromVars.isPlaying = false
    this.addTween(JT.from(el, time, fromVars), position)
    return this
  }

  to (el, time, toVars, position) {
    toVars.isPlaying = false
    this.addTween(JT.to(el, time, toVars), position)
    return this
  }

  add (obj, position) {
    switch (typeof (obj)) {
      case 'object':
        this.addTween(obj, position)
        break
      case 'function':
        this.addCall(obj, position)
        break
      case 'string':
        this.addLabel(obj, position)
        break
      default:
        throw new Error('add action is wrong!!!')
    }
    return this
  }

  remove (position) {
    const _time = this._parsePosition(position)

    for (let _len = this.tweens.length, i = _len - 1; i >= 0; i--) {
      const _tween = this.tweens[i]
      if (_tween.time === _time) this.tweens.splice(i, 1)
    }
    return this
  }

  addLabel (name, position) {
    this.removeLabel(name)
    const _time = this._parsePosition(position)
    this.labels.push({ name: name, time: _time })
  }

  removeLabel (name) {
    for (let i = 0, _len = this.labels.length; i < _len; i++) {
      const _label = this.labels[i]
      if (name === _label.name) {
        this.labels.splice(i, 1)
        return
      }
    }
  }

  getLabelTime (name) {
    for (let i = 0, _len = this.labels.length; i < _len; i++) {
      const _label = this.labels[i]
      if (name === _label.name) return _label.time
    }
    return null
  }

  totalTime () {
    return this.duration
  }

  play (position) {
    this.isReverse = false

    if (position !== undefined) this.seek(position, true)

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

  reverse (position) {
    this.isReverse = true

    if (position !== undefined) this.seek(position, true)

    if (this.curTime === 0) return (this.isKeep = false)
    else this.isKeep = true

    if (this.isPlaying) return
    this.isPlaying = true
    this._addSelf()
  }

  seek (position, isSeek) {
    const _time = Math.max(0, Math.min(this.endTime, this._parsePosition(position)))
    if (this.curTime === _time) return

    this.isSeek = isSeek || false
    this._update((this.isReverse ? -1 : 1) * (_time - this.curTime))
    this.isSeek = false
  }

  kill (toEnd) {
    this.pause()
    if (toEnd) this.seek(this.endTime)
    this.labels = []
    this.tweens = []
    this.calls = []
    this.duration = null
    this.curTime = this.lastTime = this.startTime = this.endTime = null
    this.onStart = this.onEnd = this.onUpdate = null
  }
}

// ---------------------------------------------------------------全局方法
export const JTL = {
  create (vars) {
    return new Timeline(vars)
  },
  kill (tl) {
    tl.kill()
  }
}
