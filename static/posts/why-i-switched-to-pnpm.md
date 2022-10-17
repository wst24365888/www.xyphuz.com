---
title: Why I switched to pnpm?
description: The reason why pnpm is an awesome alternative to npm/yarn!
date: 2022-10-17
tags: ["pnpm"]
---

## What is `pnpm`?

*A `node` package manager, an awesome alternative to `npm`/`yarn`!*


## Why `pnpm`

- Fast
- Save Disk Space
- Strict


## How fast `pnpm` is?

For most of the actions, `pnpm` is about 2x fast than `npm`/`yarn`!

![](https://i.imgur.com/WgViGrM.png)

![](https://pnpm.io/img/benchmarks/alotta-files.svg)


### Why is `pnpm` so fast?

There is no blocking stages of installation in `pnpm`.

> *Each dependency has its own stages and the next stage starts as soon as possible.*

![](https://pnpm.io/assets/images/installation-stages-of-other-pms-0933800341e399b76e0d33b2a0c7a312.png)

![](https://pnpm.io/assets/images/installation-stages-of-pnpm-92606757de93a7535153ade5a829dff4.jpg)


## What About Disk Space?

You may have seen some memes about `node_modules` size.

![](https://i.imgur.com/YXAylI3.png)

![](https://i.imgur.com/4h0Ptg7.png)

![](https://i.imgur.com/UI5aIYW.png)

Disk space is a big problem for `npm`/`yarn` users.

And this is the slogan from `pnpm`:

> Saving disk space and boosting installation speed

Why `pnpm` saves disk space?

Before this, let's talk about `node_modules` structure in `npm`/`yarn`.


### Dependency (`node_modules`) Structure of `npm`/`yarn`

Before `npm v3`, you can see if you have multiple packages that depend on the same package, it will be installed multiple times.

```bash {4,7,10,13}
node_modules
├── A@1.0.0
│   └── node_modules
│       └── B@1.0.0
│       └── C@1.0.0
│            └── node_modules
│                └── B@1.0.0
├── C@1.0.0
│   └── node_modules
│       └── B@2.0.0
└── D@1.0.0
    └── node_modules
        └── B@1.0.0
```

That seems to be quite a waste of disk space, right?

So, **flat** `node_modules` structure is used in 
`npm` (after `v3`) and `yarn`.

Now, let's say we want to import `A`, which requires `B v1.0`.

![](https://i.imgur.com/Ap9S8LQ.png)

Then, we want to import another module `C`. 

`C` requires `B v2.0`, but at another version than `A`, which requires `B v1.0`.

However, since `B v1.0` is already a top-level dep, we cannot install `B v2.0` as a top level dependency. 

`npm v3` handles this by defaulting to `npm v2` behavior and nesting the new, different, module `B` version dependency under the module that requires it -- in this case, module `C`.

![](https://imgur.com/ZP8Adf2.png)

After that, we want to import `D` which requires `B v1.0`.

![](https://imgur.com/0TBMouq.png)

So, what if we manually upgrade `A`?

![](https://imgur.com/zn03cBh.png)

What happened if we make a clean install with same `package.json`?

![](https://imgur.com/LpwtSO6.png)

Same dependencies but not same directory structure, which is ***non-deterministic***.


### Dependency (`node_modules`) Structure of `pnpm`

Let's create two directories and run `npm add express` in one of them and `pnpm add express` in the other one. 

Here's the top of what you get in the `npm` directory's `node_modules`:

```bash
.
├── .bin
├── accepts
├── array-flatten
├── body-parser
├── bytes
├── content-disposition
├── content-type
├── cookie
├── cookie-signature
├── debug
├── depd
├── destroy
├── ee-first
├── encodeurl
├── escape-html
├── etag
├── express
├── finalhandler
├── forwarded
├── fresh
├── http-errors
├── iconv-lite
├── inherits
├── ipaddr.js
├── media-typer
├── merge-descriptors
├── methods
├── mime
├── mime-db
├── mime-types
├── ms
├── negotiator
├── on-finished
├── parseurl
├── path-to-regexp
├── proxy-addr
├── qs
├── range-parser
├── raw-body
├── safe-buffer
├── send
├── serve-static
├── setprototypeof
├── statuses
├── type-is
├── unpipe
├── utils-merge
└── vary
```

Since it's flat, users have access to all the dependencies, **including those they are not installed**.

> *It's dangerous to have access to those dependencies that you're not installing.*

Here is what `pnpm` version looks like:

```bash
.
└── .modules.yaml
└── .pnpm
└── express
```

You'll find that `express` is a symlink to 
`node_modules/.pnpm/express@4.17.1/node_modules/express`.

```bash {19,23-24,26-27,36-37}
.
├── .modules.yaml
├── .pnpm
│   ├── accepts@1.3.7
│   ├── array-flatten@1.1.1
│   ├── body-parser@1.19.0
│   ├── bytes@3.1.0
│   ├── content-disposition@0.5.3
│   ├── content-type@1.0.4
│   ├── cookie-signature@1.0.6
│   ├── cookie@0.4.0
│   ├── debug@2.6.9
│   ├── depd@1.1.2
│   ├── destroy@1.0.4
│   ├── ee-first@1.1.1
│   ├── encodeurl@1.0.2
│   ├── escape-html@1.0.3
│   ├── etag@1.8.1
│   ├── express@4.17.1  <-- LOCATED HERE
│   ├── finalhandler@1.1.2
│   ├── forwarded@0.1.2
│   ├── fresh@0.5.2
│   ├── http-errors@1.7.2  <-- NOTE
│   ├── http-errors@1.7.3  <-- NOTE
│   ├── iconv-lite@0.4.24
│   ├── inherits@2.0.3  <-- NOTE
│   ├── inherits@2.0.4  <-- NOTE
│   ├── ipaddr.js@1.9.1
│   ├── lock.yaml
│   ├── media-typer@0.3.0
│   ├── merge-descriptors@1.0.1
│   ├── methods@1.1.2
│   ├── mime-db@1.44.0
│   ├── mime-types@2.1.27
│   ├── mime@1.6.0
│   ├── ms@2.0.0  <-- NOTE
│   ├── ms@2.1.1  <-- NOTE
│   ├── negotiator@0.6.2
│   ├── node_modules
│   ├── on-finished@2.3.0
│   ├── parseurl@1.3.3
│   ├── path-to-regexp@0.1.7
│   ├── proxy-addr@2.0.6
│   ├── qs@6.7.0
│   ├── range-parser@1.2.1
│   ├── raw-body@2.4.0
│   ├── safe-buffer@5.1.2
│   ├── safer-buffer@2.1.2
│   ├── send@0.17.1
│   ├── serve-static@1.14.1
│   ├── setprototypeof@1.1.1
│   ├── statuses@1.5.0
│   ├── toidentifier@1.0.0
│   ├── type-is@1.6.18
│   ├── unpipe@1.0.0
│   ├── utils-merge@1.0.1
│   └── vary@1.1.2
└── express
```

Structure inside `.pnpm` is ***truly*** flat.

```bash {11-17}
.
├── .modules.yaml
├── .pnpm
│   ├── accepts@1.3.7
│   ...
│   ├── express@4.17.1
│   ├   └── node_modules
│   ├       ├── accepts
│   ├       ...
│   ├       ├── etag
│   ├       ├── express <-- SYMLINK TO HERE
│   ├       │   ├── History.md
│   ├       │   ├── LICENSE
│   ├       │   ├── Readme.md
│   ├       │   ├── index.js
│   ├       │   ├── lib
│   ├       │   └── package.json
│   ├       ├── finalhandler
│   ├       ...
│   ├       └── vary
│   ├── finalhandler@1.1.2
│   ...
│   └── vary@1.1.2
└── express
```

You might ask: still, where is the `node_modules`! 

> *The second trick of `pnpm`'s `node_modules` structure is that the dependencies of packages are on the same directory level on which the real location of the dependent package.*

So, we can see that dependencies of express are not in `.pnpm/express@4.17.1/node_modules/express/node_modules/` but in `.pnpm/express@4.17.1/node_modules/`:

```bash {7-38}
.
├── .modules.yaml
├── .pnpm
│   ├── accepts@1.3.7
│   ...
│   ├── express@4.17.1
│   │   └── node_modules
│   │       ├── accepts
│   │       ├── array-flatten
│   │       ├── body-parser
│   │       ├── content-disposition
│   │       ├── content-type
│   │       ├── cookie
│   │       ├── cookie-signature
│   │       ├── debug
│   │       ├── depd
│   │       ├── encodeurl
│   │       ├── escape-html
│   │       ├── etag
│   │       ├── express  <-- What WE'VE SAW
│   │       ├── finalhandler
│   │       ├── fresh
│   │       ├── merge-descriptors
│   │       ├── methods
│   │       ├── on-finished
│   │       ├── parseurl
│   │       ├── path-to-regexp
│   │       ├── proxy-addr
│   │       ├── qs
│   │       ├── range-parser
│   │       ├── safe-buffer
│   │       ├── send
│   │       ├── serve-static
│   │       ├── setprototypeof
│   │       ├── statuses
│   │       ├── type-is
│   │       ├── utils-merge
│   │       └── vary
│   ├── finalhandler@1.1.2
│   ...
│   └── vary@1.1.2
└── express
```


#### Symlinked `node_modules` Structure

Let's say you install `foo@1.0.0` that depends on `bar@1.0.0`. `pnpm` will ***hard link*** both packages to node_modules like this:

```bash {5,8}
node_modules
└── .pnpm
    ├── bar@1.0.0
    │   └── node_modules
    │       └── bar -> <store>/bar
    └── foo@1.0.0
        └── node_modules
            └── foo -> <store>/foo
```

Then, `bar` is going to be symlinked to the `foo@1.0.0/node_modules` folder.

```diff-bash
	node_modules
	└── .pnpm
	    ├── bar@1.0.0
	    │   └── node_modules
	    │       └── bar -> <store>/bar
	    └── foo@1.0.0
	        └── node_modules
	            └── foo -> <store>/foo
+	            └── bar -> ../../bar@1.0.0/node_modules/bar
```

Then `foo` is going to be symlinked into the root `node_modules` folder because `foo` is a dependency of the project.

```diff-bash
    node_modules
+   ├── foo -> ./.pnpm/foo@1.0.0/node_modules/foo
    └── .pnpm
        ├── bar@1.0.0
        │   └── node_modules
        │       └── bar -> <store>/bar
        └── foo@1.0.0
            └── node_modules
                └── foo -> <store>/foo
                └── bar -> ../../bar@1.0.0/node_modules/bar
```

Finally, `foo` can be reached by user.

And, ***only*** `foo` can be reached!

## Trade-off of Switching to `pnpm`

`pnpm` supports almost everything you've used in `npm` and `yarn`!

![](https://i.imgur.com/oxDgjEd.png)

```bash
# Manage dependencies
pnpm add <pkg>
pnpm install
pnpm update
pnpm remove
pnpm link
pnpm unlink
pnpm import
pnpm rebuild
pnpm prune
pnpm fetch
pnpm install-test
pnpm patch <pkg>
pnpm patch-commit <path>
# Review dependencies
pnpm audit
pnpm list
pnpm outdated
pnpm why
Run scripts
pnpm run
pnpm test
pnpm exec
pnpm dlx
pnpm create
pnpm start
# Manage environments
pnpm env <cmd>
# Misc.
pnpm publish
pnpm pack
pnpm -r, --recursive
pnpm server
pnpm store
pnpm root
pnpm bin
pnpm setup
pnpm init
pnpm deploy
```

And yeah, `pnpm` can even use to manage node version!

```bash
pnpm env use --global lts
pnpm env use --global lateset
```

Btw, `node 18.x` is going to be lts version soon!

![](https://i.imgur.com/DHXrOU0.png)


## References

- <https://pnpm.io/>
- <https://pnpm.io/blog/2020/05/27/flat-node-modules-is-not-the-only-way>
- <https://github.com/zkochan/comparing-node-modules>
- <http://man.hubwiz.com/docset/npm.docset/Contents/Resources/Documents/how-npm-works/npm3.html>