# node-artemis
An Artemis SBS server interface written in Node.

Thanks for checking out node-artemis! node-artemis is an _unofficial_ custom server library for the [Artemis Space Bridge Simulator](http://www.artemis.eochu.com/).
Its goal is to create a server framework that can be easily extended and modified, allowing custom game types to be created,
while also providing a server with the same feature set as the core game server.

node-artemis is also designed to be able to be run as an MMO server rather than just a small server with ten people connected. One of the goals
is to allow node-artemis to make full use of multi-core processors and distributed systems to be able to host games with hundreds or thousands
of players online.

node-artemis _is not_ designed to be a standalone server. It is designed to provide an interface to allow another application to host a node-artemis server, as well as configure the server and change behaviour.

Looking for documentation on the Artemis packet protocol? node-artemis uses [ArtClientLibs documentation](https://github.com/rjwut/ArtClientLib/wiki/Artemis-Packet-Protocol)
on the protocol for development, and we recommend you take a look too. Any 'discoveries' in the protocol from node-artemis are published on that wiki.

## Quick-Run

To download and try Artemis out for yourself, you first need to clone the repo and install dependencies.

```
$ git clone https://github.com/mrfishie/node-artemis
$ cd node-artemis
$ npm install
```

node-artemis needs some of Artemis' data files to run. Find the installation path for Artemis and copy the `dat` folder to the node-artemis folder (so you have a `dat` folder in the node-artemis folder). On Windows x64, Artemis is installed at `C:\Program Files (x86)\Artemis`. **_If you do not have the required data files, node-artemis will not be able to run. As a result, you cannot (and definitely should not!) use node-artemis without owning the Artemis game._**

Now, run the `npm start` command to start a vanilla instance of node-artemis (vanilla meaning default configuration and
gameplay).

## Credit

Without the awesome work of many people, this project would not be possible. Here are just some of the projects that were incredibly useful when creating this software:

 - **ArtClientLib** for the amazing work in documenting most of the packet protocol.
 - **Artemis Glitter** for the network encoding/decoding systems to translate to and from Artemis' formats.
 - **Lodash** for making things simple.
 - **Bluebird** for the awesome promise library that it is.

## License

node-artemis is licensed under the MIT license, but also includes code licensed under the "Beer-ware license". Both of these licenses are included below.

The MIT License (MIT)

Copyright (c) 2015 mrfishie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.



Some of the code included is modified from Ivan Sanchez's [Glitter project](https://github.com/IvanSanchez/artemis-glitter). The following
license is included for the files and portions from that project.

----------------------------------------------------------------------------
"THE BEER-WARE LICENSE":
<ivan@sanchezortega.es> wrote this file. As long as you retain this notice you
can do whatever you want with this stuff. If we meet some day, and you think
this stuff is worth it, you can buy me a beer in return.
----------------------------------------------------------------------------
