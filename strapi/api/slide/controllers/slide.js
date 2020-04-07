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
          }).use(require('markdown-it-imsize'), { autofill: true });
        var transform = _.sortBy(_.map(steps, (step) => {
            return {
                id: step.name.replace(' ','-'),
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
        var fn = jade.compile(template, {
            
        });
        return fn({
            slide: await strapi.services.slide.findOne(1),
            steps: transform,
            css: [
                "/impress/css/impress-demo.css",
                "/impress/css/impress-common.css",
                "//fonts.googleapis.com/css?family=Open+Sans:regular,semibold,italic,italicsemibold|PT+Sans:400,700,400italic,700italic|PT+Serif:400,700,400italic,700italic"
            ],
            scripts: [
                "/impress/js/impress.js"
            ]
        });
    },
};

const template = `
html(lang="en")
  head
    title= "sample slide"
    each val in css
        link(rel="stylesheet", href=val)
  body
    div(id='impress',data-transition-duration=slide.duration,data-width=slide.width,data-height=slide.height,data-max-scale=slide.maxScale,data-min-scale=slide.minScale,data-perspective=slide.perspective,data-autoplay=slide.autoplay)
        each val in steps
            div(id=val.id,class=val.class,data-x=val.x,data-y=val.y,data-z=val.z,data-scale=val.scale,data-rotate=val.rotate,data-rotate-x=val.rotateX,data-rotate-y=val.rotateY)!= val.html
    div(id='impress-toolbar')
    div(id='impress-help')
    each val in scripts
        script(type='text/javascript', src=val)
    script='impress().init();'
`;

const header = `
<!doctype html>

<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Classic Slides with impress.js | Simple example impress.js slide show | by Henrik Ingo @henrikingo</title>
    
    <meta name="description" content="Simple example impress.js slide show" />
    <meta name="author" content="Henrik Ingo" />

    <link rel="stylesheet" href="../../extras/highlight/styles/github.css">
    <link rel="stylesheet" href="../../extras/mermaid/mermaid.forest.css">

    <link href="..\..\css\impress-common.css" rel="stylesheet" />
    <link href="css/classic-slides.css" rel="stylesheet" />
</head>

<body class="impress-not-supported">
<!--
    This fallback message is only visible when there is impress-not-supported class on body.
-->
<div class="fallback-message">
    <p>Your browser <b>doesn't support the features required</b> by impress.js, so you are presented with a simplified version of this presentation.</p>
    <p>For the best experience please use the latest <b>Chrome</b>, <b>Safari</b> or <b>Firefox</b> browser.</p>
</div>

<!--
    This is the core element used by impress.js: the wrapper for your presentation steps. 
    In this element all the impress.js magic happens.
    
    data-transition-duration sets the time in microseconds that is used for the
    animation when transtitioning between slides.
    
    The width, height, scale and perspective options define a target screen size that you should
    design your CSS against. impress.js will automatically scale all content to different screen
    sizes. See DOCUMENTATION.md for details. Below, I have targeted full HD screen resolution.
    
    data-autoplay can be used to set the time in seconds, after which presentation
    automatically moves to next slide. It can also be set individually for each
    slide, but here we just set a common duration for all slides.
-->
<div id="impress"
    data-transition-duration="1000"

    data-width="1920"
    data-height="1080"
    data-max-scale="3"
    data-min-scale="0"
    data-perspective="1000"

    data-autoplay="10">
    <div class="step slide title" data-x="-2200" data-y="-3000">
        <h1>Example Presentation: <br />
            Classic Slides</h1>
        <h2>Henrik Ingo</h2>
        <h3>2015</h3>

        <div class="notes">
        Any element with the class="notes" will not be displayed. This can
        be used for speaker notes. In fact, the impressConsole plugin will
        show it in the speaker console!
        </div>
    </div>
    <div class="step slide title" data-x="-2200" data-y="-3000">
        <h1>Example Presentation: <br />
            Classic Slides</h1>
        <h2>Henrik Ingo</h2>
        <h3>2015</h3>

        <div class="notes">
        Any element with the class="notes" will not be displayed. This can
        be used for speaker notes. In fact, the impressConsole plugin will
        show it in the speaker console!
        </div>
    </div>
    <div class="step slide title" data-x="-2200" data-y="-3000">
        <h1>Example Presentation: <br />
            Classic Slides</h1>
        <h2>Henrik Ingo</h2>
        <h3>2015</h3>

        <div class="notes">
        Any element with the class="notes" will not be displayed. This can
        be used for speaker notes. In fact, the impressConsole plugin will
        show it in the speaker console!
        </div>
    </div>
`;

const footer = `
    </div>

<!--
    Add navigation-ui controls: back, forward and a select list.
    Add a progress indicator bar (current step / all steps)
    Add the help popup plugin
-->
<div id="impress-toolbar"></div>

<div class="impress-progressbar"><div></div></div>
<div class="impress-progress"></div>

<div id="impress-help"></div>

<!-- Extra modules
     Load highlight.js, mermaid.js, markdown.js and MathJax.js from extras.
     If you're curious about details, these are initialized in src/plugins/extras/extras.js -->
<script type="text/javascript" src="../../extras/highlight/highlight.pack.js"></script>
<script type="text/javascript" src="https://raw.githubusercontent.com/impress/impress-extras/6230c2ff1060f49eedc4ed1d1b8eec7eb30b8ef5/mermaid/mermaid.min.js"></script>
<script type="text/javascript" src="https://raw.githubusercontent.com/impress/impress-extras/6230c2ff1060f49eedc4ed1d1b8eec7eb30b8ef5/markdown/markdown.js"></script>
<script type="text/javascript" src="../../extras/mathjax/MathJax.js?config=TeX-AMS_CHTML"></script>
<!--
    To make all described above really work, you need to include impress.js in the page.
    You also need to call a impress().init() function to initialize impress.js presentation.
    And you should do it in the end of your document. 
-->
<script type="text/javascript" src="https://cdn.tutorialjinni.com/impress.js/0.5.3/impress.min.js"></script>
<script>console.log('init'); impress().init();</script>

</body>
</html>
;
`;
