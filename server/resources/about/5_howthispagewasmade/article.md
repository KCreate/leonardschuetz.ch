# How this page was made
## v. 0.1

The source code of this page is available on my [GitHub Profile](https://github.com/KCreate/leonardschuetz.ch).

# Front-End
The front-end was made using [ReactJS](https://facebook.github.io/react/). I'm using Webpack together with Babel to compile the ES6 and bundle the modules.

The one component that kinda sticks out, is [DeferedContainerList](https://www.npmjs.com/package/deferedcontainerlist). I wrote it for this page specifically, but it can be used elsewhere at any time. It defers the rendering of react components, which allows me to have this page transition without having the need to write a lot of code.

# Back-End
In the backend lies a simple expressJS server with serves all the content directly from the file-system. Nothing too spectacular.
