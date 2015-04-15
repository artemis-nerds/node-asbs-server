# node-artemis
An Artemis SBS server interface written in Node.

Thanks for checking out node-artemis! node-artemis is an _unofficial_ custom server for the [Artemis Space Bridge Simulator](http://www.artemis.eochu.com/).
Its goal is to create a server framework that can be easily extended and modified, allowing custom game types to be created,
while also providing a server with the same feature set as the core game server.

node-artemis is also designed to be able to be run as an MMO server rather than just a small server with ten people connected. One of the goals
is to allow node-artemis to make full use of multi-core processors and distributed systems to be able to host games with hundreds or thousands
of players online.

Looking for documentation on the Artemis packet protocol? node-artemis uses [ArtClientLibs documentation](https://github.com/rjwut/ArtClientLib/wiki/Artemis-Packet-Protocol)
on the protocol for development, and we recommend you take a look too. Any 'discoveries' in the protocol from node-artemis are published on that wiki.

## Quick-Run

To download and try Artemis out for yourself, you first need to clone the repo and install dependencies.

```
$ git clone https://github.com/mrfishie/node-artemis
$ cd node-artemis
$ npm install
```

node-artemis needs some of Artemis' data files to run. Find the installation path for Artemis and copy the `dat` folder to the node-artemis folder (so you have a `dat` folder in the node-artemis folder). On Windows x64, Artemis is installed at `C:\Program Files (x86)\Artemis`. **_If you do not have the required data files, node-artemis will not be able to run. As a result, you cannot use node-artemis without owning the Artemis game._**

Now, run the `npm start` command to start a vanilla instance of node-artemis (vanilla meaning default configuration and
gameplay).
