var co = require('co');
var compose = require('..');

function wait(ms) {
  return function (done) {
    setTimeout(done, ms || 0);
  }
}

describe('Koa Compose', function(){
  it('should work', function(done){
    var arr = [];
    var stack = [];

    stack.push(function *(next){
      arr.push(1);
      yield wait(1);
      yield next;
      yield wait(1);
      arr.push(6);
    })

    stack.push(function *(next){
      arr.push(2);
      yield wait(1);
      yield next;
      yield wait(1);
      arr.push(5);
    })

    stack.push(function *(next){
      arr.push(3);
      yield wait(1);
      yield next;
      yield wait(1);
      arr.push(4);
    })

    Promise.resolve()
    .then(() => co(compose(stack)))
    .then(() => {
      arr.should.eql([1, 2, 3, 4, 5, 6]);
      done();
    })
    .catch((e) => console.log(e));
  })

  it('should work with 0 middleware', function(done){
    Promise.resolve()
    .then(() => co(compose([])))
    .then(() => done());
  })

  it('should work within a generator', function(done){
    var arr = [];

    Promise.resolve()
    .then(() => co(function *(){
      arr.push(0);

      var stack = [];

      stack.push(function* (next){
        arr.push(1);
        yield next;
        arr.push(4);
      });

      stack.push(function *(next){
        arr.push(2);
        yield next;
        arr.push(3);
      });

      yield compose(stack)

      arr.push(5);
    }))
    .then(() => {
      arr.should.eql([0, 1, 2, 3, 4, 5]);
      done();
    })
    .catch((e) => console.log(e));
  })

  it('should work when yielding at the end of the stack', function(done) {
    var stack = [];

    stack.push(function *(next){
      yield next;
    });

    co(compose(stack))
    .then(done);
  })

  it('should work when yielding at the end of the stack with yield*', function(done) {
    var stack = [];

    stack.push(function *(next){
      yield* next;
    });

    co(compose(stack))
    .then(done);
  })

  it('should keep the context', function(done){
    var ctx = {};
    // 每个中间件的上下文不变
    var stack = [];

    stack.push(function *(next){
      yield next
      this.should.equal(ctx);
    })

    stack.push(function *(next){
      yield next
      this.should.equal(ctx);
    })

    stack.push(function *(next){
      yield next
      this.should.equal(ctx);
    })

    // co(compose(stack)).call(ctx, done);
    co.call(ctx, compose(stack))
    .then(done);
  })

  it('should catch downstream errors', function(done){
    var arr = [];
    var stack = [];

    stack.push(function *(next){
      arr.push(1);
      try {
        arr.push(6);
        yield next;
        arr.push(7);
      } catch (err) {
        arr.push(2);
      }
      arr.push(3);
    })

    stack.push(function *(next){
      arr.push(4);
      throw new Error();
      arr.push(5);
    })

    co(compose(stack))
    .then(() => {
      arr.should.eql([1, 6, 4, 2, 3]);
      done();
    });
  })

  it('should return last return value', function(done){
    var stack = [];

    stack.push(function *(next){
      var val = yield next;
      val.should.equal(2);
      return 1;
    });
    stack.push(function *(next){
      yield function(done){
        done(null, 'hello');
      };
      yield next;
      return 2;
    });

    Promise.resolve()
    .then(() => co(compose(stack)))
    .then((val) => {
      val.should.equal(1);
      done();
    })
    .catch((e) => console.log(e));
  });

  it('should return the first middleware return value', function(done){
    var stack = [];

    stack.push(function *(next){
      yield next;
      yield function(done){
        console.log('enter fn');
        // co 里面yield 一个函数, 
        // 该函数带有done回调参数, 第一个值为错误, 第二个为返回的函数结果
        done(null, 2);
      };

      return 'first';
    });

    stack.push(function *(next){
      yield next;
      return 'second';
    });

    stack.push(function *(next){
      yield next;
      return 'third';
    });

    Promise.resolve()
    .then(() => co(compose(stack)))
    .then((val) => {
      val.should.equal('first');
      done();
    })
    .catch(done);
  })
})
