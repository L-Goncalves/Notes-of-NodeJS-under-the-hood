# Understanding Javascript under the hood

In this we'll go deeper into these questions:
JavaScript is single-threaded
V8 powers the Chrome JavaScript engine
JavaScript uses callback queues
There's an event loop of some sort

Nowadays, the most popular JavaScript engine is V8 due to the fact that it's used on Chrome.

However, since V8 is used both on Chrome and Node.js, we're sticking with it.<br> This is a very simplified view of what it looks like:

<img src="https://res.cloudinary.com/practicaldev/image/fetch/s--M1-XdaOR--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/v8-simplified.png"/>

This engine consists, mainly, in two components:

<ul>
<li>The memory heap: where all memory allocation happens.</li>
<li>The call stack: where our code gets framed and stacked to execute V8
which Lucas wrote another article about this.</li>
</ul>

### JavaScript Runtime
The majority of APIs that developers use are coming from the engine itself, although some of them are not coming from that like the `setTimeout` or any DOM manipulation like `document` or even AJAX (the XMLHttpRequest object) but like, where do all of these APIs come from? We'll take our previous image and bring back to the reality:

<img src="https://res.cloudinary.com/practicaldev/image/fetch/s--eVmWSWwq--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/v8-real.png"/>

The engine is just a small part of what Javascript does, in Javascript there's some API's provided by the Web API's as well as external API's. Those API's (like `DOM`, `AJAX` & `setTimeout` are provided by the developers of the web browser or by the runtime itself like Node with differents API's.

When we take a look at Javacrip from today we see a big part of that full of NPM packages and other stuff.

Before ES6 and Node.js existed there were no consensus of how to implement those API's at the side of the browser. nowadays we have that.

Furthermore, we have the event loop and the callback queue.


### Callstack

Most people think or have heard that JS is a single-threaded language and they just accepted it as the final truth in the universe without ever really knowing why. Being single-threaded means we only have a single call stack, in other words, we can only execute one thing at a time.

<img src="https://res.cloudinary.com/practicaldev/image/fetch/s--nTa40azM--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://github.com/khaosdoctor/my-notes/raw/master/node/assets/call-stack.jpg"/>


### What are Stacks?

Stacks are basically a abstract data type that servers as a collection of elements. The name "Stack" comes from the analogy to a set of boxes stacked on top of each other, while it is easy to take a box off the top of the stack, taking last box off (from below) may require us to take another ones first.


Stack has two main methods:
<ul>
<li><b>Push:</b> Adds another element to the collection</li>
<li><b>Pop:</b> Removes the most recently added element that was not yet removed from the stack and returns its value</li>
  <li><b>Peek:</b> Reads the most recent added item without removing it.</li>
</ul>

Thoughts on this: Maybe it's like an array(?)

<b>The order of how the elements are pushed and popped really matters.</b> the order in which elements come off a stack are called LIFO (Last In First Out).



To be continued.....
