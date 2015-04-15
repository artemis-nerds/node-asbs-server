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
