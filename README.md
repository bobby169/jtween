# jtween
jtween forked from [jstween](https://github.com/shrekshrek/jstween) to support npm

## Usage

```bash
$ npm install jtween
```

```js
import { JT, JTL, Ease } from 'jtween'

const tl = JTL.create()
const po = {
  tbg: {
    from: {
      scale: 0
    },
    to: {
      scale: 1
    }
  },
  t1: {
    from: {
      left: '-5.00rem'
    },
    to: {
      left: '1.90rem'
    }
  },
}
tl.fromTo(this.$refs.tbg, 0.2, po.tbg.from, po.tbg.to)
.fromTo(this.$refs.ind, 0.2, po.t1.from, po.t1.to, '-=0.3')
tl.play(0)
```

## js tween

简单好用的tween类，api参考tweenmax。可对一般对象或者Dom对象使用。

### API
全局tween方法:

- JT.get(target, name); name为属性名字符串
- JT.set(target, params); params为对象

- JT.fromTo(target, duration, fromParams, toParams);
- JT.from(target, duration, fromParams);
- JT.to(target, duration, toParams);

- JT.play(target, time);
- JT.playAll(time);

- JT.pause(target);
- JT.pauseAll();

- JT.stop(target);
- JT.stopAll();

- JT.reverse(target, time);
- JT.reverseAll(time);

- JT.seek(target, time);
- JT.seekAll(time);

- JT.kill(target, [toEnd]);
- JT.killAll([toEnd]);

- JT.isTweening(target);

- JT.call(delay, callback, callbackParams);

其中几个属性比较特殊:
- linear:[] 折线数组
- bezier:[] 贝塞尔数组
- through:[] 同样是贝塞尔数组,不过是穿越数组中各点

- ease 设置缓动，
- delay 设置延时时间，
- repeat 设置重复次数，
- repeatDelay 设置每次重复的间隔延时时间，
- yoyo 设置重复时反向，
- isPlaying 设置是否立即播放，
- onStart 设置运动开始的返回函数，
- onStartParams 设置开始返回函数的参数，
- onRepeat 设置运动循环中每个运动完成的返回函数，
- onRepeatParams 设置运动完成返回函数的参数，
- onEnd 设置运动完成的返回函数，
- onEndParams 设置返回函数的参数
- onUpdate 设置每帧渲染时的返回函数，
- onUpdateParams 设置每帧渲染时返回函数的参数，

tween实例方法：

- tween.play(time); 播放，带参则指定起始播放点
- tween.pause(); 暂停
- tween.stop(); 停止，播放头回到0
- tween.reverse(time); 倒播，带参则指定起始播放点
- tween.seek(time); 跳到播放点
- tween.kill([toEnd]); 删除，参数设置是否直接去到终点并出发onEnd

全局path方法:

- JT.path(obj);

包含以下属性:
- linear:[]折线数组
- bezier:[]贝塞尔数组
- through:[]同样是贝塞尔数组,不过是穿越数组中各点

- ease设置缓动，
- step设置分步的步数,

## 缓动类

- Ease.Linear
- Ease.Quad
- Ease.Cubic
- Ease.Quart
- Ease.Quint
- Ease.Sine
- Ease.Expo
- Ease.Circ
- Ease.Elastic
- Ease.Back
- Ease.Bounce

除了JT.Linear只有None一项，其他均有In,InOut,Out三项选择。

以上方法和参数均是参考TweenLite的方式，有使用经验者会很容易上手。

## js timeline
jstween的扩展库,类似于greensock的TimelineLite,不过功能比较简单,方便编写大量基于时间线的jstween 注:本库强依赖jstween

### API

全局方法:
- JTL.create();
- JTL.kill();

实例方法:
- fromTo();
- from();
- to();
- kill();
- add();
- addLabel();
- removeLabel();
- getLabelTime();
- totalTime();
- play(position);
- pause();
- reverse(position);
- seek();

## License

[MIT](http://opensource.org/licenses/MIT)
