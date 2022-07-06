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
