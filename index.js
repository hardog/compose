
/**
 * Expose compositor.
 */

module.exports = compose;

// 组合中间件按照数组的顺序执行中间件
// 最后一个middleware是noop, 啥也不执行
// 疑问: gen.next()返回的{value: xx, done: xx}
// done 什么时候被判断为true
// 答: 每一次gen.next() 执行结束后ret.done为true
// co里面对于每一个generator会调用一次co(gen)去执行
function compose(middleware){
  return function *(next){
    if (!next) next = noop();

    var i = middleware.length;

    while (i--) {
      next = middleware[i].call(this, next);
    }

    return yield *next;
  }
}

/**
 * Noop.
 *
 * @api private
 */

function *noop(){}
