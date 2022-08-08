# Deep dive into the event loop


## Livuv

### What's libuv? Why do we need it?


Libuv was originally developed for Node.js itself as an abstraction around `libev`, however, by now multiple projects are using it.

Libuv is an open-sourced library that handles:

<ul>
  <li>The thread-pool</li>
  <li>Doing signaling</li>
  <li>Inter process communications</li>
  <li>And all the other magic to make asynchronous tasks work</li>
</ul>

<b>Most people think libuv is the event loop itself, and that's not true.</b>

libuv implements a full featured event loop, but also is the thing that is the home for multiple other parts of Node such as:


<ul>
  <li>TCP and UDP sockets of the `net` package</li>
  <li>Async DNS resolutions</li>
  <li>Async file and file system operations</li>
  <li>File System events</li>
  <li>IPC</li>
  <li>Child processes and shell control</li>
  <li>Thread pool</li>
  <li>Signal handling</li>
  <li>High resolution clock</li>
</ul>

<h4>This is mainly why Node.js uses it, it's a full abstraction around several key parts of every OS, and it is necessary for the whole runtime to interact with it's surounding environment.<h4>

## Event Loop
  Now talking about other situation. In the browser, in pure Javascript what would happen if you had a long-running function in your call stack? Those kind of functions that take a while to finish, like a complex image processing or a long matrix transformation?
  
  In most languages you should not have any problem, since they are multi-threaded, but in single-threaded languages, this a very serious issue. Because while the call stack has functions to execute, the browser can't actually do anything else (Because it would be single-threaded).
  
 Another issue that might happen is that browsers are quit controlling, so if a tab takes too long to respond, they might take action by raising an error to ask you if you want to terminate that webpage or not. On the other hand complex tasks and long running code is what allow us to create great software so how can we conciliate those two without making the browser show us errors? Async callbacks, the base of what Node.js is.
  
  
## Async callbacks
  
 Most Javascript applications works by loading a single `.js` file into memory and then all the magic happens after that entrypoint is executed. This can be divided into several build blocks, the "now" blocks, and the "later" blocks.
  
 Usually, only one of those is going to be the "now" block which means that it'll be the one to execute in the main thread (pushing calls to the call stack), and all the others will be executed later on.
  
The biggest problem when it comes to async programming is that most people think that "later" is sometime close to between "now" and a milisecond after it. which is a lie.
  
  <h4>Everything in Javascript is scheduled to execute and finish at a later time, which doesn't necessarily happen stricly after the main thread, they're by definition going to complete when they complete</h4>


For instance, let's take a simple AJAX call which calls an API:
````javascript
const response = call('http://api') // call() is some http request package, like fetch
console.log(response)
````

Since AJAX calls are not completed right after they're called, it takes a while for the HTTP handshake to happen, to get data, download the data...
So the `console` function would print `undefined`

A simple way of "waiting" for the response to come are callbacks. Callbacks are, since the beginning of programming, an automatically called function that is passed on as a parameter to another function which will be executed and/or have its value returned after "now". So, basically, callbacks are a way of saying: "Hey, when you do have this value, call this callback". So let's improve our example:

````javascript
const response = call('http://api', (response) => {
  console.log(response)
})
````

This is basically stating that when the call is over, an anonymous function will be automatically called, since the call returns the response we would have it log on the response. (but only log because it does not use `return` within the function)

## Inside the event loop

Until ES6, Javascript actually never had any sort of consensus or notion asynchony built into the core itself, this means that JS would receive your order to execute some async code and send it to the engine, which would give JS a thumbs up and answer with "I'll see into it, someday". So there was no order neither logic on how the later would behave built into the engines.

JS engines don't run isolated from everything else. They run inside what is called hosting environment. This environment can be whatever place JS is running into.

<b>Note: they all have event loop</b>

The event loop is what actually takes care of async code execution for the JS engines, at least of the scheduling part. It's the one who calls the engine and send commands to be executed, and also is the one who queues response callbacks which the engine returns to be called afterwards.

JS engine is nothing more than on-deamnd execution environment, the event loop, is responsible for scheduling the JS code executions, which are called events.

Now let's go back to our ``readFile`` code:
````javascript 
  
  fs.readFile(filePath, function cb (err, data) => {
      if (err) return reject(err)
      return resolve(callback(data))
    })
````
When we run it the readFile function is wrapped into a Promise object, but in essence this function is a callback function.

````
(err, data) => string
````
This part is basically telling the engine to run a read operation on a file, the JS Engine then tells the hosting environment that it's going to suspend the execution of that bit of code for now, but, as soon as the environment (the event loop) has the response, it should schedule this anonymous callback function (the cb) to be executed as soon as possible. Then, the environment (in our case, it's Node.js) is set up to listen to this response from the file operation, when this response arrives, it schedules the cb function to be executed by inserting it into the event loop.

<b>Note: need to explore more Event Loop to really get the idea</b>


Let's remind of our old diagram:

<img src="https://res.cloudinary.com/practicaldev/image/fetch/s--eVmWSWwq--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/v8-real.png"/>


Web APIs are, in essence, threads that we cannot access as developers, we can only make calls to them. Generally these are pieces that are built into the environment itself, for instance, in a browser environment, these would be APIs like document, XMLHttpRequest or setTimeout, which are mostly async functions. In Node.js these would be our C++ APIs we saw in the first part of the guide.
  
So, in plain words, whenever we call a function like setTimeout on Node.js, this call is sent to a different thread. All of this is controlled and provided by libuv, including the APIs we're using.

Let's zoom into the event loop part:

<img src="https://res.cloudinary.com/practicaldev/image/fetch/s--LjaesHz8--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/event-loop.png" />

The events loop has a single task: Monitor the call stack and what is called in the callback queue, once the call stack is empty it'll take first event from the callback queue and push it into the call stack, which runs it. To this iteration, taking a callback from the queue and executing it into the call stack we give the name of ``tick``


Let's look at event loop but in a simpler way (with code):

```javascript 
console.log('Node.js')
setTimeout(function cb() { console.log(' awesome!') }, 5000)
console.log(' is')
```

This should print "Node.js is awesome" in the console but how do this thing happen?

1. Everything is empty, nothing is called

<img src="https://res.cloudinary.com/practicaldev/image/fetch/s--OydeTeFL--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/el-0.png"/>
  
2. ``console.log('Node.JS')`` is added to the call stack  
<img src="https://res.cloudinary.com/practicaldev/image/fetch/s--xBxSN2X6--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/el-1.png"/>
  
3. ``console.log('Node.JS')`` is executed
<img src="https://res.cloudinary.com/practicaldev/image/fetch/s--ZpppyT5---/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/el-2.png"/>

  
4. ``console.log('Node.JS')`` is removed from the stack
<img src="https://res.cloudinary.com/practicaldev/image/fetch/s--ZpppyT5---/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/el-3.png"/>
  
  
1. ``setTimeout`` is added to the call stack
  <img src="https://res.cloudinary.com/practicaldev/image/fetch/s--ZpppyT5---/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/el-4.png"/>
  
2. ``setTimeout`` is executed
  <img src="https://res.cloudinary.com/practicaldev/image/fetch/s--ZpppyT5---/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/el-5.png"/>
  
3. ``setTimeout`` is complete and removed from the call stack
  <img src="https://res.cloudinary.com/practicaldev/image/fetch/s--ZpppyT5---/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/el-6.png"/>
  
1. ``is`` is added to the call stack
  <img src="https://res.cloudinary.com/practicaldev/image/fetch/s--ZpppyT5---/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/el-7.png"/>
  
2. ``is`` is executed
  <img src="https://res.cloudinary.com/practicaldev/image/fetch/s--ZpppyT5---/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/el-8.png"/>
  
3. ``is`` is removed from the call stack
  <img src="https://res.cloudinary.com/practicaldev/image/fetch/s--ZpppyT5---/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/el-9.png"/>
  
  
