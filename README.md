Rebas
===

Node runtime for [Saber](https://github.com/ecomfe/saber)，base on [Express](http://expressjs.com)

[Saber](https://github.com/ecomfe/saber) 的 node 运行环境，让您在享受 SPA 高內聚、低耦合开发方式的同时具有优秀的首屏呈现速度与良好的 SEO 。

## How

Rebas 使首屏渲染由服务器端完成，极大地降低了 SPA 首屏的白屏时间与 SEO 问题。借助于 node ，服务器端的渲染逻辑不用额外开发，只需要对现有的 Saber 应用进行小幅修改就能让已有的逻辑同时运行在客户端与服务器端。

Saber 所有的基础组件都进行了同构升级，确保所有模块都能同时运行在客户端与服务器端。对于业务开发只需聚焦业务逻辑，不用特别关注运行平台，剩下的一切就交给 Saber 与 Rebas 吧～

## Usage

请参考 [Getting start](doc/start.md) 从零开始快速构建同构应用

## API
