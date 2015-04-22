# node-artemis
[![Build Status](https://travis-ci.org/mrfishie/node-artemis.svg)](https://travis-ci.org/mrfishie/node-artemis)

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

To download and try node-artemis out for yourself, you will first need to download install [NodeJS](nodejs.org). When Node has finished installing, open the terminal and run the following command:

	npm install node-artemis -g

This will download and install node-artemis and its dependencies.

Next, you need to configure node-artemis to be able to find your Artemis installation's data files. node-artemis requires the data files from the actual game. As a result, you cannot (and definitely should not!) use node-artemis without owning Artemis.

To do this, open the NPM modules folder. On Windows, this is located in `%appdata%\npm\node_modules`. Find the node-artemis folder, enter it, open the `lib` folder, and then the `config` folder. Now, open `vesselData.js` in your favourite text editor. Change the line reading

	dir: 'dat/'

To contain the directory that contains Artemis' data files. For example, on Windows x64, you would change this to

	dir: 'C:/Program Files (x86)/Artemis/dat/'

Remember, if you want to use forward slashes in the path (i.e `\` instead of `/`), you need to 'escape' them (use a double slash, like `\\`).

By default, node-artemis won't show anything on the terminal while running. If you want to enable debug messages to see what's happening, set the `DEBUG` environment variable to `artemis:*`. On Windows, you can do this with the `set` command:

	set DEBUG=artemis:*

Now, run `artemis` in the terminal, and a vanilla instance of node-artemis will start (vanilla meaning default configuration and gameplay). Enjoy!

## Why?

One of the original inspirations for node-artemis was to create an MMO Artemis server where groups of players could interact with a real-time world including AI civilisations and 'random encounters'. A further catalyst for the idea was many of the posts in the ['development' section](http://artemis.forumchitchat.com/?forum=309504) of the [Artemis forum](http://artemis.forumchitchat.com/) with suggestions for new improvements or better scripting. What if there was a custom server that let you have full control over gameplay? Instead of asking to add new things to the game, people could do it themselves with node-artemis and use it wherever they wanted.

node-artemis was never meant to be a replacement for the stock Artemis server, and it never will be. It is _not_ a project to reverse-engineer the engine. Rather it is a project to create a server with behaviour _similar_ to the server, but developed with open-source governance in mind.

For all those people wondering about legalities and whatnot, I'm releasing/working on this in a way similar to ArtClientLib. If Thom (the creator of Artemis) or another official developer asks me to stop, I will stop. Additionally, as I have said, node-artemis is designed for a different purpose than the stock Artemis server. Thom has made it pretty clear that the stock server is mainly made for games over LAN, so node-artemis is designed to fill the gap, not provide a means to play the game using unnofficial clients and a server. node-artemis is meant to be a server in a similar way to how Glitter is a client: it will never provide the entire game as it is in the stock server. I'm sure it would be possible for someone to do that using node-artemis, but node-artemis itself will not be a complete impersonation of the stock server. That was and is never one of its goals.

node-artemis will always need the data files from Artemis to run. You can't even connect to the server if the server doesn't have them. Just like the Artemis installer, these data files shouldn't be given to people who don't own the game.

## Credit

Without the awesome work of many people, this project would not be possible. Here are just some of the projects that were incredibly useful when creating this software:

 - **ArtClientLib** for the amazing work in documenting most of the packet protocol.
 - **Artemis Glitter** for the network encoding/decoding systems to translate to and from Artemis' formats.
 - **Lodash** for making things simple.
 - **Bluebird** for the awesome promise library that it is.

## License

node-artemis is licensed under the MIT license, but also includes code licensed under the "Beer-ware license". Both of these licenses are included below.

The MIT License (MIT)

Copyright (c) 2015 Tom Barham

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

```
----------------------------------------------------------------------------
"THE BEER-WARE LICENSE":
<ivan@sanchezortega.es> wrote this file. As long as you retain this notice you
can do whatever you want with this stuff. If we meet some day, and you think
this stuff is worth it, you can buy me a beer in return.
----------------------------------------------------------------------------
```
