'use strict';
const _ = require('lodash');
const jade = require('jade');

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    impress: async ctx => {
        var slide = await strapi.services.slide.findOne(parseInt(ctx.query.id));
        var steps = slide.steps;
        var md = require('markdown-it')({
            html: true,
            linkify: true,
            typography: true
        })
            .use(require('markdown-it-imsize'), { autofill: true })
            .use(require('markdown-it-drawio-viewer'), {});
        var transform = _.sortBy(_.map(steps, (step) => {
            return {
                id: step.name.replace(' ', '-'),
                title: step.title,
                html: md.render(step.body ? step.body : ''),
                class: step.class ? step.class : 'step slide',
                x: step.x ? step.x : 0,
                y: step.y ? step.y : 0,
                z: step.z ? step.z : 0,
                scale: step.scale ? step.scale : 1,
                rotate: step.rotate ? step.rotate : 0,
                rotateX: step.rotateX ? step.rotateX : 0,
                rotateY: step.rotateY ? step.rotateY : 0,
                weight: _.findIndex(slide.liste, (item) => {
                    return item === step.name
                })
            }
        }), (item) => item.weight);
        var fn = jade.compile(`
html(lang="en")
    head
    title= "sample slide"
    each val in css
        link(rel="stylesheet", href=val)
    style(type='text/css')
        each val in styles
            != val.name + '{'
                != val.body
            != '}'
    body
    div(id='impress',data-transition-duration=slide.duration,data-width=slide.width,data-height=slide.height,data-max-scale=slide.maxScale,data-min-scale=slide.minScale,data-perspective=slide.perspective,data-autoplay=slide.autoplay)
        each val in steps
            h1= val.title
            div(align='center',id=val.id,class=val.class,data-x=val.x,data-y=val.y,data-z=val.z,data-scale=val.scale,data-rotate=val.rotate,data-rotate-x=val.rotateX,data-rotate-y=val.rotateY)!= val.html
    div(id='impress-toolbar')
    div(id='impress-help')
    each val in scripts
        script(type='text/javascript', src=val)
    script='impress().init();'
    script='setTimeout(function() {GraphViewer.processElements();}, 1000);'
`, {

        });
        return fn({
            slide: await strapi.services.slide.findOne(1),
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
