'use strict';
const _ = require('lodash');
const Mustache = require('mustache');

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    impress: async ctx => {
        var slide = await strapi.services.slide.findOne(parseInt(ctx.query.id));
        var steps = slide.liste;
        var md = require('markdown-it')({
            html: true,
            linkify: true,
            typography: true
        })
            .use(require('markdown-it-imsize'), { autofill: true })
            .use(require('markdown-it-drawio-viewer'), {});
        var transform = await Promise.all(_.map(steps, async (reference, name) => {
            let find = await strapi.query('step').find({ name: name });
            if (find.length > 0) {
                var step = find[0];
                return {
                    title: step.title ? step.title : 'default',
                    html: step.body ? md.render(step.body ? step.body : '') : step.raw,
                    parameters: {
                        'id': function() {
                            return 'id=' + step.name.replace(' ', '-');
                        },
                        'class': function() {
                            return step.class ? `class="${step.class}"` + step.class : 'class="step slide"';
                        },
                        'scale': function() {
                            return reference.scale ? 'data-scale=' + reference.scale : '';
                        },
                        'rotate': function() {
                            return reference.rotate ? 'data-rotate=' + reference.rotate : '';
                        },
                        'rotate-x': function() {
                            return reference["rotate-x"] ? 'data-rotate-x=' + reference["rotate-x"] : '';
                        },
                        'rotate-y': function() {
                            return reference["rotate-y"] ? 'data-rotate-y=' + reference["rotate-y"] : '';
                        },
                        'x': function() {
                            return reference.x ? 'data-x=' + reference.x : '';
                        },
                        'y': function() {
                            return reference.y ? 'data-y=' + reference.y : '';
                        },
                        'z': function() {
                            return reference.z ? 'data-z=' + reference.z : '';
                        },
                        'rel-x': function() {
                            return reference["rel-x"] ? 'data-rel-x=' + reference["rel-x"] : '';
                        },
                        'rel-y': function() {
                            return reference["rel-y"] ? 'data-rel-y=' + reference["rel-y"] : '';
                        },
                        'rel-z': function() {
                            return reference["rel-z"] ? 'data-rel-z=' + reference["rel-z"] : '';
                        }
                    }
                }
            }
        }));
        return Mustache.render(`
<html lang="en" style="height: 100%;">

<head>
    <title>sample slide</title>
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
            css: [
                "/impress/css/impress-demo.css",
                "/impress/css/impress-common.css",
                "//fonts.googleapis.com/css?family=Roboto"
            ],
            scripts: [
                "/impress/js/impress.js",
                "//www.draw.io/js/viewer.min.js"
            ]
        });
    },
};
