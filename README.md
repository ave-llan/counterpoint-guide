A visual and audio interface built on top of the [computational-counterpoint module](https://github.com/jrleszcz/counterpoint) for writing counterpoint. See a live example [here](http://musicmachine.io).

## Basic Usage
Add [counterpoint-guide.min.js](counterpoint-guide.min.js) to your project at the end of the body:
```html
<script type="text/javascript" src="counterpoint-guide.min.js"></script>
```

Then add the custom counterpoint element wherever you would like a guide:
```html
<counterpoint></counterpoint>
```
This will create a default guide in C major.  Every guide is independent and you can create as many as you like on a single page.
