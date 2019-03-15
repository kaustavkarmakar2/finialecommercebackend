# Migration to v2

## Changed callback function for parallel patterns

Breaking changes affects the methods
- `each`
- `eachLimit`
- `parallel`
- `parallelLimit`

The optional `callback` function was changed from `Array<Error>` to `AsynccError`.

```js
each([1, 2, 3],
 (item, cb, index) => {
   cb(index % 2 ? null : 'error', item + index)
 }, (err, res, errpos) => {
   //> err = [null, 'error', null]
   //> res = [1, 4, 5]
   //> errpos = [1]
 }
)
```

to

```js
each([1, 2, 3],
 (item, cb, index) => {
   cb(index % 2 ? null : 'error', item + index)
 }, (err, res) => {
   //> err [AsynccError]
   //> err.errors = [null, 'error', null]
   //> err.errpos = [1]
   //> res = [1, 4, 5]
 }
)
```

## Optional settings for parallel execution

Optional settings `timeout` and `bail` for 
- each
- eachLimit
- parallel
- parallelLimit
