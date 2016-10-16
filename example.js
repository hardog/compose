'use strict';

const compose = require('./');

let c = compose([
 function *(next){
     console.log(1);
     yield* next;
 },
 function *(next){
     console.log(2);
     yield* next;
 }
])(function *(){
     console.log(3);
}());

console.log(c.next());

console.log('------------ SECTION1 -------------');

function *anotherG(){
    console.log('##############################');
    console.log('another yield primitive value');
    yield 1;
    console.log('another yield fn');
    yield function(){
        console.log('another fn');
        return 'fn';
    };
    console.log('##############################');
}

function *g(){
    console.log('yield primitive value');
    yield 1;
    console.log('yield fn');
    yield function(){
        console.log('this is fn');
        return 'fn';
    };
    console.log('yield arr');
    yield [1, 2, 3];
    console.log('yield object');
    yield {a: 1};
    console.log('yield Promise');
    yield Promise.resolve(1);
    console.log('yield another generator');
    // yield* 后面接一个迭代器(具有Symbol.interator接口)
    yield* anotherG();
    console.log('yet last one');
    yield 'hi, this is last one';
}

let gg = g();

console.log(gg.next());
console.log(gg.next());
console.log(gg.next());
console.log(gg.next());
console.log(gg.next());
console.log(gg.next());
console.log(gg.next());
console.log(gg.next());
console.log(gg.next());

console.log('------------ SECTION2 -------------');

function *s1(){
    yield 1;
    yield 2;
    return 'hll';
}

function *s(){
    let r = yield *s1();
    // r的值是 s1 return 的值
    console.log('r value is from previous generator return', r);
    yield 3;
}

let ss = s();

console.log(ss.next());
console.log(ss.next());
console.log(ss.next());
// console.log(ss.next());
// console.log(ss.next());