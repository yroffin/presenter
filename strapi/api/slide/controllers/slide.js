'use strict';
const fs = require('fs');
const _ = require('lodash');
const Mustache = require('mustache');

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    impress: async ctx => {
        function base64_encode(file) {
            // read binary data
            var binary = fs.readFileSync(file);
            // convert binary data to base64 encoded string
            return new Buffer(binary).toString('base64');
        }
        var slide = await strapi.services.slide.findOne(parseInt(ctx.query.id));
        var steps = slide.steps;
        var md = require('markdown-it')({
            html: true,
            linkify: true,
            typography: true
        })
            .use(require('markdown-it-imsize'), { autofill: true })
            .use(require('markdown-it-drawio-viewer'), {});
        var transform = await Promise.all(_.map(steps, async (reference, indice) => {
            let find = await strapi.query('step').find({ name: reference.name });
            if (find.length > 0) {
                var step = find[0];
                return {
                    title: step.title ? step.title : 'default',
                    html: step.body ? md.render(step.body ? step.body : '') : step.raw,
                    parameters: {
                        'id': function () {
                            return `id="${step.name.replace(' ', '-')}-${indice}"`;
                        },
                        'class': function () {
                            return reference.class ? `class="${reference.class}"` : 'class="step slide"';
                        },
                        'scale': function () {
                            return reference.scale ? 'data-scale=' + reference.scale : '';
                        },
                        'rotate': function () {
                            return reference.rotate ? 'data-rotate=' + reference.rotate : '';
                        },
                        'rotate-x': function () {
                            return reference["rotate-x"] ? 'data-rotate-x=' + reference["rotate-x"] : '';
                        },
                        'rotate-y': function () {
                            return reference["rotate-y"] ? 'data-rotate-y=' + reference["rotate-y"] : '';
                        },
                        'x': function () {
                            return reference.x ? 'data-x=' + reference.x : '';
                        },
                        'y': function () {
                            return reference.y ? 'data-y=' + reference.y : '';
                        },
                        'z': function () {
                            return reference.z ? 'data-z=' + reference.z : '';
                        },
                        'rel-x': function () {
                            return reference["rel-x"] ? 'data-rel-x=' + reference["rel-x"] : '';
                        },
                        'rel-y': function () {
                            return reference["rel-y"] ? 'data-rel-y=' + reference["rel-y"] : '';
                        },
                        'rel-z': function () {
                            return reference["rel-z"] ? 'data-rel-z=' + reference["rel-z"] : '';
                        }
                    }
                }
            }
        }));
        var html = Mustache.render(`
<html lang="en" style="height: 100%;">

<head>
    <title>sample slide</title>
    {{#cssBase64}}
    <link rel="stylesheet" href="data:text/css;charset=utf-8;base64,{{.}}">
    {{/cssBase64}}
    {{#css}}
    <link rel="stylesheet" href="{{.}}">
    {{/css}}
    <style type="text/css">
        {{#styles}}
        {{name}} {
            {{body}}
        }
        {{/styles}}
    </style>
</head>

<body>
    <div
        id="impress"
        data-transition-duration="{{slide.duration}}"
        data-width="{{slide.width}}"
        data-height="{{slide.height}}"
        data-max-scale="{{slide.maxScale}}"
        data-min-scale="{{slide.minScale}}"
        data-perspective="{{slide.perspective}}"
        data-autoplay="{{slide.autoplay}}">
        {{#steps}}
            <div
                {{{parameters.id}}}
                {{{parameters.class}}}
                {{{parameters.scale}}}
                {{{parameters.rotate}}}
                {{{parameters.rotate-x}}}
                {{{parameters.rotate-y}}}
                {{{parameters.x}}}
                {{{parameters.y}}}
                {{{parameters.z}}}
                {{{parameters.rel-x}}}
                {{{parameters.rel-y}}}
                {{{parameters.rel-z}}}>
                {{{html}}}
            </div>
        {{/steps}}
    </div>
    <div id="impress-toolbar"></div>
    <div id="impress-help"></div>
    {{#scriptsBase64}}
    <script type="text/javascript" src="data:text/javascript;charset=utf-8;base64,{{.}}"></script>
    {{/scriptsBase64}}
    {{#scripts}}
    <script type="text/javascript" src="{{.}}"></script>
    {{/scripts}}
    <script>impress().init();</script>
    <script>setTimeout(function () { GraphViewer.processElements(); }, 1000);</script>
</body>

</html>
`, {
            slide: slide,
            styles: slide.styles,
            steps: transform,
            cssBase64: [
                base64_encode("public/impress/css/impress-demo.css"),
                base64_encode("public//impress/css/impress-common.css")
            ],
            css: [
                "//fonts.googleapis.com/css?family=Roboto"
            ],
            scriptsBase64: [
                base64_encode("public/impress/js/impress.js")
            ],
            scripts: [
                "//www.draw.io/js/viewer.min.js"
            ]
        });
        return html;
    },
};
